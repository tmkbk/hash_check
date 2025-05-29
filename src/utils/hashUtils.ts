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
}

export const HASH_ALGORITHMS = {
  md5: CryptoJS.MD5,
  sha1: CryptoJS.SHA1,
  sha256: CryptoJS.SHA256,
  sha512: CryptoJS.SHA512
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/json',
  'text/markdown'
];

export class HashService {
  static validateFile(file: File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`文件大小不能超过${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('仅支持文本文件格式');
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
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const hashFunc = HASH_ALGORITHMS[config.algorithm];
          const hash = hashFunc(content).toString(
            config.encoding === 'base64'
              ? CryptoJS.enc.Base64
              : CryptoJS.enc.Hex
          );

          resolve({
            hash,
            algorithm: config.algorithm,
            timestamp: new Date(),
            inputType: 'file',
            filename: file.name
          });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsText(file);
    });
  }

  static calculateTextHash(text: string, config: HashConfig): HashResult {
    const sanitizedText = this.sanitizeInput(text);
    if (!sanitizedText) {
      throw new Error('输入内容不能为空');
    }

    const hashFunc = HASH_ALGORITHMS[config.algorithm];
    const hash = hashFunc(sanitizedText).toString(
      config.encoding === 'base64' ? CryptoJS.enc.Base64 : CryptoJS.enc.Hex
    );

    return {
      hash,
      algorithm: config.algorithm,
      timestamp: new Date(),
      inputType: 'text'
    };
  }

  static async calculateBatchFiles(
    files: File[],
    config: HashConfig
  ): Promise<HashResult[]> {
    const results: HashResult[] = [];
    for (const file of files) {
      try {
        const result = await this.calculateFileHash(file, config);
        results.push(result);
      } catch (error) {
        console.error(`处理文件 ${file.name} 时出错:`, error);
      }
    }
    return results;
  }
}
