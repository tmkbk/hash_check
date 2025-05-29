import { useState, useCallback } from 'react';
import { DemoExample, TabType } from '../../types/hash';
import { INTERACTIVE_DEMOS } from '../../constants/hashDemo';
import { useHashAnalysis } from '../../hooks/useHashAnalysis';
import { useAnimationState } from '../../hooks/useAnimationState';

// 导入子组件
import InputSection from './components/InputSection';
import ComparisonSection from './components/ComparisonSection';
import HashDisplay from './components/HashDisplay';
import ControlPanel from './components/ControlPanel';
import AnalysisPanel from './components/AnalysisPanel';
import TutorialPanel from './components/TutorialPanel';

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

  // 处理输入变化
  function handleInputChange(text: string) {
    setInputText(text);
  }

  // 处理对比文本变化
  const handleComparisonChange = useCallback((text: string) => {
    setComparisonText(text);
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

  // 处理演示示例选择
  const handleDemoSelect = useCallback((index: number) => {
    setSelectedDemoIndex(index);
    const demo = INTERACTIVE_DEMOS[index];
    setCurrentDemo(demo);
    handleInputChange(demo.input);
    setComparisonText('');
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <ControlPanel
        showBinaryView={showBinaryView}
        onBinaryViewToggle={() => setShowBinaryView(prev => !prev)}
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
        onDemoSelect={handleDemoSelect}
        selectedDemoIndex={selectedDemoIndex}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          }}
        />
      </div>

      {currentHash && (
        <div className="space-y-4">
          <HashDisplay
            title="当前哈希值"
            currentHash={currentHash}
            showBinaryView={showBinaryView}
            hashBits={hashBits}
            highlightedBits={highlightedBits}
            onBitHighlight={handleBitHighlight}
            onCopy={handleCopy}
            copySuccess={copySuccess}
            animateChange={hashBits.some(bit => bit.changed)}
          />

          {comparisonHash && (
            <HashDisplay
              title="对比哈希值"
              currentHash={comparisonHash}
              showBinaryView={showBinaryView}
              hashBits={hashBits}
              highlightedBits={highlightedBits}
              diffPositions={hashComparison?.diffPositions}
              onBitHighlight={handleBitHighlight}
              onCopy={() => { }}
              copySuccess={false}
            />
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

          {selectedTab === 'tutorial' && <TutorialPanel />}
        </div>
      )}
    </div>
  );
};

export default HashVisualization; 