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
  InformationCircleIcon,
  SparklesIcon,
  CubeTransparentIcon,
  DocumentChartBarIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  ArrowsRightLeftIcon,
  ExclamationTriangleIcon
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
  },
  {
    title: '特殊字符',
    description: '测试特殊字符和Unicode字符对哈希值的影响',
    input: '你好，世界！@#¥%……&*',
    animation: {
      sequence: [
        '你好，世界！@#¥%……&*',
        'Hello, World!@#$%^&*',
        '🌍🌎🌏👋😊',
        '你好，世界！@#¥%……&*'
      ],
      interval: 2000
    }
  },
  {
    title: '零值测试',
    description: '测试全零输入的哈希分布特性',
    input: '0000000000',
    animation: {
      sequence: [
        '0000000000',
        '1111111111',
        'aaaaaaaaaa',
        '0000000000'
      ],
      interval: 1500
    }
  }
];

interface HashStats {
  distribution: Array<[string, number]>;
  zeros: number;
  ones: number;
  entropy: number;
}

interface AnimationState {
  isPlaying: boolean;
  speed: 'slow' | 'normal' | 'fast';
  currentStep: number;
}

interface HashComparison {
  identical: boolean;
  diffCount: number;
  diffPositions: number[];
  diffBits: number;
  diffPercentage: number;
  entropy: number;
  avalancheEffect: number; // 添加雪崩效应属性
}

// 添加全局按钮基础样式
const buttonBaseStyle = "focus:outline-none focus:ring-0";

// 添加下拉框基础样式
const selectBaseStyle = `
  ${buttonBaseStyle}
  appearance-none
  bg-white
  border border-gray-200
  text-gray-700
  px-3 py-1.5
  pr-8
  rounded-md
  cursor-pointer
  transition-all
  hover:border-blue-300
  focus:border-blue-400
  disabled:opacity-50
  disabled:cursor-not-allowed
  bg-[url('data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20"><path stroke="%236B7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 8l4 4 4-4"/></svg>')] 
  bg-[length:20px_20px]
  bg-no-repeat
  bg-[center_right_0.5rem]
`;

