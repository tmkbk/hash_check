import CryptoJS from 'crypto-js';

interface HashWorkerMessage {
  content: string;
  algorithm: keyof typeof HASH_ALGORITHMS;
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

self.addEventListener('message', (e: MessageEvent<HashWorkerMessage>) => {
  try {
    const { content, algorithm, encoding } = e.data;
    const hashFunction = HASH_ALGORITHMS[algorithm];

    if (!hashFunction) {
      throw new Error('不支持的哈希算法');
    }

    const wordArray = hashFunction(content);
    const hash =
      encoding === 'hex'
        ? wordArray.toString(CryptoJS.enc.Hex)
        : wordArray.toString(CryptoJS.enc.Base64);

    self.postMessage({ hash });
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

export {};
