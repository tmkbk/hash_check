import CryptoJS from 'crypto-js';

export interface HashConfig {
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  encoding?: 'hex' | 'base64';
}

export interface HashResult {
  hash: string;
  algorithm: string;
  timestamp: Date;
  inputType: 'text' | 'file';
  filename?: string;
  fileSize?: number;
  processingTime?: number;
}

export const HASH_ALGORITHMS = {
  md5: CryptoJS.MD5,
  sha1: CryptoJS.SHA1,
  sha256: CryptoJS.SHA256,
  sha512: CryptoJS.SHA512
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 增加到50MB
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/json',
  'text/markdown',
  'text/csv',
  'text/html',
  'text/javascript',
  'text/typescript',
  'application/xml'
];

export class HashService {
  private static worker: Worker | null = null;

  private static initWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../workers/hashWorker.ts', import.meta.url),
        {
          type: 'module'
        }
      );
    }
    return this.worker;
  }

  private static async calculateWithWorker(
    content: string,
    config: HashConfig
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const worker = this.initWorker();

      const handleMessage = (e: MessageEvent) => {
        worker.removeEventListener('message', handleMessage);
        if (e.data.error) {
          reject(new Error(e.data.error));
        } else {
          resolve(e.data.hash);
        }
      };

      worker.addEventListener('message', handleMessage);
      worker.postMessage({
        content,
        algorithm: config.algorithm,
        encoding: config.encoding || 'hex'
      });
    });
  }

  static validateFile(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`文件大小不能超过${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    if (
      !ALLOWED_FILE_TYPES.includes(file.type) &&
      !file.name.match(/\.(txt|json|md|csv|html|js|ts|xml)$/)
    ) {
      throw new Error('不支持的文件格式');
    }
  }

  static sanitizeInput(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim();
  }

  static async calculateFileHash(
    file: File,
    config: HashConfig
  ): Promise<HashResult> {
    this.validateFile(file);
    const startTime = performance.now();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const hash = await this.calculateWithWorker(content, config);
          const endTime = performance.now();

          resolve({
            hash,
            algorithm: config.algorithm,
            timestamp: new Date(),
            inputType: 'file',
            filename: file.name,
            fileSize: file.size,
            processingTime: endTime - startTime
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  static async calculateTextHash(
    text: string,
    config: HashConfig
  ): Promise<HashResult> {
    const sanitizedText = this.sanitizeInput(text);
    if (!sanitizedText) {
      throw new Error('输入内容不能为空');
    }

    const startTime = performance.now();
    const hash = await this.calculateWithWorker(sanitizedText, config);
    const endTime = performance.now();

    return {
      hash,
      algorithm: config.algorithm,
      timestamp: new Date(),
      inputType: 'text',
      processingTime: endTime - startTime
    };
  }

  static async calculateBatchFiles(
    files: File[],
    config: HashConfig,
    onProgress?: (progress: number) => void
  ): Promise<HashResult[]> {
    const results: HashResult[] = [];
    let processedCount = 0;

    for (const file of files) {
      try {
        const result = await this.calculateFileHash(file, config);
        results.push(result);
        processedCount++;

        if (onProgress) {
          onProgress((processedCount / files.length) * 100);
        }
      } catch (error) {
        console.error(`处理文件 ${file.name} 时出错:`, error);
      }
    }
    return results;
  }

  // 清理资源
  static cleanup(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