// 添加复制提示基础样式
const copySuccessStyle = `
  absolute right-full top-1/2 -translate-y-1/2 mr-2
  flex items-center
  bg-green-50 text-green-600
  border border-green-200
  rounded-md px-2 py-1
  text-xs
  shadow-sm
  whitespace-nowrap
  z-10
`;

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
  const [inputCopySuccess, setInputCopySuccess] = useState(false);
  const [comparisonCopySuccess, setComparisonCopySuccess] = useState(false);
  const [mainHashCopySuccess, setMainHashCopySuccess] = useState(false);
  const [compareHashCopySuccess, setCompareHashCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'visualization' | 'analysis' | 'tutorial'>('visualization');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>({
    isPlaying: false,
    speed: 'normal',
    currentStep: 0
  });
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonText, setComparisonText] = useState('');
  const [showVisualPatterns, setShowVisualPatterns] = useState(false);
  const [highlightedBits, setHighlightedBits] = useState<number[]>([]);
  const [comparisonHash, setComparisonHash] = useState<string>('');
  const [hashComparison, setHashComparison] = useState<HashComparison | null>(null);

  // 添加文件处理相关的状态
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

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

  // 统一的复制处理函数
  const handleCopy = async (text: string, setSuccess: (success: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
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

  // 动画速度配置
  const speedConfig = {
    slow: 2000,
    normal: 1500,
    fast: 800
  };

  // 添加动画控制函数
  const handleSpeedChange = (speed: AnimationState['speed']) => {
    setAnimationState(prev => ({ ...prev, speed }));
  };

  // 处理位模式高亮
  const handleBitHighlight = (index: number) => {
    setHighlightedBits(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  // 生成视觉模式
  const generateVisualPattern = (hash: string): string[][] => {
    const pattern: string[][] = [];
    const binaryHash = hexToBinary(hash);

    // 创建8x8的视觉模式
    for (let i = 0; i < 8; i++) {
      pattern[i] = [];
      for (let j = 0; j < 8; j++) {
        const index = i * 8 + j;
        pattern[i][j] = binaryHash[index] || '0';
      }
    }
    return pattern;
  };

  // 计算对比哈希值
  useEffect(() => {
    if (!showComparison || !comparisonText) {
      setComparisonHash('');
      setHashComparison(null);
      return;
    }

    const calculateComparisonHash = async () => {
      try {
        const result = await HashService.calculateTextHash(comparisonText, { algorithm: 'sha256' });
        setComparisonHash(result.hash);

        // 计算输入文本的差异位数
        const inputDiffBits = Array.from(inputText).reduce((count, char, i) => {
          return count + (char !== comparisonText[i] ? 1 : 0);
        }, 0);

        // 计算哈希值的差异位数（二进制级别）
        const mainBinary = hexToBinary(currentHash);
        const compBinary = hexToBinary(result.hash);
        const hashDiffBits = mainBinary.split('').reduce((count, bit, i) => {
          return count + (bit !== compBinary[i] ? 1 : 0);
        }, 0);

        // 计算雪崩效应：哈希值变化位数与输入变化位数的比率
        const avalancheEffect = inputDiffBits > 0 ? (hashDiffBits / (mainBinary.length)) * 100 : 0;

        const diffPositions: number[] = [];
        let diffCount = 0;
        let diffBits = 0;

        for (let i = 0; i < currentHash.length; i++) {
          if (currentHash[i] !== result.hash[i]) {
            diffPositions.push(i);
            diffCount++;

            const bin1 = parseInt(currentHash[i], 16).toString(2).padStart(4, '0');
            const bin2 = parseInt(result.hash[i], 16).toString(2).padStart(4, '0');
            for (let j = 0; j < 4; j++) {
              if (bin1[j] !== bin2[j]) diffBits++;
            }
          }
        }

        setHashComparison({
          identical: diffCount === 0,
          diffCount,
          diffPositions,
          diffBits,
          diffPercentage: (diffBits / (currentHash.length * 4)) * 100,
          entropy: hashStats.entropy,
          avalancheEffect
        });
      } catch (error) {
        console.error('计算对比哈希值时发生错误:', error);
      }
    };

    calculateComparisonHash();
  }, [currentHash, comparisonText, showComparison, inputText, hashStats.entropy]);

  // 交换输入文本
  const handleSwapTexts = () => {
    const tempText = inputText;
    setInputText(comparisonText);
    setComparisonText(tempText);
  };

  // 文件拖放处理函数
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    try {
      setProcessingFiles(true);
      setSelectedFiles(files);
      
      const results = await HashService.calculateBatchFiles(
        files,
        { algorithm: 'sha256' },
        (progress) => setProcessProgress(progress)
      );
      
      // 处理结果
      results.forEach(result => {
        HistoryService.addToHistory(result);
      });
      
      // 如果只有一个文件，直接显示其哈希值
      if (results.length === 1) {
        setCurrentHash(results[0].hash);
      }
      
      NotificationService.success(`成功处理 ${results.length} 个文件`);
    } catch (error) {
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
                className={`${buttonBaseStyle} px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'visualization'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                可视化
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`${buttonBaseStyle} px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analysis'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                分析
              </button>
              <button
                onClick={() => setActiveTab('tutorial')}
                className={`${buttonBaseStyle} px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'tutorial'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                教程
              </button>
              <div className="border-l mx-2" />
              <button
                onClick={() => setShowBinaryView(!showBinaryView)}
                className={`${buttonBaseStyle} px-3 py-1 rounded-md text-sm ${showBinaryView ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <TableCellsIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowFullscreen(!showFullscreen)}
                className={`${buttonBaseStyle} px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md`}
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-blue-600" />
              预设示例
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className={`${buttonBaseStyle} px-3 py-1 text-sm rounded-md transition-colors ${showComparison ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <DocumentChartBarIcon className="h-4 w-4 inline mr-1" />
                对比模式
              </button>
              <button
                onClick={() => setShowVisualPatterns(!showVisualPatterns)}
                className={`${buttonBaseStyle} px-3 py-1 text-sm rounded-md transition-colors ${showVisualPatterns ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
              >
                <CubeTransparentIcon className="h-4 w-4 inline mr-1" />
                可视化模式
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTERACTIVE_DEMOS.map((demo, index) => (
              <button
                key={index}
                onClick={() => handleDemoSelect(index)}
                className={`${buttonBaseStyle} group h-32 p-4 rounded-lg text-left transition-all transform hover:scale-102 hover:shadow-md ${selectedDemo === index
                  ? 'bg-blue-50 border-blue-200 border shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100 border border-transparent'
                  }`}
              >
                <div className="h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <h4 className="text-sm font-medium relative z-10">{demo.title}</h4>
                  <p className="text-xs text-gray-600 mt-1 flex-grow line-clamp-2 relative z-10">
                    {demo.description}
                  </p>
                  {demo.animation && (
                    <div className="mt-2 flex items-center text-xs text-blue-600 relative z-10">
                      <PlayIcon className="h-3 w-3 mr-1" />
                      支持动画演示
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 输入和对比区域 */}
        <div className={`grid ${showComparison ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6 mb-6 transition-all duration-300`}>
          {/* 主输入区域和视觉模式 */}
          <div className="space-y-6">
            {/* 主输入区域 */}
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-4 w-full">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium">输入文本</label>
                <div className="flex items-center space-x-2">
                  {selectedDemo !== null && INTERACTIVE_DEMOS[selectedDemo].animation && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={toggleAnimation}
                        className={`${buttonBaseStyle} flex items-center px-3 py-1 text-sm rounded-md transition-colors ${isAnimating ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
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
                      <select
                        value={animationState.speed}
                        onChange={(e) => handleSpeedChange(e.target.value as AnimationState['speed'])}
                        className={`${selectBaseStyle} min-w-[80px] text-sm`}
                      >
                        <option value="slow" className="py-1">慢速</option>
                        <option value="normal" className="py-1">正常</option>
                        <option value="fast" className="py-1">快速</option>
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => setInputText('')}
                    className={`${buttonBaseStyle} flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md`}
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    清空
                  </button>
                </div>
              </div>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`${buttonBaseStyle} w-full p-3 pr-10 border rounded-md h-32 font-mono focus:ring-2 focus:ring-blue-200 focus:border-blue-300`}
                  placeholder="输入任意文本..."
                />
                <button
                  onClick={() => handleCopy(inputText, setInputCopySuccess)}
                  className={`${buttonBaseStyle} absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors group`}
                  style={{ top: 15 }}
                  title="复制输入文本"
                >
                  <ClipboardIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  {inputCopySuccess && (
                    <span className={copySuccessStyle}>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      已复制
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* 主视觉模式 */}
            {showVisualPatterns && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium mb-4 flex items-center">
                  <CubeTransparentIcon className="h-5 w-5 mr-2 text-blue-600" />
                  主哈希视觉模式
                </h3>
                <div className="flex flex-col items-center">
                  {!inputText ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg w-full">
                      <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">请输入文本以查看视觉模式</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-8 gap-px bg-gray-200 w-full max-w-[256px]">
                        {generateVisualPattern(currentHash).map((row, i) =>
                          row.map((cell, j) => (
                            <div
                              key={`${i}-${j}`}
                              className={`aspect-square ${cell === '1' ? 'bg-blue-600' : 'bg-white'
                                } transition-colors duration-300 hover:opacity-75`}
                            />
                          ))
                        )}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-sm font-medium text-gray-600">1位数量</div>
                          <div className="text-lg font-mono mt-1">
                            {currentHash.split('').reduce((acc, char) => {
                              const bin = parseInt(char, 16).toString(2).padStart(4, '0');
                              return acc + bin.split('1').length - 1;
                            }, 0)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-sm font-medium text-gray-600">0位数量</div>
                          <div className="text-lg font-mono mt-1">
                            {currentHash.split('').reduce((acc, char) => {
                              const bin = parseInt(char, 16).toString(2).padStart(4, '0');
                              return acc + bin.split('0').length - 1;
                            }, 0)}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 对比输入区域和视觉模式 */}
          {showComparison && (
            <div className="space-y-6">
              {/* 对比输入区域 */}
              <div className={`bg-white rounded-lg shadow-sm p-4 space-y-4 transition-all duration-300 w-full ${showComparison ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">对比文本</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSwapTexts}
                      className={`${buttonBaseStyle} flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md`}
                      title="交换文本"
                    >
                      <ArrowsRightLeftIcon className="h-4 w-4 mr-1" />
                      交换
                    </button>
                    <button
                      onClick={() => setComparisonText(inputText)}
                      className={`${buttonBaseStyle} flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md`}
                      title="复制主输入文本"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                      复制主文本
                    </button>
                    <button
                      onClick={() => setComparisonText('')}
                      className={`${buttonBaseStyle} flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md`}
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      清空
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <textarea
                    value={comparisonText}
                    onChange={(e) => setComparisonText(e.target.value)}
                    className={`${buttonBaseStyle} w-full p-3 pr-10 border rounded-md h-32 font-mono focus:ring-2 focus:ring-blue-200 focus:border-blue-300`}
                    placeholder="输入要对比的文本..."
                    disabled={!showComparison}
                  />
                  <button
                    onClick={() => handleCopy(comparisonText, setComparisonCopySuccess)}
                    className={`${buttonBaseStyle} absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors group`}
                    style={{ top: 15 }}
                    title="复制对比文本"
                    disabled={!showComparison}
                  >
                    <ClipboardIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    {comparisonCopySuccess && (
                      <span className={copySuccessStyle}>
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        已复制
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* 对比视觉模式 */}
              {showVisualPatterns && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-sm font-medium mb-4 flex items-center">
                    <CubeTransparentIcon className="h-5 w-5 mr-2 text-blue-600" />
                    对比哈希视觉模式
                  </h3>
                  <div className="flex flex-col items-center">
                    {!comparisonText ? (
                      <div className="text-center p-6 bg-gray-50 rounded-lg w-full">
                        <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500">请输入对比文本以查看视觉模式</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-8 gap-px bg-gray-200 w-full max-w-[256px]">
                          {generateVisualPattern(comparisonHash).map((row, i) =>
                            row.map((cell, j) => (
                              <div
                                key={`${i}-${j}`}
                                className={`aspect-square ${cell === '1' ? 'bg-blue-600' : 'bg-white'
                                  } transition-colors duration-300 hover:opacity-75`}
                              />
                            ))
                          )}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 w-full">
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-sm font-medium text-gray-600">1位数量</div>
                            <div className="text-lg font-mono mt-1">
                              {comparisonHash.split('').reduce((acc, char) => {
                                const bin = parseInt(char, 16).toString(2).padStart(4, '0');
                                return acc + bin.split('1').length - 1;
                              }, 0)}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-sm font-medium text-gray-600">0位数量</div>
                            <div className="text-lg font-mono mt-1">
                              {comparisonHash.split('').reduce((acc, char) => {
                                const bin = parseInt(char, 16).toString(2).padStart(4, '0');
                                return acc + bin.split('0').length - 1;
                              }, 0)}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 哈希值显示区域 */}
        <div className="mt-6 space-y-4">
          {/* 主哈希值 */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <TableCellsIcon className="h-5 w-5 mr-2" />
                <h3 className="font-medium">主哈希值</h3>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  长度: {showBinaryView ? currentHash.length * 4 : currentHash.length} {showBinaryView ? '位' : '字符'}
                </span>
              </div>
            </div>
            <div className={`relative bg-gray-50 p-4 rounded-lg overflow-x-auto transition-all duration-300 ${animateChange ? 'bg-yellow-50' : ''
              }`}>
              <div className="font-mono text-sm flex flex-wrap pr-10">
                {(showBinaryView ? hexToBinary(currentHash) : currentHash).split('').map((bit, index) => {
                  const hexIndex = showBinaryView ? Math.floor(index / 4) : index;
                  const isDifferent = hashComparison?.diffPositions.includes(hexIndex);

                  return (
                    <span
                      key={index}
                      onClick={() => handleBitHighlight(index)}
                      className={`cursor-pointer ${hashBits[hexIndex]?.changed
                        ? 'bg-yellow-200 text-red-600'
                        : isDifferent
                          ? 'bg-red-100 text-red-600'
                          : highlightedBits.includes(index)
                            ? 'bg-blue-200'
                            : ''
                        } ${showBinaryView ? 'mx-px' : ''
                        } transition-colors duration-300 p-1 hover:bg-blue-100`}
                      title={`位置: ${index + 1}`}
                    >
                      {bit}
                    </span>
                  );
                })}
              </div>
              <button
                onClick={() => handleCopy(currentHash, setMainHashCopySuccess)}
                className={`${buttonBaseStyle} absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors group`}
                style={{ top: 15 }}
                title="复制主哈希值"
              >
                <ClipboardIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                {mainHashCopySuccess && (
                  <span className={copySuccessStyle}>
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    已复制
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* 对比哈希值 */}
          {showComparison && comparisonHash && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <TableCellsIcon className="h-5 w-5 mr-2" />
                  <h3 className="font-medium">对比哈希值</h3>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    长度: {showBinaryView ? comparisonHash.length * 4 : comparisonHash.length} {showBinaryView ? '位' : '字符'}
                  </span>
                </div>
              </div>
              <div className="relative bg-gray-50 p-4 rounded-lg overflow-x-auto">
                <div className="font-mono text-sm flex flex-wrap pr-10">
                  {(showBinaryView ? hexToBinary(comparisonHash) : comparisonHash).split('').map((bit, index) => {
                    const hexIndex = showBinaryView ? Math.floor(index / 4) : index;
                    const isDifferent = hashComparison?.diffPositions.includes(hexIndex);

                    return (
                      <span
                        key={index}
                        className={`${isDifferent
                          ? 'bg-red-100 text-red-600'
                          : ''
                          } ${showBinaryView ? 'mx-px' : ''
                          } transition-colors duration-300 p-1`}
                        title={`位置: ${index + 1}`}
                      >
                        {bit}
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => handleCopy(comparisonHash, setCompareHashCopySuccess)}
                  className={`${buttonBaseStyle} absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors group`}
                  style={{ top: 15 }}
                  title="复制对比哈希值"
                >
                  <ClipboardIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  {compareHashCopySuccess && (
                    <span className={copySuccessStyle}>
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      已复制
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* 对比视图区域 */}
          {showComparison && (
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium flex items-center">
                  <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                  哈希值对比
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowBinaryView(!showBinaryView)}
                    className={`${buttonBaseStyle} px-3 py-1 text-sm rounded-md ${showBinaryView ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                  >
                    {showBinaryView ? '二进制视图' : '十六进制视图'}
                  </button>
                </div>
              </div>

              {/* 对比内容 */}
              <div className="space-y-6">
                {/* 并排对比视图 */}
                <div className="grid grid-cols-2 gap-8">
                  {/* 主哈希值 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">主哈希值</span>
                      <span className="text-xs text-gray-500">
                        长度: {showBinaryView ? currentHash.length * 4 : currentHash.length}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      <div className="font-mono text-sm flex flex-wrap">
                        {(showBinaryView ? hexToBinary(currentHash) : currentHash).split('').map((bit, index) => {
                          const hexIndex = showBinaryView ? Math.floor(index / 4) : index;
                          const isDifferent = hashComparison?.diffPositions.includes(hexIndex);
                          return (
                            <span
                              key={index}
                              className={`transition-all duration-300 p-1 cursor-pointer ${isDifferent ? 'bg-red-100 text-red-600' : ''
                                } hover:bg-blue-100`}
                              title={`位置: ${index + 1}${isDifferent ? ' (差异)' : ''}`}
                            >
                              {bit}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* 对比哈希值 */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">对比哈希值</span>
                      <span className="text-xs text-gray-500">
                        长度: {showBinaryView ? comparisonHash.length * 4 : comparisonHash.length}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                      <div className="font-mono text-sm flex flex-wrap">
                        {(showBinaryView ? hexToBinary(comparisonHash) : comparisonHash).split('').map((bit, index) => {
                          const hexIndex = showBinaryView ? Math.floor(index / 4) : index;
                          const isDifferent = hashComparison?.diffPositions.includes(hexIndex);
                          return (
                            <span
                              key={index}
                              className={`transition-all duration-300 p-1 cursor-pointer ${isDifferent ? 'bg-red-100 text-red-600' : ''
                                } hover:bg-blue-100`}
                              title={`位置: ${index + 1}${isDifferent ? ' (差异)' : ''}`}
                            >
                              {bit}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 差异分析 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                      差异分析
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* 差异位置分布 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">差异位置分布</h4>
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                        {hashComparison?.diffPositions.map((pos, index) => (
                          <div
                            key={index}
                            className="absolute h-full bg-red-500 opacity-50"
                            style={{
                              left: `${(pos / currentHash.length) * 100}%`,
                              width: '1%'
                            }}
                            title={`位置: ${pos + 1}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        差异集中在 {hashComparison?.diffPositions.length} 个位置
                      </p>
                    </div>

                    {/* 连续差异分析 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">连续差异分析</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">最长连续差异</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.reduce((max, pos, i, arr) => {
                              if (i === 0) return 1;
                              const curr = pos - arr[i - 1] === 1 ? max + 1 : 1;
                              return Math.max(max, curr);
                            }, 1) || 0} 位
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">差异段数</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.reduce((count, pos, i, arr) => {
                              if (i === 0) return 1;
                              return pos - arr[i - 1] > 1 ? count + 1 : count;
                            }, 1) || 0} 段
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 差异特征 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">差异特征</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">前32位差异</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.filter(pos => pos < 32).length || 0} 位
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">后32位差异</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.filter(pos => pos >= 32).length || 0} 位
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 分布对比 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <ChartPieIcon className="h-5 w-5 mr-2" />
                      分布对比
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* 字符分布对比 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">字符分布对比</h4>
                      <div className="space-y-2">
                        {Array.from(new Set([
                          ...hashStats.distribution.map(([char]) => char),
                          ...(comparisonHash?.split('') || [])
                        ])).sort().map(char => {
                          const mainCount = currentHash.split(char).length - 1;
                          const compCount = comparisonHash?.split(char).length - 1 || 0;
                          return (
                            <div key={char} className="flex items-center">
                              <span className="font-mono w-8">{char}</span>
                              <div className="flex-grow mx-2">
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-blue-600"
                                    style={{ width: `${(mainCount / currentHash.length) * 100}%` }}
                                  />
                                  <div
                                    className="h-full bg-red-600 opacity-50"
                                    style={{ width: `${(compCount / (comparisonHash?.length || 1)) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm text-gray-600 w-24 text-right">
                                {mainCount} vs {compCount}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 统计对比 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-sm font-medium text-gray-600">独特字符差异</div>
                        <div className="text-lg font-mono mt-1">
                          {Math.abs(
                            new Set(currentHash.split('')).size -
                            new Set(comparisonHash?.split('') || []).size
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-sm font-medium text-gray-600">熵值差异</div>
                        <div className="text-lg font-mono mt-1">
                          {Math.abs(hashStats.entropy - (hashComparison?.entropy || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 对比结果 */}
          {showComparison && hashComparison && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-4">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                <h3 className="font-medium">对比结果</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg ${hashComparison.identical ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">状态</span>
                    {hashComparison.identical ? (
                      <span className="text-green-600 text-sm">完全相同</span>
                    ) : (
                      <span className="text-red-600 text-sm">存在差异</span>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">差异字符数</span>
                    <span className="text-gray-600 text-sm">{hashComparison.diffCount}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">差异比特数</span>
                    <span className="text-gray-600 text-sm">{hashComparison.diffBits}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">差异比例</span>
                    <span className="text-gray-600 text-sm">{hashComparison.diffPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* 标签页内容 */}
        <div className={`mt-6 ${showComparison ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* 左侧内容 */}
          <div className="space-y-6">
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
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
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
              <div className="space-y-6">
                {/* 基本统计 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <ChartBarIcon className="h-5 w-5 mr-2" />
                      基本统计
                    </h3>
                    <div className="flex items-center space-x-3">
                      <select
                        value={showBinaryView ? 'binary' : 'hex'}
                        onChange={(e) => setShowBinaryView(e.target.value === 'binary')}
                        className={`${selectBaseStyle} min-w-[100px] text-sm`}
                      >
                        <option value="hex" className="py-1">十六进制</option>
                        <option value="binary" className="py-1">二进制</option>
                      </select>
                      <select
                        value={showAdvancedStats ? 'advanced' : 'basic'}
                        onChange={(e) => setShowAdvancedStats(e.target.value === 'advanced')}
                        className={`${selectBaseStyle} min-w-[100px] text-sm`}
                      >
                        <option value="basic" className="py-1">基础统计</option>
                        <option value="advanced" className="py-1">高级统计</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">哈希长度</h4>
                      <p className="text-lg font-mono mt-1">
                        {showBinaryView ? currentHash.length * 4 : currentHash.length}
                        <span className="text-sm text-gray-500 ml-1">
                          {showBinaryView ? '位' : '字符'}
                        </span>
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">熵值</h4>
                      <p className="text-lg font-mono mt-1">
                        {hashStats.entropy.toFixed(2)}
                        <span className="text-sm text-gray-500 ml-1">比特/字符</span>
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">雪崩效应</h4>
                      <p className="text-lg font-mono mt-1">
                        {avalancheEffect.toFixed(1)}%
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">字符种类</h4>
                      <p className="text-lg font-mono mt-1">
                        {hashStats.distribution.length}
                        <span className="text-sm text-gray-500 ml-1">种</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 分布分析 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <ChartPieIcon className="h-5 w-5 mr-2" />
                      分布分析
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">字符分布</h4>
                      <div className="space-y-2">
                        {hashStats.distribution.map(([char, count], index) => (
                          <div key={index} className="flex items-center">
                            <span className="font-mono w-8">{char}</span>
                            <div className="flex-grow mx-2">
                              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 transition-all duration-300"
                                  style={{ width: `${(count / currentHash.length) * 100}%` }}
                                />
                              </div>
                            </div>
                            <span className="text-sm text-gray-600 w-16 text-right">
                              {((count / currentHash.length) * 100).toFixed(1)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-3">二进制分布</h4>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">0/1 比例</span>
                            <span className="text-sm text-gray-600">
                              {((hashStats.zeros / (hashStats.zeros + hashStats.ones)) * 100).toFixed(1)}% /
                              {((hashStats.ones / (hashStats.zeros + hashStats.ones)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{
                                width: `${(hashStats.zeros / (hashStats.zeros + hashStats.ones)) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-mono">{hashStats.zeros}</div>
                            <div className="text-sm text-gray-600">零位数量</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg text-center">
                            <div className="text-2xl font-mono">{hashStats.ones}</div>
                            <div className="text-sm text-gray-600">一位数量</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 序列分析 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="font-medium mb-4 flex items-center">
                    <AcademicCapIcon className="h-5 w-5 mr-2" />
                    序列分析
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3">连续性分析</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>最长连续相同字符</span>
                            <span className="font-mono">
                              {currentHash.match(/(.)\1*/g)?.reduce((max, curr) =>
                                curr.length > max ? curr.length : max, 0) || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>不同字符对数量</span>
                            <span className="font-mono">
                              {currentHash.split('').reduce((count, _, i) =>
                                i > 0 && currentHash[i] !== currentHash[i - 1] ? count + 1 : count, 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-3">模式分析</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>重复模式数</span>
                          <span className="font-mono">
                            {new Set(currentHash.match(/.{2}/g)).size}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>独特字符数</span>
                          <span className="font-mono">
                            {new Set(currentHash.split('')).size}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 对比基本统计 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <ChartBarIcon className="h-5 w-5 mr-2" />
                      对比统计
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">差异位数</h4>
                      <p className="text-lg font-mono mt-1">
                        {hashComparison?.diffBits || 0}
                        <span className="text-sm text-gray-500 ml-1">位</span>
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-600">差异比例</h4>
                      <p className="text-lg font-mono mt-1">
                        {hashComparison?.diffPercentage.toFixed(1) || '0.0'}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* 差异分析 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                      差异分析
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* 差异位置分布 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">差异位置分布</h4>
                      <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                        {hashComparison?.diffPositions.map((pos, index) => (
                          <div
                            key={index}
                            className="absolute h-full bg-red-500 opacity-50"
                            style={{
                              left: `${(pos / currentHash.length) * 100}%`,
                              width: '1%'
                            }}
                            title={`位置: ${pos + 1}`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        差异集中在 {hashComparison?.diffPositions.length} 个位置
                      </p>
                    </div>

                    {/* 连续差异分析 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">连续差异分析</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">最长连续差异</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.reduce((max, pos, i, arr) => {
                              if (i === 0) return 1;
                              const curr = pos - arr[i - 1] === 1 ? max + 1 : 1;
                              return Math.max(max, curr);
                            }, 1) || 0} 位
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">差异段数</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.reduce((count, pos, i, arr) => {
                              if (i === 0) return 1;
                              return pos - arr[i - 1] > 1 ? count + 1 : count;
                            }, 1) || 0} 段
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 差异特征 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">差异特征</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">前32位差异</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.filter(pos => pos < 32).length || 0} 位
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">后32位差异</p>
                          <p className="text-lg font-mono">
                            {hashComparison?.diffPositions.filter(pos => pos >= 32).length || 0} 位
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 分布对比 */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium flex items-center">
                      <ChartPieIcon className="h-5 w-5 mr-2" />
                      分布对比
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* 字符分布对比 */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium mb-2">字符分布对比</h4>
                      <div className="space-y-2">
                        {Array.from(new Set([
                          ...hashStats.distribution.map(([char]) => char),
                          ...(comparisonHash?.split('') || [])
                        ])).sort().map(char => {
                          const mainCount = currentHash.split(char).length - 1;
                          const compCount = comparisonHash?.split(char).length - 1 || 0;
                          return (
                            <div key={char} className="flex items-center">
                              <span className="font-mono w-8">{char}</span>
                              <div className="flex-grow mx-2">
                                <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                                  <div
                                    className="h-full bg-blue-600"
                                    style={{ width: `${(mainCount / currentHash.length) * 100}%` }}
                                  />
                                  <div
                                    className="h-full bg-red-600 opacity-50"
                                    style={{ width: `${(compCount / (comparisonHash?.length || 1)) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm text-gray-600 w-24 text-right">
                                {mainCount} vs {compCount}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 统计对比 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-sm font-medium text-gray-600">独特字符差异</div>
                        <div className="text-lg font-mono mt-1">
                          {Math.abs(
                            new Set(currentHash.split('')).size -
                            new Set(comparisonHash?.split('') || []).size
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-sm font-medium text-gray-600">熵值差异</div>
                        <div className="text-lg font-mono mt-1">
                          {Math.abs(hashStats.entropy - (hashComparison?.entropy || 0)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 对比雪崩效应 */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium mb-3">雪崩效应分析</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">输入文本差异</span>
                      <span className="text-sm font-mono">
                        {Array.from(inputText).reduce((count, char, i) =>
                          count + (char !== comparisonText[i] ? 1 : 0), 0)} 位
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">哈希值变化率</span>
                        <span className="text-sm font-mono">
                          {(hashComparison?.avalancheEffect || 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${(hashComparison?.avalancheEffect || 0) > 45 ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                          style={{ width: `${hashComparison?.avalancheEffect || 0}%` }}
                        />
                      </div>
                      {(hashComparison?.avalancheEffect || 0) > 45 && (
                        <p className="text-xs text-green-600 mt-1">
                          达到理想的雪崩效应（&gt;45%）
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600">变化位置分布</div>
                        <div className="text-lg font-mono mt-1">
                          前32位: {hashComparison?.diffPositions.filter(pos => pos < 32).length || 0}
                          <br />
                          后32位: {hashComparison?.diffPositions.filter(pos => pos >= 32).length || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-600">最长连续变化</div>
                        <div className="text-lg font-mono mt-1">
                          {hashComparison?.diffPositions.reduce((max, pos, i, arr) => {
                            if (i === 0) return 1;
                            const curr = pos - arr[i - 1] === 1 ? max + 1 : 1;
                            return Math.max(max, curr);
                          }, 1) || 0} 位
                        </div>
                      </div>
                    </div>
                  </div>
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

          {/* 右侧内容（对比模式） */}
          {showComparison && (
            <div className="space-y-6">
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  {/* 对比基本统计 */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        对比统计
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-600">差异位数</h4>
                        <p className="text-lg font-mono mt-1">
                          {hashComparison?.diffBits || 0}
                          <span className="text-sm text-gray-500 ml-1">位</span>
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-600">差异比例</h4>
                        <p className="text-lg font-mono mt-1">
                          {hashComparison?.diffPercentage.toFixed(1) || '0.0'}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 差异分析 */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium flex items-center">
                        <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                        差异分析
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {/* 差异位置分布 */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">差异位置分布</h4>
                        <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
                          {hashComparison?.diffPositions.map((pos, index) => (
                            <div
                              key={index}
                              className="absolute h-full bg-red-500 opacity-50"
                              style={{
                                left: `${(pos / currentHash.length) * 100}%`,
                                width: '1%'
                              }}
                              title={`位置: ${pos + 1}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          差异集中在 {hashComparison?.diffPositions.length} 个位置
                        </p>
                      </div>

                      {/* 连续差异分析 */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">连续差异分析</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">最长连续差异</p>
                            <p className="text-lg font-mono">
                              {hashComparison?.diffPositions.reduce((max, pos, i, arr) => {
                                if (i === 0) return 1;
                                const curr = pos - arr[i - 1] === 1 ? max + 1 : 1;
                                return Math.max(max, curr);
                              }, 1) || 0} 位
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">差异段数</p>
                            <p className="text-lg font-mono">
                              {hashComparison?.diffPositions.reduce((count, pos, i, arr) => {
                                if (i === 0) return 1;
                                return pos - arr[i - 1] > 1 ? count + 1 : count;
                              }, 1) || 0} 段
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 差异特征 */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">差异特征</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">前32位差异</p>
                            <p className="text-lg font-mono">
                              {hashComparison?.diffPositions.filter(pos => pos < 32).length || 0} 位
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">后32位差异</p>
                            <p className="text-lg font-mono">
                              {hashComparison?.diffPositions.filter(pos => pos >= 32).length || 0} 位
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 分布对比 */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium flex items-center">
                        <ChartPieIcon className="h-5 w-5 mr-2" />
                        分布对比
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {/* 字符分布对比 */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium mb-2">字符分布对比</h4>
                        <div className="space-y-2">
                          {Array.from(new Set([
                            ...hashStats.distribution.map(([char]) => char),
                            ...(comparisonHash?.split('') || [])
                          ])).sort().map(char => {
                            const mainCount = currentHash.split(char).length - 1;
                            const compCount = comparisonHash?.split(char).length - 1 || 0;
                            return (
                              <div key={char} className="flex items-center">
                                <span className="font-mono w-8">{char}</span>
                                <div className="flex-grow mx-2">
                                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                                    <div
                                      className="h-full bg-blue-600"
                                      style={{ width: `${(mainCount / currentHash.length) * 100}%` }}
                                    />
                                    <div
                                      className="h-full bg-red-600 opacity-50"
                                      style={{ width: `${(compCount / (comparisonHash?.length || 1)) * 100}%` }}
                                    />
                                  </div>
                                </div>
                                <span className="text-sm text-gray-600 w-24 text-right">
                                  {mainCount} vs {compCount}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 统计对比 */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-sm font-medium text-gray-600">独特字符差异</div>
                          <div className="text-lg font-mono mt-1">
                            {Math.abs(
                              new Set(currentHash.split('')).size -
                              new Set(comparisonHash?.split('') || []).size
                            )}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-sm font-medium text-gray-600">熵值差异</div>
                          <div className="text-lg font-mono mt-1">
                            {Math.abs(hashStats.entropy - (hashComparison?.entropy || 0)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 对比雪崩效应 */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-3">雪崩效应分析</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">输入文本差异</span>
                        <span className="text-sm font-mono">
                          {Array.from(inputText).reduce((count, char, i) =>
                            count + (char !== comparisonText[i] ? 1 : 0), 0)} 位
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">哈希值变化率</span>
                          <span className="text-sm font-mono">
                            {(hashComparison?.avalancheEffect || 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${(hashComparison?.avalancheEffect || 0) > 45 ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                            style={{ width: `${hashComparison?.avalancheEffect || 0}%` }}
                          />
                        </div>
                        {(hashComparison?.avalancheEffect || 0) > 45 && (
                          <p className="text-xs text-green-600 mt-1">
                            达到理想的雪崩效应（&gt;45%）
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600">变化位置分布</div>
                          <div className="text-lg font-mono mt-1">
                            前32位: {hashComparison?.diffPositions.filter(pos => pos < 32).length || 0}
                            <br />
                            后32位: {hashComparison?.diffPositions.filter(pos => pos >= 32).length || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-600">最长连续变化</div>
                          <div className="text-lg font-mono mt-1">
                            {hashComparison?.diffPositions.reduce((max, pos, i, arr) => {
                              if (i === 0) return 1;
                              const curr = pos - arr[i - 1] === 1 ? max + 1 : 1;
                              return Math.max(max, curr);
                            }, 1) || 0} 位
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tutorial' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <InformationCircleIcon className="h-6 w-6 mr-2 text-blue-600" />
                      <h3 className="font-medium">对比模式说明</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      对比模式允许您同时分析两个不同输入的哈希值，帮助您更好地理解哈希函数的特性。
                    </p>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">使用建议</h4>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                        <li>尝试输入相似的文本，观察差异</li>
                        <li>比较不同长度输入的哈希值</li>
                        <li>分析字符变化对哈希值的影响</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 