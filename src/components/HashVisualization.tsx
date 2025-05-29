import { useState, useEffect, useCallback } from 'react';
import { HashService } from '../utils/hashUtils';
import {
  ChartBarIcon,
  LightBulbIcon,
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  ArrowPathIcon,
  AcademicCapIcon,
  ClipboardIcon,
  ChartPieIcon,
  TableCellsIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';

interface HashBit {
  value: string;
  changed: boolean;
}

interface DemoExample {
  title: string;
  description: string;
  input: string;
  animation?: {
    sequence: string[];
    interval: number;
  };
}

const INTERACTIVE_DEMOS: DemoExample[] = [
  {
    title: '单字符变化',
    description: '演示如何一个字符的改变会导致整个哈希值的剧烈变化',
    input: 'Hello World',
    animation: {
      sequence: [
        'Hello World',
        'Hello World!',
        'Hello World.',
        'Hello World,',
        'Hello World'
      ],
      interval: 1500
    }
  },
  {
    title: '空白字符',
    description: '展示空格和不可见字符对哈希值的影响',
    input: 'Hello  World',
    animation: {
      sequence: [
        'Hello World',
        'Hello  World',
        'Hello   World',
        'HelloWorld',
        'Hello World'
      ],
      interval: 1500
    }
  },
  {
    title: '大小写敏感',
    description: '展示大小写变化对哈希值的影响',
    input: 'Password123',
    animation: {
      sequence: [
        'Password123',
        'password123',
        'PASSWORD123',
        'PaSsWoRd123',
        'Password123'
      ],
      interval: 1500
    }
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
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const calculateHash = useCallback(async (text: string) => {
    try {
      const result = await HashService.calculateTextHash(text, { algorithm: 'sha256' });

      if (previousHash && result.hash !== previousHash) {
        setAnimateChange(true);
        const changes = Array.from(result.hash).map((char, i) => ({
          value: char,
          changed: char !== previousHash[i]
        }));
        setHashBits(changes);

        const changedBits = changes.filter(bit => bit.changed).length;
        setAvalancheEffect((changedBits / result.hash.length) * 100);

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
  }, [previousHash, currentHash]);

  useEffect(() => {
    calculateHash(inputText);
  }, [inputText, calculateHash]);

  const handleDemoSelect = (index: number) => {
    setSelectedDemo(index);
    setInputText(INTERACTIVE_DEMOS[index].input);
    setIsAnimating(false);
    setAnimationIndex(0);
  };

  const toggleAnimation = () => {
    if (!selectedDemo || !INTERACTIVE_DEMOS[selectedDemo].animation) return;

    if (isAnimating) {
      setIsAnimating(false);
    } else {
      setIsAnimating(true);
      const demo = INTERACTIVE_DEMOS[selectedDemo];
      const animate = async () => {
        const sequence = demo.animation!.sequence;
        setInputText(sequence[animationIndex]);
        setAnimationIndex((prev) => (prev + 1) % sequence.length);
      };
      animate();
    }
  };

  useEffect(() => {
    if (isAnimating && selectedDemo !== null) {
      const demo = INTERACTIVE_DEMOS[selectedDemo];
      if (!demo.animation) return;

      const interval = setInterval(() => {
        setAnimationIndex((prev) => {
          const nextIndex = (prev + 1) % demo.animation!.sequence.length;
          setInputText(demo.animation!.sequence[nextIndex]);
          return nextIndex;
        });
      }, demo.animation.interval);

      return () => clearInterval(interval);
    }
  }, [isAnimating, selectedDemo]);

  const hexToBinary = (hex: string): string => {
    return hex.split('').map(char =>
      parseInt(char, 16).toString(2).padStart(4, '0')
    ).join('');
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(currentHash);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const getHashStats = () => {
    const hexCount = currentHash.split('').reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      zeros: Object.entries(hexCount).filter(([k]) => k === '0').reduce((acc, [, v]) => acc + v, 0),
      ones: Object.entries(hexCount).filter(([k]) => k !== '0').reduce((acc, [, v]) => acc + v, 0),
      distribution: Object.entries(hexCount).sort((a, b) => b[1] - a[1])
    };
  };

  return (
    <div className={`space-y-6 ${showFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
      <div className="sticky top-0 bg-white p-4 shadow-sm z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center">
            <BeakerIcon className="h-6 w-6 mr-2 text-blue-600" />
            哈希函数可视化
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              title="显示统计信息"
            >
              <ChartPieIcon className="h-4 w-4 mr-1" />
              统计
            </button>
            <button
              onClick={() => setShowTutorial(!showTutorial)}
              className="flex items-center px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded"
            >
              <AcademicCapIcon className="h-4 w-4 mr-1" />
              {showTutorial ? '隐藏教程' : '教程'}
            </button>
            <button
              onClick={() => setShowBinaryView(!showBinaryView)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              <TableCellsIcon className="h-4 w-4 mr-1" />
              {showBinaryView ? '十六进制' : '二进制'}
            </button>
            <button
              onClick={() => setShowFullscreen(!showFullscreen)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
            >
              <ArrowsPointingOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {showTutorial && (
          <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg space-y-3">
            <h3 className="font-medium flex items-center text-blue-800">
              <AcademicCapIcon className="h-5 w-5 mr-2" />
              快速上手教程
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>选择一个预设示例或输入自定义文本</li>
              <li>观察哈希值如何随输入变化而变化</li>
              <li>使用动画功能查看连续变化的效果</li>
              <li>切换二进制视图深入了解数据结构</li>
              <li>注意观察雪崩效应的百分比变化</li>
            </ol>
            <div className="text-xs text-blue-700 mt-2 bg-blue-50 p-2 rounded">
              提示：每个示例都设计用来展示哈希函数的不同特性
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* 交互式示例选择器 */}
            <div className="grid grid-cols-2 gap-2">
              {INTERACTIVE_DEMOS.map((demo, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoSelect(index)}
                  className={`p-3 rounded-lg text-left transition-all ${selectedDemo === index
                    ? 'bg-blue-50 border-blue-200 border-2 shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:shadow'
                    }`}
                >
                  <h4 className="font-medium text-sm">{demo.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{demo.description}</p>
                  {demo.animation && (
                    <div className="mt-2 flex items-center text-xs text-blue-600">
                      <PlayIcon className="h-3 w-3 mr-1" />
                      支持动画演示
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* 输入区域 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">输入文本</label>
                <div className="flex items-center space-x-2">
                  {selectedDemo !== null && INTERACTIVE_DEMOS[selectedDemo].animation && (
                    <button
                      onClick={toggleAnimation}
                      className={`flex items-center px-2 py-1 text-sm rounded hover:bg-blue-100 ${isAnimating ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600'
                        }`}
                    >
                      {isAnimating ? (
                        <>
                          <PauseIcon className="h-4 w-4 mr-1" />
                          暂停动画
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-1" />
                          播放动画
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => setInputText('')}
                    className="flex items-center px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    清空
                  </button>
                </div>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full p-2 border rounded h-24 font-mono focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                placeholder="输入任意文本..."
              />
            </div>

            {/* 哈希值统计 */}
            {showStats && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <h3 className="font-medium flex items-center">
                  <ChartPieIcon className="h-5 w-5 mr-2" />
                  哈希值统计
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(getHashStats().distribution).map(([char, count], index) => (
                    <div key={index} className="bg-white p-2 rounded shadow-sm">
                      <div className="text-sm font-medium">字符: {char}</div>
                      <div className="text-xs text-gray-600">出现次数: {count}</div>
                      <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${(count / currentHash.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* 哈希值可视化 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <TableCellsIcon className="h-5 w-5 mr-2" />
                  哈希值可视化
                </h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleCopyHash}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                    title="复制哈希值"
                  >
                    <ClipboardIcon className="h-4 w-4 mr-1" />
                    {copySuccess ? '已复制' : '复制'}
                  </button>
                  <span className="text-sm text-gray-500">
                    长度: {showBinaryView ? currentHash.length * 4 : currentHash.length} {showBinaryView ? '位' : '字符'}
                  </span>
                </div>
              </div>
              <div className={`bg-gray-50 p-4 rounded-lg overflow-x-auto transition-all duration-300 ${animateChange ? 'bg-yellow-50' : ''
                }`}>
                <div className="font-mono text-sm flex flex-wrap">
                  {(showBinaryView ? hexToBinary(currentHash) : currentHash).split('').map((bit, index) => (
                    <span
                      key={index}
                      className={`${hashBits[showBinaryView ? Math.floor(index / 4) : index]?.changed
                        ? 'bg-yellow-200 text-red-600'
                        : ''
                        } ${showBinaryView ? 'mx-px' : ''
                        } transition-colors duration-300 p-0.5`}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 雪崩效应展示 */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  雪崩效应
                </h3>
                <span className="text-sm font-medium">
                  变化率: {avalancheEffect.toFixed(1)}%
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${avalancheEffect > 45 ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                  style={{ width: `${avalancheEffect}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                当前修改导致 {showBinaryView ? (avalancheEffect * 4).toFixed(1) : avalancheEffect.toFixed(1)} 个
                {showBinaryView ? '比特' : '字符'} 发生变化
                {avalancheEffect > 45 && (
                  <span className="text-green-600 ml-2">
                    (达到理想的雪崩效应)
                  </span>
                )}
              </p>
            </div>

            {/* 特性说明 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg space-y-4">
              <div className="flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium">哈希函数特性解释</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800">1. 雪崩效应</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      输入的微小改变会导致输出的显著变化。通过修改一个字符，可以观察到大约50%的输出位发生变化。
                    </p>
                    <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                      提示：尝试修改一个字符，观察变化的位数
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800">2. 确定性</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      相同的输入总是产生相同的哈希值，这保证了哈希函数的可靠性和一致性。
                    </p>
                    <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                      提示：重复输入相同文本，观察哈希值是否相同
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800">3. 不可逆性</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      从哈希值无法反推出原始输入，这是密码学哈希函数的核心安全特性。
                    </p>
                    <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                      提示：切换到二进制视图，观察数据的复杂性
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800">4. 固定长度输出</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      无论输入长度如何，SHA-256 始终产生 256 位（64个十六进制字符）的输出。
                    </p>
                    <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
                      提示：尝试输入超长文本，观察输出长度
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 