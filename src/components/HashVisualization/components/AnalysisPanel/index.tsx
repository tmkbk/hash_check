import { ChartBarIcon, ChartPieIcon, DocumentChartBarIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { HashStats, HashComparison, BinaryAnalysis, ComparisonAnalysisResult } from '../../../../types/hash';
import { getAvalancheEffectDescription, getDiffDescription, getEntropyQuality } from '../../../../utils/hashAnalysis';
import CharDistribution from '../CharDistribution';
import BinaryDistribution from '../BinaryDistribution';
import DiffHeatmap from '../DiffHeatmap';

interface AnalysisPanelProps {
  currentHash: string;
  comparisonHash?: string;
  hashComparison?: HashComparison | null;
  hashStats: HashStats;
  showBinaryView: boolean;
  hashAnalysis: BinaryAnalysis | null;
  comparisonAnalysis?: ComparisonAnalysisResult | null;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  currentHash,
  comparisonHash,
  hashComparison,
  hashStats,
  showBinaryView,
  hashAnalysis,
  comparisonAnalysis
}) => {
  return (
    <div className="space-y-6">
      {/* 基本统计 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            基本统计
          </h3>
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
            <h4 className="text-sm font-medium text-gray-600">字符种类</h4>
            <p className="text-lg font-mono mt-1">
              {hashStats.distribution.length}
              <span className="text-sm text-gray-500 ml-1">种</span>
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-600">分布均匀度</h4>
            <p className="text-lg font-mono mt-1">
              {((hashStats.entropy / Math.log2(16)) * 100).toFixed(1)}%
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
                <CharDistribution
                  key={index}
                  char={char}
                  mainCount={count}
                  total={currentHash.length}
                />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-3">二进制分布</h4>
            {hashAnalysis && (
              <BinaryDistribution
                zeros={hashAnalysis.zeros}
                ones={hashAnalysis.ones}
              />
            )}
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

      {/* 对比分析（如果有对比哈希值） */}
      {comparisonHash && hashComparison && comparisonAnalysis && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center">
              <DocumentChartBarIcon className="h-5 w-5 mr-2" />
              对比分析
            </h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-lg ${hashComparison.identical ? 'bg-green-50' : 'bg-blue-50'}`}>
                <h4 className="text-sm font-medium mb-2">总体评估</h4>
                <div className="text-2xl font-bold mb-1">
                  {hashComparison.identical ? '完全相同' : getDiffDescription(hashComparison.diffPercentage)}
                </div>
              </div>

              <div className={`p-4 rounded-lg ${hashComparison.avalancheEffect > 45 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <h4 className="text-sm font-medium mb-2">雪崩效应</h4>
                <div className="text-2xl font-bold mb-1">
                  {getAvalancheEffectDescription(hashComparison.avalancheEffect)}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50">
                <h4 className="text-sm font-medium mb-2">熵值质量</h4>
                <div className="text-2xl font-bold mb-1">
                  {getEntropyQuality(hashStats.entropy)}
                </div>
              </div>
            </div>

            {/* 差异分布热图 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-4">差异分布热图</h4>
              <DiffHeatmap
                diffPositions={hashComparison.diffPositions}
                totalLength={currentHash.length}
              />
              <p className="text-xs text-gray-500 mt-2">
                差异集中在 {hashComparison.diffPositions.length} 个位置
              </p>
            </div>

            {/* 字符分布对比 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-4">字符分布对比</h4>
              <div className="space-y-2">
                {comparisonAnalysis.charDistribution.map((item, index) => (
                  <CharDistribution
                    key={index}
                    char={item.char}
                    mainCount={item.mainCount}
                    compCount={item.compCount}
                    total={currentHash.length}
                    compTotal={comparisonHash.length}
                  />
                ))}
              </div>
            </div>

            {/* 分析总结 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">分析总结</h4>
              <p className="text-sm text-gray-700">
                {comparisonAnalysis.summary}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel; 