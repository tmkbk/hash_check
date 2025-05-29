import { useState, useEffect } from 'react';
import { HashService, HashConfig } from '../utils/hashUtils';
import FileDropZone from './FileDropZone';
import ProgressBar from './ProgressBar';
import NotificationService from '../utils/notificationService';
import { CheckCircleIcon, XCircleIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline';

interface VerificationResult {
  originalHash: string;
  computedHash: string;
  isValid: boolean;
  filename: string;
  timestamp: Date;
  fileSize?: number;
}

const HISTORY_KEY = 'file_verification_history';

export default function FileIntegrityCheck() {
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [algorithm, setAlgorithm] = useState<HashConfig['algorithm']>('sha256');
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([]);
  const [expectedHash, setExpectedHash] = useState('');
  const [history, setHistory] = useState<VerificationResult[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // 加载历史记录
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(HISTORY_KEY);
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }, []);

  // 保存历史记录
  const saveToHistory = (results: VerificationResult[]) => {
    try {
      const newHistory = [...results, ...history].slice(0, 50); // 限制最多保存50条记录
      setHistory(newHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    NotificationService.success('历史记录已清除');
  };

  const handleFileDrop = async (files: File[]) => {
    if (!expectedHash.trim()) {
      NotificationService.warning('请先输入预期的哈希值');
      return;
    }

    setVerifying(true);
    setProgress(0);

    try {
      const results: VerificationResult[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const hashResult = await HashService.calculateFileHash(file, { algorithm });

        const result = {
          originalHash: expectedHash.toLowerCase(),
          computedHash: hashResult.hash.toLowerCase(),
          isValid: expectedHash.toLowerCase() === hashResult.hash.toLowerCase(),
          filename: file.name,
          timestamp: new Date(),
          fileSize: file.size
        };

        results.push(result);
        setProgress(((i + 1) / files.length) * 100);
      }

      setVerificationResults(results);
      saveToHistory(results);

      const validCount = results.filter(r => r.isValid).length;
      if (validCount === results.length) {
        NotificationService.success(`所有文件验证通过`);
      } else {
        NotificationService.error(`${results.length - validCount} 个文件未通过验证`);
      }
    } catch (error) {
      NotificationService.error('文件验证过程中发生错误');
    } finally {
      setVerifying(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '未知大小';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const renderVerificationItem = (result: VerificationResult) => (
    <div
      className={`p-4 rounded-lg flex items-start space-x-3 ${result.isValid ? 'bg-green-50' : 'bg-red-50'
        }`}
    >
      {result.isValid ? (
        <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
      )}
      <div className="flex-1 space-y-1">
        <div className="font-medium">
          {result.filename}
          <span className="ml-2 text-sm text-gray-500">
            ({formatFileSize(result.fileSize)})
          </span>
        </div>
        <div className="text-sm text-gray-600">
          计算得到的哈希值：
          <span className={result.isValid ? 'text-green-600' : 'text-red-600'}>
            {result.computedHash}
          </span>
        </div>
        {!result.isValid && (
          <div className="text-sm text-red-600">
            预期哈希值：{result.originalHash}
          </div>
        )}
        <div className="text-xs text-gray-500">
          验证时间：{result.timestamp.toLocaleString()}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">文件完整性验证</h2>
        <div className="flex items-center space-x-4">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as HashConfig['algorithm'])}
            className="border rounded px-3 py-1"
          >
            <option value="md5">MD5</option>
            <option value="sha1">SHA-1</option>
            <option value="sha256">SHA-256</option>
            <option value="sha512">SHA-512</option>
          </select>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ClockIcon className="h-4 w-4 mr-1" />
            {showHistory ? '隐藏历史记录' : '查看历史记录'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">预期哈希值</label>
          <input
            type="text"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder={`输入预期的 ${algorithm.toUpperCase()} 哈希值...`}
          />
        </div>

        <FileDropZone
          onFilesDrop={handleFileDrop}
          multiple={true}
          className={verifying ? 'opacity-50 pointer-events-none' : ''}
        />

        {verifying && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">正在验证文件...</div>
            <ProgressBar progress={progress} />
          </div>
        )}

        {/* 验证结果 */}
        {verificationResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">验证结果</h3>
            <div className="space-y-2">
              {verificationResults.map((result, index) => (
                <div key={index}>{renderVerificationItem(result)}</div>
              ))}
            </div>
          </div>
        )}

        {/* 历史记录 */}
        {showHistory && history.length > 0 && (
          <div className="border-t pt-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">历史记录</h3>
              <button
                onClick={clearHistory}
                className="flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                清除历史
              </button>
            </div>
            <div className="space-y-2">
              {history.map((result, index) => (
                <div key={index}>{renderVerificationItem(result)}</div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-medium mb-2">使用说明</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>输入您获得的原始文件哈希值</li>
            <li>选择要验证的文件（支持批量验证）</li>
            <li>系统将计算文件的哈希值并与预期值比对</li>
            <li>如果哈希值匹配，则说明文件未被篡改</li>
            <li>建议使用 SHA-256 或 SHA-512 获得更高的安全性</li>
            <li>验证记录会自动保存，可随时查看历史记录</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 