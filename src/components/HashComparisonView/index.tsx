import React from 'react';
import { HashComparison, ComparisonAnalysisResult } from '@/types/hash';
import DiffHeatmap from '@/components/DiffHeatmap';
import CharDistribution from '@/components/CharDistribution';

interface HashComparisonViewProps {
  currentHash: string;
  comparisonHash: string;
  hashComparison: HashComparison;
  comparisonAnalysis: ComparisonAnalysisResult;
  showBinaryView: boolean;
}

export const HashComparisonView: React.FC<HashComparisonViewProps> = ({
  currentHash,
  comparisonHash,
  hashComparison,
  comparisonAnalysis,
}) => {
  return (
    <div className="space-y-6">
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

      {/* 雪崩效应分析 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-3">雪崩效应分析</h4>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">哈希值变化率</span>
              <span className="text-sm font-mono">
                {hashComparison.avalancheEffect.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${hashComparison.avalancheEffect > 45 ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                style={{ width: `${hashComparison.avalancheEffect}%` }}
              />
            </div>
            {hashComparison.avalancheEffect > 45 && (
              <p className="text-xs text-green-600 mt-1">
                达到理想的雪崩效应（&gt;45%）
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">变化位置分布</div>
              <div className="text-lg font-mono mt-1">
                前32位: {comparisonAnalysis.frontHalfDiffs.length}
                <br />
                后32位: {comparisonAnalysis.backHalfDiffs.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-gray-600">最长连续变化</div>
              <div className="text-lg font-mono mt-1">
                {comparisonAnalysis.maxConsecutiveDiff} 位
              </div>
            </div>
          </div>
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
  );
};

export default HashComparisonView; 