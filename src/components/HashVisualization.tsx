import { useState, useEffect } from 'react';
import { HashService } from '../utils/hashUtils';
import { ChartBarIcon, LightBulbIcon, BeakerIcon } from '@heroicons/react/24/outline';

interface HashBit {
  value: string;
  changed: boolean;
}

interface DemoExample {
  title: string;
  description: string;
  input: string;
}

const INTERACTIVE_DEMOS: DemoExample[] = [
  {
    title: '单字符变化',
    description: '演示如何一个字符的改变会导致整个哈希值的剧烈变化',
    input: 'Hello World'
  },
  {
    title: '空白字符',
    description: '展示空格和不可见字符对哈希值的影响',
    input: 'Hello  World'
  },
  {
    title: '大小写敏感',
    description: '展示大小写变化对哈希值的影响',
    input: 'Password123'
  },
  {
    title: '长文本测试',
    description: '验证无论输入多长，输出始终是固定长度',
    input: '这是一段很长的文本，用来测试哈希函数的特性。无论输入文本有多长，哈希值的长度都是固定的。这就是哈希函数的一个重要特性。'
  }
];

export default function HashVisualization() {
  const [inputText, setInputText] = useState('Hello');
  const [previousHash, setPreviousHash] = useState<string>('');
  const [currentHash, setCurrentHash] = useState<string>('');
  const [hashBits, setHashBits] = useState<HashBit[]>([]);
  const [avalancheEffect, setAvalancheEffect] = useState(0);
  const [selectedDemo, setSelectedDemo] = useState<number | null>(null);
  const [showBinaryView, setShowBinaryView] = useState(false);
  const [animateChange, setAnimateChange] = useState(false);

  useEffect(() => {
    const calculateHash = async () => {
      try {
        const result = await HashService.calculateTextHash(inputText, { algorithm: 'sha256' });

        if (previousHash && result.hash !== previousHash) {
          setAnimateChange(true);
          const changes = Array.from(result.hash).map((char, i) => ({
            value: char,
            changed: char !== previousHash[i]
          }));
          setHashBits(changes);

          const changedBits = changes.filter(bit => bit.changed).length;
          setAvalancheEffect((changedBits / result.hash.length) * 100);

          // 重置动画状态
          setTimeout(() => setAnimateChange(false), 500);
        } else {
          setHashBits(Array.from(result.hash).map(char => ({
            value: char,
            changed: false
          })));
        }

        setPreviousHash(currentHash);
        setCurrentHash(result.hash);
      } catch (error) {
        console.error('计算哈希值时发生错误:', error);
      }
    };

    calculateHash();
  }, [inputText]);

  const handleDemoSelect = (index: number) => {
    setSelectedDemo(index);
    setInputText(INTERACTIVE_DEMOS[index].input);
  };

  // 将十六进制转换为二进制字符串
  const hexToBinary = (hex: string): string => {
    return hex.split('').map(char =>
      parseInt(char, 16).toString(2).padStart(4, '0')
    ).join('');
  };

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">哈希函数可视化</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowBinaryView(!showBinaryView)}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
          >
            <BeakerIcon className="h-4 w-4 mr-1" />
            {showBinaryView ? '十六进制视图' : '二进制视图'}
          </button>
        </div>
      </div>

      {/* 交互式示例选择器 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {INTERACTIVE_DEMOS.map((demo, index) => (
          <button
            key={index}
            onClick={() => handleDemoSelect(index)}
            className={`p-3 rounded-lg text-left transition-all ${selectedDemo === index
              ? 'bg-blue-50 border-blue-200 border-2'
              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }`}
          >
            <h4 className="font-medium text-sm">{demo.title}</h4>
            <p className="text-xs text-gray-600 mt-1">{demo.description}</p>
          </button>
        ))}
      </div>

      {/* 输入区域 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">输入文本</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="w-full p-2 border rounded h-24"
          placeholder="输入任意文本..."
        />
      </div>

      {/* 哈希值可视化 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">哈希值变化可视化</h3>
          <span className="text-sm text-gray-500">
            长度: {currentHash.length} 字符
          </span>
        </div>
        <div className={`bg-gray-50 p-4 rounded overflow-x-auto transition-all duration-300 ${animateChange ? 'bg-yellow-50' : ''
          }`}>
          <div className="font-mono text-sm flex flex-wrap">
            {(showBinaryView ? hexToBinary(currentHash) : currentHash).split('').map((bit, index) => (
              <span
                key={index}
                className={`${hashBits[showBinaryView ? Math.floor(index / 4) : index]?.changed
                  ? 'bg-yellow-200 text-red-600'
                  : ''
                  } ${showBinaryView ? 'mx-px' : ''
                  } transition-colors duration-300`}
              >
                {bit}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 雪崩效应展示 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-1" />
            雪崩效应
          </h3>
          <span className="text-sm font-medium">
            变化率: {avalancheEffect.toFixed(1)}%
          </span>
        </div>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${avalancheEffect}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          当前修改导致 {showBinaryView ? (avalancheEffect * 4).toFixed(1) : avalancheEffect.toFixed(1)} 个
          {showBinaryView ? '比特' : '字符'} 发生变化
        </p>
      </div>

      {/* 特性说明 */}
      <div className="bg-blue-50 p-4 rounded space-y-4">
        <div className="flex items-center">
          <LightBulbIcon className="h-5 w-5 mr-2" />
          <h3 className="font-medium">哈希函数特性解释</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="text-sm font-medium">1. 雪崩效应（Avalanche Effect）</h4>
              <p className="text-sm text-gray-600 mt-1">
                输入的微小改变会导致输出的显著变化。通过修改一个字符，可以观察到大约50%的输出位发生变化。
              </p>
              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                提示：尝试修改一个字符，观察变化的位数
              </div>
            </div>

            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="text-sm font-medium">2. 确定性（Deterministic）</h4>
              <p className="text-sm text-gray-600 mt-1">
                相同的输入总是产生相同的哈希值，这保证了哈希函数的可靠性和一致性。
              </p>
              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                提示：重复输入相同文本，观察哈希值是否相同
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="text-sm font-medium">3. 不可逆性（One-way Function）</h4>
              <p className="text-sm text-gray-600 mt-1">
                从哈希值无法反推出原始输入，这是密码学哈希函数的核心安全特性。
              </p>
              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                提示：切换到二进制视图，观察数据的复杂性
              </div>
            </div>

            <div className="bg-white p-3 rounded shadow-sm">
              <h4 className="text-sm font-medium">4. 固定长度输出</h4>
              <p className="text-sm text-gray-600 mt-1">
                无论输入长度如何，SHA-256 始终产生 256 位（64个十六进制字符）的输出。
              </p>
              <div className="mt-2 text-xs bg-gray-50 p-2 rounded">
                提示：尝试输入超长文本，观察输出长度
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 