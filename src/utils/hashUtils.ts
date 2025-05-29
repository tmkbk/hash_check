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

export interface HashAnalysis {
  distribution: Record<string, number>;
  entropy: number;
  zeros: number;
  ones: number;
  avalancheEffect: number;
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
    let hash = '';

    switch (config.algorithm) {
      case 'md5':
        hash = CryptoJS.MD5(sanitizedText).toString();
        break;
      case 'sha1':
        hash = CryptoJS.SHA1(sanitizedText).toString();
        break;
      case 'sha256':
        hash = CryptoJS.SHA256(sanitizedText).toString();
        break;
      case 'sha512':
        hash = CryptoJS.SHA512(sanitizedText).toString();
        break;
      default:
        throw new Error('不支持的哈希算法');
    }

    const endTime = performance.now();

    return {
      hash,
      algorithm: config.algorithm,
      timestamp: new Date(),
      inputType: 'text',
      processingTime: endTime - startTime
    };
  }

  static analyzeHash(hash: string): HashAnalysis {
    // 计算字符分布
    const distribution: Record<string, number> = {};
    for (const char of hash) {
      distribution[char] = (distribution[char] || 0) + 1;
    }

    // 计算熵值
    const entropy = Object.values(distribution).reduce((acc, count) => {
      const p = count / hash.length;
      return acc - p * Math.log2(p);
    }, 0);

    // 计算0和1的比例（二进制视图）
    const binaryString = hash
      .split('')
      .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
      .join('');

    const zeros = binaryString.split('0').length - 1;
    const ones = binaryString.split('1').length - 1;

    // 计算雪崩效应（相邻位的差异）
    let diffCount = 0;
    for (let i = 1; i < binaryString.length; i++) {
      if (binaryString[i] !== binaryString[i - 1]) {
        diffCount++;
      }
    }
    const avalancheEffect = (diffCount / (binaryString.length - 1)) * 100;

    return {
      distribution,
      entropy,
      zeros,
      ones,
      avalancheEffect
    };
  }

  static compareHashes(
    hash1: string,
    hash2: string
  ): {
    diffCount: number;
    diffPositions: number[];
    diffPercentage: number;
  } {
    const diffPositions: number[] = [];
    let diffCount = 0;

    // 转换为二进制进行比较
    const binary1 = hash1
      .split('')
      .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
      .join('');

    const binary2 = hash2
      .split('')
      .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
      .join('');

    for (let i = 0; i < binary1.length; i++) {
      if (binary1[i] !== binary2[i]) {
        diffCount++;
        diffPositions.push(i);
      }
    }

    return {
      diffCount,
      diffPositions,
      diffPercentage: (diffCount / binary1.length) * 100
    };
  }

  static validateHash(hash: string, algorithm: string): boolean {
    const expectedLength = {
      md5: 32,
      sha1: 40,
      sha256: 64,
      sha512: 128
    }[algorithm];

    if (!expectedLength) {
      return false;
    }

    if (hash.length !== expectedLength) {
      return false;
    }

    // 验证是否只包含有效的十六进制字符
    return /^[0-9a-f]+$/i.test(hash);
  }

  static async generateTestVectors(
    input: string,
    algorithm: string
  ): Promise<{
    original: { input: string; hash: string };
    variants: Array<{ input: string; hash: string; description: string }>;
  }> {
    const variants = [
      { input: input + ' ', description: '添加空格' },
      { input: input.toUpperCase(), description: '转换为大写' },
      { input: input.toLowerCase(), description: '转换为小写' },
      { input: input.split('').reverse().join(''), description: '反转字符串' },
      { input: input + input, description: '重复字符串' }
    ];

    const originalHash = await this.calculateTextHash(input, {
      algorithm: algorithm as HashConfig['algorithm']
    });
    const variantHashes = await Promise.all(
      variants.map(async (variant) => ({
        ...variant,
        hash: (
          await this.calculateTextHash(variant.input, {
            algorithm: algorithm as HashConfig['algorithm']
          })
        ).hash
      }))
    );

    return {
      original: { input, hash: originalHash.hash },
      variants: variantHashes
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
