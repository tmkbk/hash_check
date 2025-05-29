import { useState, useEffect } from 'react';
import { HashService, HashConfig } from '../utils/hashUtils';
import NotificationService from '../utils/notificationService';
import { DocumentDuplicateIcon, ArrowPathIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import HashComparison from './HashComparison';
import HashVisualization from './HashVisualization';

const DEMO_TEXTS = [
  {
    title: '示例1：单字符修改',
    original: '这是一段示例文本，用于演示哈希值的变化。',
    modified: '这是一段示范文本，用于演示哈希值的变化。'
  },
  {
    title: '示例2：空格修改',
    original: 'Hello World',
    modified: 'HelloWorld'
  },
  {
    title: '示例3：大小写修改',
    original: 'Password123',
    modified: 'password123'
  }
];

export default function TamperDemo() {
  const [originalText, setOriginalText] = useState('这是一段示例文本，用于演示哈希值的变化。');
  const [modifiedText, setModifiedText] = useState('这是一段示例文本，用于演示哈希值的变化。');
  const [originalHash, setOriginalHash] = useState('');
  const [modifiedHash, setModifiedHash] = useState('');
  const [algorithm, setAlgorithm] = useState<HashConfig['algorithm']>('sha256');
  const [showComparison, setShowComparison] = useState(true);
  const [selectedDemo, setSelectedDemo] = useState(0);

  useEffect(() => {
    const calculateHashes = async () => {
      try {
        const config: HashConfig = { algorithm };
        const original = await HashService.calculateTextHash(originalText, config);
        const modified = await HashService.calculateTextHash(modifiedText, config);

        setOriginalHash(original.hash);
        setModifiedHash(modified.hash);
      } catch (error) {
        NotificationService.error('计算哈希值时发生错误');
      }
    };

    calculateHashes();
  }, [originalText, modifiedText, algorithm]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    NotificationService.success('哈希值已复制到剪贴板');
  };

  const handleDemoSelect = (index: number) => {
    setSelectedDemo(index);
    setOriginalText(DEMO_TEXTS[index].original);
    setModifiedText(DEMO_TEXTS[index].modified);
  };

  const handleReset = () => {
    setModifiedText(originalText);
  };

  // 计算文本差异并高亮显示
  const renderDiff = () => {
    const diffChars = [];
    const maxLength = Math.max(originalText.length, modifiedText.length);

    for (let i = 0; i < maxLength; i++) {
      const char = modifiedText[i] || '';
      const isDifferent = char !== originalText[i];

      diffChars.push(
        <span
          key={i}
          className={isDifferent ? 'bg-yellow-200 text-red-600' : ''}
        >
          {char}
        </span>
      );
    }

    return diffChars;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 篡改检测部分 */}
        <div className="p-4 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">篡改检测演示</h2>
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
                onClick={() => setShowComparison(!showComparison)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showComparison ? '隐藏详细比较' : '显示详细比较'}
              </button>
            </div>
          </div>

          {/* 示例选择器 */}
          <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
            {DEMO_TEXTS.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoSelect(index)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${selectedDemo === index
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {demo.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* 原始文本区域 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-medium">原始文本</label>
                <LockClosedIcon className="h-4 w-4 text-gray-400" />
              </div>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                className="w-full h-32 p-2 border rounded"
                placeholder="输入原始文本..."
              />
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                <span className="text-sm font-mono break-all flex-1">
                  {originalHash}
                </span>
                <button
                  onClick={() => handleCopyHash(originalHash)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="复制哈希值"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 修改后文本区域 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-medium">修改后文本</label>
                <button
                  onClick={handleReset}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  title="重置为原始文本"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  重置
                </button>
              </div>
              <textarea
                value={modifiedText}
                onChange={(e) => setModifiedText(e.target.value)}
                className="w-full h-32 p-2 border rounded"
                placeholder="修改文本以查看哈希值变化..."
              />
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded">
                <span
                  className={`text-sm font-mono break-all flex-1 ${originalHash !== modifiedHash ? 'text-red-600' : ''
                    }`}
                >
                  {modifiedHash}
                </span>
                <button
                  onClick={() => handleCopyHash(modifiedHash)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="复制哈希值"
                >
                  <DocumentDuplicateIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 哈希值比较 */}
          {showComparison && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-4">哈希值详细比较</h3>
              <HashComparison
                originalHash={originalHash}
                modifiedHash={modifiedHash}
              />
            </div>
          )}

          {/* 检测结果 */}
          <div className="mt-4 bg-gray-50 p-4 rounded">
            <h3 className="font-medium mb-2">检测结果</h3>
            {originalHash === modifiedHash ? (
              <div className="text-green-600">
                ✓ 文本未被篡改（哈希值相同）
              </div>
            ) : (
              <div className="text-red-600">
                ⚠ 检测到文本被篡改（哈希值不同）
              </div>
            )}
          </div>
        </div>

        {/* 哈希函数可视化部分 */}
        <HashVisualization />
      </div>
    </div>
  );
} 