import React from 'react';
import {
  ChartPieIcon,
  DocumentChartBarIcon,
  BeakerIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline';
import { HashStats, HashComparison, BinaryAnalysis, ComparisonAnalysisResult } from 'src/types/hash';
import DiffHeatmap from '@components/DiffHeatmap';
import CharDistribution from '@components/CharDistribution';

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
  hashAnalysis,
  comparisonAnalysis
}) => {
  const getEntropyQuality = (entropy: number): string => {
    if (entropy > 7) return '高';
    if (entropy > 5) return '中';
    return '低';
  };

  const getDistributionQuality = (distribution: Array<[string, number]>): string => {
    const maxCount = Math.max(...distribution.map(([_, count]) => count));
    const minCount = Math.min(...distribution.map(([_, count]) => count));
    const ratio = maxCount / minCount;
    if (ratio < 1.5) return '优秀';
    if (ratio < 2) return '良好';
    if (ratio < 3) return '一般';
    return '不均匀';
  };

  return (
    <div className="space-y-6">
      {/* 基础分析 */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium flex items-center mb-4">
          <BeakerIcon className="h-6 w-6 mr-2 text-blue-600" />
          基础分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">熵值质量</h4>
            <div className="text-2xl font-bold text-blue-700">
              {getEntropyQuality(hashStats.entropy)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {hashStats.entropy.toFixed(2)} 比特/字符
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">分布均匀度</h4>
            <div className="text-2xl font-bold text-green-700">
              {getDistributionQuality(hashStats.distribution)}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {hashStats.distribution.length} 种不同字符
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">二进制比例</h4>
            <div className="text-2xl font-bold text-purple-700">
              {((hashAnalysis?.ones || 0) / (currentHash.length * 4) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              1比特占比
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">连续性分析</h4>
            <div className="text-2xl font-bold text-orange-700">
              {Math.max(...currentHash.match(/(.)\1*/g)?.map(s => s.length) || [0])}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              最长连续字符
            </p>
          </div>
        </div>
      </section>

      {/* 分布分析 */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium flex items-center mb-4">
          <ChartPieIcon className="h-6 w-6 mr-2 text-blue-600" />
          分布分析
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 字符分布 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">字符分布</h4>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
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

          {/* 二进制分析 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">二进制分析</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">0比特数量</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {hashAnalysis?.zeros || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((hashAnalysis?.zeros || 0) / (currentHash.length * 4) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">1比特数量</div>
                  <div className="text-2xl font-bold text-blue-700">
                    {hashAnalysis?.ones || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {((hashAnalysis?.ones || 0) / (currentHash.length * 4) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600"
                    style={{
                      width: `${((hashAnalysis?.ones || 0) / (currentHash.length * 4)) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 序列分析 */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium flex items-center mb-4">
          <ArrowsPointingOutIcon className="h-6 w-6 mr-2 text-blue-600" />
          序列分析
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 连续性分析 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">连续性分析</h4>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">最长连续相同字符</div>
                <div className="text-2xl font-bold text-blue-700">
                  {Math.max(...currentHash.match(/(.)\1*/g)?.map(s => s.length) || [0])}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">不同字符对数量</div>
                <div className="text-2xl font-bold text-blue-700">
                  {new Set(currentHash.match(/.{2}/g)).size}
                </div>
              </div>
            </div>
          </div>

          {/* 模式分析 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">模式分析</h4>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">重复模式数</div>
                <div className="text-2xl font-bold text-blue-700">
                  {new Set(currentHash.match(/.{2}/g)).size}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">独特字符数</div>
                <div className="text-2xl font-bold text-blue-700">
                  {new Set(currentHash.split('')).size}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 对比分析（如果有对比哈希值） */}
      {comparisonHash && hashComparison && comparisonAnalysis && (
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium flex items-center mb-4">
            <DocumentChartBarIcon className="h-6 w-6 mr-2 text-blue-600" />
            对比分析
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">差异位数</h4>
                <div className="text-2xl font-bold text-blue-700">
                  {hashComparison.diffBits}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {hashComparison.diffPercentage.toFixed(1)}% 的位发生变化
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">雪崩效应</h4>
                <div className="text-2xl font-bold text-green-700">
                  {hashComparison.avalancheEffect > 45 ? '优秀' : '一般'}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {hashComparison.avalancheEffect.toFixed(1)}% 变化率
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">分布变化</h4>
                <div className="text-2xl font-bold text-purple-700">
                  {comparisonAnalysis.diffSegments}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  差异段数
                </p>
              </div>
            </div>

            {/* 差异热图 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">差异分布热图</h4>
              <DiffHeatmap
                diffPositions={hashComparison.diffPositions}
                totalLength={currentHash.length}
              />
            </div>

            {/* 分析总结 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">分析总结</h4>
              <p className="text-sm text-gray-700">
                {comparisonAnalysis.summary}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default AnalysisPanel; 