import CryptoJS from 'crypto-js';

interface HashWorkerData {
  content: string;
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  encoding: 'hex' | 'base64';
}

/**
 * 定义支持的哈希算法及其对应的CryptoJS实现
 * 
 * 包含以下算法：
 * - md5: 使用CryptoJS.MD5
 * - sha1: 使用CryptoJS.SHA1
 * - sha256: 使用CryptoJS.SHA256
 * - sha512: 使用CryptoJS.SHA512
 */
const HASH_ALGORITHMS = {
  md5: CryptoJS.MD5,
  sha1: CryptoJS.SHA1,
  sha256: CryptoJS.SHA256,
  sha512: CryptoJS.SHA512
} as const;

self.onmessage = (e: MessageEvent<HashWorkerData>) => {
  try {
    const { content, algorithm, encoding } = e.data;
    const hashFunc = HASH_ALGORITHMS[algorithm];
    const hash = hashFunc(content).toString(
      encoding === 'base64' ? CryptoJS.enc.Base64 : CryptoJS.enc.Hex
    );

    self.postMessage({ hash, error: null });
  } catch (error) {
    self.postMessage({
      hash: null,
      error: error instanceof Error ? error.message : '计算哈希值时发生错误'
    });
  }
};

export {};
