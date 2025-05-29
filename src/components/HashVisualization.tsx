import { useState, useEffect, useCallback, useMemo } from 'react';
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
  ArrowsPointingOutIcon,
  InformationCircleIcon
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

interface HashStats {
  distribution: Array<[string, number]>;
  zeros: number;
  ones: number;
  entropy: number;
}

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
  const [activeTab, setActiveTab] = useState<'visualization' | 'analysis' | 'tutorial'>('visualization');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

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

  const hashStats = useMemo((): HashStats => {
    const hexCount = currentHash.split('').reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribution = Object.entries(hexCount).sort((a, b) => b[1] - a[1]);
    const zeros = distribution.find(([k]) => k === '0')?.[1] || 0;
    const ones = distribution.reduce((acc, [_, v]) => acc + v, 0) - zeros;

    // 计算香农熵
    const entropy = distribution.reduce((acc, [_, count]) => {
      const p = count / currentHash.length;
      return acc - (p * Math.log2(p));
    }, 0);

    return { distribution, zeros, ones, entropy };
  }, [currentHash]);

  return (
    <div className={`${showFullscreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : ''}`}>
      {/* 顶部导航栏 */}
      <div className="sticky top-0 bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h2 className="text-xl font-semibold flex items-center">
              <BeakerIcon className="h-6 w-6 mr-2 text-blue-600" />
              哈希函数可视化
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('visualization')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'visualization'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                可视化
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analysis'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                分析
              </button>
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tutorial'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                教程
              </button>
              <div className="border-l mx-2" />
              <button
                onClick={() => setShowBinaryView(!showBinaryView)}
                className={`px-3 py-1 rounded-md text-sm ${showBinaryView ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <TableCellsIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowFullscreen(!showFullscreen)}
                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                <ArrowsPointingOutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 预设示例区域 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">预设示例</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INTERACTIVE_DEMOS.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoSelect(index)}
                className={`p-4 rounded-lg text-left transition-all ${selectedDemo === index
                  ? 'bg-blue-50 border-blue-200 border shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
              >
                <h4 className="text-sm font-medium">{demo.title}</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{demo.description}</p>
                {demo.animation && (
                  <div className="mt-2 flex items-center text-xs text-blue-600">
                    <PlayIcon className="h-3 w-3 mr-1" />
                    支持动画演示
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 输入区域 */}
        <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">输入文本</label>
            <div className="flex items-center space-x-2">
              {selectedDemo !== null && INTERACTIVE_DEMOS[selectedDemo].animation && (
                <button
                  onClick={toggleAnimation}
                  className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${isAnimating ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                >
                  {isAnimating ? (
                    <>
                      <PauseIcon className="h-4 w-4 mr-1" />
                      暂停
                    </>
                  ) : (
                    <>
                      <PlayIcon className="h-4 w-4 mr-1" />
                      播放
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setInputText('')}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                清空
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 border rounded-md h-32 font-mono focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            placeholder="输入任意文本..."
          />
        </div>

        {/* 哈希值显示区域 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <TableCellsIcon className="h-5 w-5 mr-2" />
              <h3 className="font-medium">哈希值</h3>
            </div>
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
                    } transition-colors duration-300 p-1`}
                >
                  {bit}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 标签页内容 */}
        <div className="mt-6">
          {activeTab === 'visualization' && (
            <>
              {/* 雪崩效应展示 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
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
                <p className="text-sm text-gray-600 mt-2">
                  当前修改导致 {showBinaryView ? (avalancheEffect * 4).toFixed(1) : avalancheEffect.toFixed(1)} 个
                  {showBinaryView ? '比特' : '字符'} 发生变化
                  {avalancheEffect > 45 && (
                    <span className="text-green-600 ml-2">
                      (达到理想的雪崩效应)
                    </span>
                  )}
                </p>
              </div>

              {/* 分布统计 */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium flex items-center">
                    <ChartPieIcon className="h-5 w-5 mr-2" />
                    哈希值分布
                  </h3>
                  <button
                    onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {showAdvancedStats ? '隐藏详细信息' : '显示详细信息'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {hashStats.distribution.map(([char, count], index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-lg">{char}</span>
                        <span className="text-sm text-gray-600">{count}次</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${(Number(count) / currentHash.length) * 100}%` }}
                        />
                      </div>
                      {showAdvancedStats && (
                        <div className="mt-2 text-xs text-gray-500">
                          占比: {((count / currentHash.length) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {showAdvancedStats && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">熵值</h4>
                      <p className="text-lg font-mono">{hashStats.entropy.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">比特/字符</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">零值比例</h4>
                      <p className="text-lg font-mono">
                        {((hashStats.zeros / currentHash.length) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{hashStats.zeros} 个零值</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">非零值比例</h4>
                      <p className="text-lg font-mono">
                        {((hashStats.ones / currentHash.length) * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{hashStats.ones} 个非零值</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'analysis' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-medium mb-4">哈希值分析</h3>
              <div className="space-y-6">
                {/* 这里可以添加更多的分析内容 */}
              </div>
            </div>
          )}

          {activeTab === 'tutorial' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center">
                  <LightBulbIcon className="h-6 w-6 mr-2 text-blue-600" />
                  <h3 className="font-medium">哈希函数特性解释</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">1. 雪崩效应</h4>
                    <p className="text-sm text-gray-600">
                      输入的微小改变会导致输出的显著变化。通过修改一个字符，可以观察到大约50%的输出位发生变化。
                    </p>
                    <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
                      提示：尝试修改一个字符，观察变化的位数
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">2. 确定性</h4>
                    <p className="text-sm text-gray-600">
                      相同的输入总是产生相同的哈希值，这保证了哈希函数的可靠性和一致性。
                    </p>
                    <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
                      提示：重复输入相同文本，观察哈希值是否相同
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">3. 不可逆性</h4>
                    <p className="text-sm text-gray-600">
                      从哈希值无法反推出原始输入，这是密码学哈希函数的核心安全特性。
                    </p>
                    <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
                      提示：切换到二进制视图，观察数据的复杂性
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">4. 固定长度输出</h4>
                    <p className="text-sm text-gray-600">
                      无论输入长度如何，SHA-256 始终产生 256 位（64个十六进制字符）的输出。
                    </p>
                    <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
                      提示：尝试输入超长文本，观察输出长度
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                    <InformationCircleIcon className="h-5 w-5 mr-2" />
                    使用建议
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>从简单的示例开始，逐步尝试更复杂的输入</li>
                    <li>使用动画功能观察哈希值的变化过程</li>
                    <li>切换不同的视图模式来深入理解数据结构</li>
                    <li>关注统计数据，了解哈希值的分布特性</li>
                    <li>尝试预测哈希值的变化，验证你的理解</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 