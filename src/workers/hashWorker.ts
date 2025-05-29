import CryptoJS from 'crypto-js';

interface HashWorkerData {
  content: string;
  algorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  encoding: 'hex' | 'base64';
}

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
