import React from 'react';
import { HashComparison, ComparisonAnalysisResult } from '@/types/hash';

interface HashComparisonViewProps {
  currentHash: string;
  comparisonHash: string;
  hashComparison: HashComparison;
  comparisonAnalysis: ComparisonAnalysisResult;
  showBinaryView: boolean;
}

export const HashComparisonView: React.FC<HashComparisonViewProps> = ({
  hashComparison,
  comparisonAnalysis,
}) => {
  return (
    <div className="space-y-6">
      {/* 雪崩效应分析 */}
      <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-4 rounded-lg">
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
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium mb-2">分析总结</h4>
        <p className="text-sm text-gray-700">
          {comparisonAnalysis.summary}
        </p>
      </div>
    </div>
  );
};

export default HashComparisonView; 