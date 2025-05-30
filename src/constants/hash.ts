export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/json',
  'text/markdown',
  'text/csv',
  'text/html',
  'application/javascript',
  'text/javascript',
  'application/typescript',
  'text/xml'
];

export const ANIMATION_SPEEDS = {
  slow: 2000,
  normal: 1500,
  fast: 1000
} as const;

export const DEFAULT_HASH_CONFIG = {
  algorithm: 'sha256' as const,
  encoding: 'hex' as const
};

export const HASH_LENGTHS = {
  md5: 32,
  sha1: 40,
  sha256: 64,
  sha512: 128
} as const;
