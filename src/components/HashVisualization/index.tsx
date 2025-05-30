import React, { useState, useCallback, useEffect } from 'react';
import { DemoExample, TabType } from '@/types/hash';
import { INTERACTIVE_DEMOS } from '@/constants/hashDemo';
import { useHashAnalysis } from '@/hooks/useHashAnalysis';
import { useAnimationState } from '@/hooks/useAnimationState';
import { DocumentChartBarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// 导入子组件
import InputSection from '@/components/InputSection';
import ComparisonSection from '@/components/ComparisonSection';
import HashDisplay from '@/components/HashDisplay';
import ControlPanel from '@/components/ControlPanel';
import AnalysisPanel from '@/components/AnalysisPanel';
import TutorialPanel from '@/components/TutorialPanel';
import HashVisualizationView from '@/components/HashVisualizationView';
import HashComparisonView from '@/components/HashComparisonView';

// 添加基础样式常量
const buttonBaseStyle = "focus:outline-none focus:ring-0 transition-colors duration-200";
const buttonPrimaryStyle = `${buttonBaseStyle} px-4 py-2 rounded-lg text-white transition-colors`;
const buttonSecondaryStyle = `${buttonBaseStyle} px-3 py-1.5 text-sm rounded-md transition-colors`;

const HashVisualization: React.FC = () => {
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [comparisonText, setComparisonText] = useState('');
  const [showBinaryView, setShowBinaryView] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('visualization');
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number | null>(null);
  const [currentDemo, setCurrentDemo] = useState<DemoExample | null>(null);
  const [highlightedBits, setHighlightedBits] = useState<number[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [comparisonCopySuccess, setComparisonCopySuccess] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [previousHash, setPreviousHash] = useState<string>('');

  // 使用自定义 hooks
  const {
    currentHash,
    comparisonHash,
    hashBits,
    hashStats,
    hashComparison,
    hashAnalysis,
    comparisonAnalysis
  } = useHashAnalysis(inputText, comparisonText);

  const {
    animationState,
    toggleAnimation,
    setAnimationSpeed,
    resetAnimation
  } = useAnimationState(currentDemo, handleInputChange);

  // 当哈希值改变时更新previousHash
  useEffect(() => {
    if (currentHash && currentHash !== previousHash) {
      setPreviousHash(currentHash);
    }
  }, [currentHash]);

  // 处理输入变化
  function handleInputChange(text: string) {
    setInputText(text);
    if (!text) {
      setPreviousHash(''); // 重置文本时清空previousHash
    }
  }

  // 处理对比文本变化
  const handleComparisonChange = useCallback((text: string) => {
    setComparisonText(text);
    setShowComparison(text.length > 0);
  }, []);

  // 处理位高亮
  const handleBitHighlight = useCallback((index: number) => {
    setHighlightedBits(prev => {
      const isHighlighted = prev.includes(index);
      return isHighlighted ? prev.filter(i => i !== index) : [...prev, index];
    });
  }, []);

  // 处理复制
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentHash);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [currentHash]);

  // 处理对比哈希值复制
  const handleComparisonCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(comparisonHash);
      setComparisonCopySuccess(true);
      setTimeout(() => setComparisonCopySuccess(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, [comparisonHash]);

  // 处理演示示例选择
  const handleDemoSelect = useCallback((index: number) => {
    setSelectedDemoIndex(index);
    const demo = INTERACTIVE_DEMOS[index];
    setCurrentDemo(demo);
    handleInputChange(demo.input);
    setComparisonText('');
  }, []);

  // 处理二进制视图切换
  const handleBinaryViewToggle = useCallback(() => {
    setShowBinaryView(prev => !prev);
    setPreviousHash(''); // 切换进制时清空previousHash
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <ControlPanel
          showBinaryView={showBinaryView}
          onBinaryViewToggle={handleBinaryViewToggle}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          onDemoSelect={handleDemoSelect}
          selectedDemoIndex={selectedDemoIndex}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {selectedTab !== 'tutorial' && (
          <>
            <InputSection
              inputText={inputText}
              onInputChange={handleInputChange}
              onAnimationToggle={toggleAnimation}
              onAnimationSpeedChange={setAnimationSpeed}
              onResetDemo={() => {
                setInputText('');
                handleInputChange('');
                setSelectedDemoIndex(null);
                setCurrentDemo(null);
                resetAnimation();
              }}
              animationState={animationState}
              currentDemo={currentDemo}
            />

            <ComparisonSection
              comparisonText={comparisonText}
              onComparisonChange={handleComparisonChange}
              onResetComparison={() => {
                setComparisonText('');
                setShowComparison(false);
              }}
            />
          </>
        )}
      </div>

      {currentHash && inputText && selectedTab !== 'tutorial' && (
        <div className="space-y-4">
          <HashDisplay
            title="当前哈希值"
            currentHash={currentHash}
            showBinaryView={showBinaryView}
            hashBits={hashBits}
            highlightedBits={highlightedBits}
            diffPositions={showComparison ? hashComparison?.diffPositions || [] : []}
            onBitHighlight={handleBitHighlight}
            onCopy={handleCopy}
            copySuccess={copySuccess}
            animateChange={!showComparison && hashBits.some(bit => bit.changed)}
            previousHash={showComparison ? undefined : previousHash}
          />

          {comparisonHash && (
            <HashDisplay
              title="对比哈希值"
              currentHash={comparisonHash}
              showBinaryView={showBinaryView}
              hashBits={hashBits}
              highlightedBits={highlightedBits}
              diffPositions={hashComparison?.diffPositions || []}
              onBitHighlight={handleBitHighlight}
              onCopy={handleComparisonCopy}
              copySuccess={comparisonCopySuccess}
            />
          )}

          {selectedTab === 'visualization' && hashStats && !comparisonHash && (
            <HashVisualizationView
              currentHash={currentHash}
              comparisonHash={comparisonHash}
              hashStats={hashStats}
              showBinaryView={showBinaryView}
              showComparisonMode={showComparison}
            />
          )}

          {showComparison && hashComparison && comparisonAnalysis && hashStats && (
            <>
              <HashVisualizationView
                currentHash={currentHash}
                comparisonHash={comparisonHash}
                hashStats={hashStats}
                showBinaryView={showBinaryView}
                showComparisonMode={showComparison}
              />
              <HashComparisonView
                currentHash={currentHash}
                comparisonHash={comparisonHash}
                hashComparison={hashComparison}
                comparisonAnalysis={comparisonAnalysis}
                showBinaryView={showBinaryView}
              />
            </>
          )}

          {selectedTab === 'analysis' && hashStats && (
            <AnalysisPanel
              currentHash={currentHash}
              comparisonHash={comparisonHash}
              hashComparison={hashComparison}
              hashStats={hashStats}
              showBinaryView={showBinaryView}
              hashAnalysis={hashAnalysis}
              comparisonAnalysis={comparisonAnalysis}
            />
          )}
        </div>
      )}

      {selectedTab !== 'tutorial' && !inputText && (
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-blue-600 mb-2 text-lg font-medium">开始体验哈希可视化</div>
          <p className="text-blue-500">
            在上方输入框中输入任意文本，或选择一个演示示例，即可查看哈希值的可视化效果
          </p>
        </div>
      )}

      {selectedTab === 'tutorial' && (
        <div className="space-y-6">
          <TutorialPanel />
          <div className="flex justify-center space-x-4 pt-6">
            <button
              onClick={() => setSelectedTab('visualization')}
              className={`${buttonPrimaryStyle} bg-blue-600 hover:bg-blue-700`}
            >
              <ChartBarIcon className="h-5 w-5 mr-2 inline" />
              前往可视化界面
            </button>
            <button
              onClick={() => setSelectedTab('analysis')}
              className={`${buttonPrimaryStyle} bg-green-600 hover:bg-green-700`}
            >
              <DocumentChartBarIcon className="h-5 w-5 mr-2 inline" />
              前往分析界面
            </button>
          </div>
        </div>
      )}

      {/* 对比视图区域 */}
      {showComparison && hashComparison && comparisonAnalysis && selectedTab === 'visualization' && (
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <DocumentChartBarIcon className="h-5 w-5 mr-2" />
              哈希值对比分析
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBinaryView(!showBinaryView)}
                className={`${buttonSecondaryStyle} ${showBinaryView ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                {showBinaryView ? '二进制视图' : '十六进制视图'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧：差异分析 */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">差异概览</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">差异位数</p>
                    <p className="text-lg font-mono">
                      {hashComparison.diffBits} 位
                      <span className="text-sm text-gray-500 ml-2">
                        ({hashComparison.diffPercentage.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">雪崩效应</p>
                    <p className="text-lg font-mono">
                      {hashComparison.avalancheEffect.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 右侧：分布分析 */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">分布分析</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">前半部分差异</p>
                    <p className="text-lg font-mono">
                      {comparisonAnalysis.frontHalfDiffs.length} 位
                      <span className="text-sm text-gray-500 ml-2">
                        ({comparisonAnalysis.frontHalfPercentage.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">后半部分差异</p>
                    <p className="text-lg font-mono">
                      {comparisonAnalysis.backHalfDiffs.length} 位
                      <span className="text-sm text-gray-500 ml-2">
                        ({comparisonAnalysis.backHalfPercentage.toFixed(1)}%)
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HashVisualization; 