import { useState, useCallback, ChangeEvent } from 'react';
import CryptoJS from 'crypto-js';

const HASH_TYPES = [
  { id: 'md5', name: 'MD5', func: CryptoJS.MD5 },
  { id: 'sha1', name: 'SHA-1', func: CryptoJS.SHA1 },
  { id: 'sha256', name: 'SHA-256', func: CryptoJS.SHA256 },
  { id: 'sha512', name: 'SHA-512', func: CryptoJS.SHA512 },
] as const;

export default function HashCalculator() {
  const [input, setInput] = useState('');
  const [selectedHash, setSelectedHash] = useState<string>('md5');
  const [result, setResult] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const calculateHash = useCallback(() => {
    const hashFunc = HASH_TYPES.find(h => h.id === selectedHash)?.func;
    if (!hashFunc) return;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) {
          const hash = hashFunc(content as string).toString();
          setResult(hash);
        }
      };
      reader.readAsText(file);
    } else {
      const hash = hashFunc(input).toString();
      setResult(hash);
    }
  }, [input, selectedHash, file]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setInput('');
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleHashChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedHash(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">哈希计算器</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择哈希算法
            </label>
            <select
              value={selectedHash}
              onChange={handleHashChange}
              className="input-field"
            >
              {HASH_TYPES.map(hash => (
                <option key={hash.id} value={hash.id}>
                  {hash.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入文本或上传文件
            </label>
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={handleTextChange}
                disabled={!!file}
                placeholder="在此输入要计算哈希值的文本..."
                className="input-field"
                rows={4}
              />
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                             file:rounded-md file:border-0 file:text-sm file:font-semibold 
                             file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100
                             focus:outline-none"
                  />
                </div>
                {file && (
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-700 transition-colors duration-200
                             text-sm font-medium"
                  >
                    清除文件
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={calculateHash}
            disabled={!input && !file}
            className="btn-primary w-full"
          >
            计算哈希值
          </button>

          {result && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                计算结果
              </label>
              <div className="bg-gray-50 rounded-md p-4 break-all">
                <code className="text-sm">{result}</code>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 