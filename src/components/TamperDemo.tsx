import { useState, useCallback, useEffect } from 'react';
import { HashService, HashAnalysis } from '../utils/hashUtils';
import {
  DocumentCheckIcon,
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ClipboardIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

interface FileHash {
  filename: string;
  content: string;
  hash: string;
  status: 'unchanged' | 'modified' | 'checking';
  lastModified?: Date;
  modificationCount?: number;
  analysis?: HashAnalysis;
}

interface HashAlgorithm {
  id: 'md5' | 'sha1' | 'sha256' | 'sha512';
  name: string;
  length: number;
}

interface HashDiff {
  originalBit: string;
  modifiedBit: string;
  isChanged: boolean;
  position: number;
}

const DEMO_FILES: FileHash[] = [
  {
    filename: 'config.json',
    content: '{\n  "apiKey": "your-api-key",\n  "endpoint": "https://api.example.com",\n  "timeout": 5000,\n  "retries": 3\n}',
    hash: '',
    status: 'checking'
  },
  {
    filename: 'data.txt',
    content: '这是一个示例文本文件，用于演示文件完整性检查。\n请尝试修改文件内容，观察哈希值的变化。\n\n文件完整性检查是信息安全中的重要手段，可以及时发现未经授权的修改。',
    hash: '',
    status: 'checking'
  },
  {
    filename: 'script.js',
    content: 'function calculateHash(data) {\n  return crypto.subtle.digest("SHA-256", data)\n    .then(hash => {\n      return Array.from(new Uint8Array(hash))\n        .map(b => b.toString(16).padStart(2, "0"))\n        .join("");\n    });\n}',
    hash: '',
    status: 'checking'
  }
];

const HASH_ALGORITHMS: HashAlgorithm[] = [
  { id: 'md5', name: 'MD5', length: 32 },
  { id: 'sha1', name: 'SHA-1', length: 40 },
  { id: 'sha256', name: 'SHA-256', length: 64 },
  { id: 'sha512', name: 'SHA-512', length: 128 }
];

export default function TamperDemo() {
  const [files, setFiles] = useState<FileHash[]>(() =>
    DEMO_FILES.map(file => ({
      ...file,
      hash: '',
      modificationCount: 0,
      lastModified: new Date()
    }))
  );
  const [selectedFile, setSelectedFile] = useState<number>(0);
  const [editedContent, setEditedContent] = useState<string>(files[0].content);
  const [showDiff, setShowDiff] = useState(false);
  const [algorithm, setAlgorithm] = useState<HashAlgorithm['id']>('sha256');
  const [hashDiffs, setHashDiffs] = useState<HashDiff[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showTestVectors, setShowTestVectors] = useState(false);

  const calculateHash = useCallback(async (content: string) => {
    const result = await HashService.calculateTextHash(content, { algorithm });
    return result.hash;
  }, [algorithm]);

  const updateFileAnalysis = useCallback(async (fileIndex: number, hash: string) => {
    const analysis = HashService.analyzeHash(hash);
    setFiles(prev => prev.map((file, index) =>
      index === fileIndex ? { ...file, analysis } : file
    ));
  }, []);

  const initializeHashes = useCallback(async () => {
    const updatedFiles = await Promise.all(
      files.map(async (file) => {
        const hash = await calculateHash(file.content);
        const analysis = HashService.analyzeHash(hash);
        return {
          ...file,
          hash,
          analysis,
          status: 'unchanged' as const
        };
      })
    );
    setFiles(updatedFiles);
  }, [files, calculateHash]);

  useEffect(() => {
    initializeHashes();
  }, [algorithm]);

  const handleContentChange = async (content: string) => {
    setEditedContent(content);
    const newHash = await calculateHash(content);

    setFiles(prev => prev.map((file, index) => {
      if (index === selectedFile) {
        const isModified = file.hash !== newHash;
        return {
          ...file,
          status: isModified ? 'modified' : 'unchanged',
          lastModified: isModified ? new Date() : file.lastModified,
          modificationCount: isModified ? (file.modificationCount || 0) + 1 : file.modificationCount
        };
      }
      return file;
    }));

    // 更新分析数据
    await updateFileAnalysis(selectedFile, newHash);

    // 计算哈希值差异
    if (files[selectedFile].hash) {
      const originalHash = files[selectedFile].hash;
      const comparison = HashService.compareHashes(originalHash, newHash);
      const diffs: HashDiff[] = Array.from(newHash).map((bit, index) => ({
        originalBit: originalHash[index],
        modifiedBit: bit,
        isChanged: comparison.diffPositions.includes(index),
        position: index
      }));
      setHashDiffs(diffs);
    }
  };

  const resetFile = (index: number) => {
    const file = files[index];
    setEditedContent(file.content);
    handleContentChange(file.content);
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const calculateChangedBits = () => {
    return hashDiffs.filter(diff => diff.isChanged).length;
  };

  const calculateChangePercentage = () => {
    return ((calculateChangedBits() / hashDiffs.length) * 100).toFixed(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center">
          <DocumentCheckIcon className="h-6 w-6 mr-2 text-green-600" />
          文件完整性检查
        </h2>
        <div className="flex items-center space-x-4">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm['id'])}
            className="border border-gray-300 rounded-md text-sm py-1 px-2 focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
          >
            {HASH_ALGORITHMS.map(algo => (
              <option key={algo.id} value={algo.id}>
                {algo.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            className={`flex items-center px-3 py-1 rounded-md text-sm ${showAnalysis ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            <ChartBarIcon className="h-4 w-4 mr-1" />
            分析
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 文件列表 */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center">
            <DocumentDuplicateIcon className="h-5 w-5 mr-2 text-blue-600" />
            监控文件
          </h3>
          <div className="space-y-2">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedFile(index);
                  setEditedContent(file.content);
                }}
                className={`w-full p-3 rounded-lg text-left transition-all ${selectedFile === index
                  ? 'bg-blue-50 border-blue-200 border shadow-sm'
                  : 'hover:bg-gray-50'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{file.filename}</span>
                  {file.status === 'modified' ? (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  ) : file.status === 'unchanged' ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowPathIcon className="h-5 w-5 text-gray-400 animate-spin" />
                  )}
                </div>
                <div className="mt-1 text-xs font-mono text-gray-500 truncate">
                  {file.hash || '计算中...'}
                </div>
                {file.modificationCount !== undefined && file.modificationCount > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    修改次数: {file.modificationCount}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 文件内容编辑器和分析 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium">
                  {files[selectedFile].filename}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowDiff(!showDiff)}
                  className={`flex items-center px-3 py-1 text-sm ${showDiff ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                    } rounded-md`}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1" />
                  {showDiff ? '隐藏差异' : '显示差异'}
                </button>
                <button
                  onClick={() => resetFile(selectedFile)}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  重置
                </button>
              </div>
            </div>
            <textarea
              value={editedContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-64 p-3 font-mono text-sm border rounded-md focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>

          {/* 哈希值比较 */}
          {showDiff && hashDiffs.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-medium mb-4">哈希值差异</h3>
              <div className="flex flex-wrap font-mono text-sm">
                {hashDiffs.map((diff, index) => (
                  <span
                    key={index}
                    className={`p-1 ${diff.isChanged ? 'bg-yellow-200 text-red-600' : ''}`}
                    title={`位置: ${diff.position + 1}`}
                  >
                    {diff.modifiedBit}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                变化位数: {calculateChangedBits()} / {hashDiffs.length} ({calculateChangePercentage()}%)
              </div>
            </div>
          )}

          {/* 哈希分析 */}
          {showAnalysis && files[selectedFile].analysis && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  哈希分析
                </h3>
                <button
                  onClick={() => setShowTestVectors(!showTestVectors)}
                  className={`flex items-center px-3 py-1 text-sm ${showTestVectors ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                    } rounded-md`}
                >
                  <BeakerIcon className="h-4 w-4 mr-1" />
                  {showTestVectors ? '隐藏测试向量' : '生成测试向量'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-600">熵值</h4>
                  <p className="text-lg font-medium">
                    {files[selectedFile].analysis.entropy.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">比特/字符</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-600">雪崩效应</h4>
                  <p className="text-lg font-medium">
                    {files[selectedFile].analysis.avalancheEffect.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">相邻位变化率</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-xs font-medium text-gray-600">比特分布</h4>
                  <p className="text-sm font-medium">
                    0: {files[selectedFile].analysis.zeros} 个
                    <br />
                    1: {files[selectedFile].analysis.ones} 个
                  </p>
                </div>
              </div>

              {showTestVectors && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-3">测试向量</h4>
                  <div className="space-y-2">
                    {/* testVectors content would be populated here */}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 文件状态 */}
          <div className={`p-4 rounded-lg ${files[selectedFile].status === 'modified'
            ? 'bg-red-50 border border-red-200'
            : 'bg-green-50 border border-green-200'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {files[selectedFile].status === 'modified' ? (
                  <>
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <h4 className="font-medium text-red-700">文件已被修改</h4>
                      <p className="text-sm text-red-600 mt-1">
                        检测到文件内容发生变化，请检查是否为未授权的修改。
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <h4 className="font-medium text-green-700">文件完整性正常</h4>
                      <p className="text-sm text-green-600 mt-1">
                        文件内容未发生变化，哈希值保持一致。
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => handleCopyHash(files[selectedFile].hash)}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
                title="复制哈希值"
              >
                <ClipboardIcon className="h-4 w-4 mr-1" />
                {copySuccess ? '已复制' : '复制哈希值'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 