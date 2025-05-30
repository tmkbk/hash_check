import { useState } from 'react';
import { ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { HashStats } from '@/types/hash';
import VisualPattern from '@/components/VisualPattern';
import CharDistribution from '@/components/CharDistribution';
import BinaryDistribution from '@/components/BinaryDistribution';

interface HashVisualizationViewProps {
  currentHash: string;
  comparisonHash?: string;
  hashStats: HashStats;
  showBinaryView: boolean;
  showComparisonMode: boolean;
  onComparisonModeChange?: (enabled: boolean) => void;
}

const HashVisualizationView: React.FC<HashVisualizationViewProps> = ({
  currentHash,
  comparisonHash,
  hashStats,
  showBinaryView,
  showComparisonMode,
}) => {
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [isCompact] = useState(true);

  // 计算对比哈希的统计信息
  const calculateComparisonStats = () => {
    if (!comparisonHash) return null;

    const charCount = comparisonHash.split('').reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribution = Object.entries(charCount).sort((a, b) => b[1] - a[1]);
    const entropy = distribution.reduce((acc, [_, count]) => {
      const p = count / comparisonHash.length;
      return acc - (p * Math.log2(p));
    }, 0);

    return {
      distribution,
      entropy,
      uniformity: (entropy / Math.log2(16)) * 100
    };
  };

  const comparisonStats = comparisonHash ? calculateComparisonStats() : null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="font-medium flex items-center">
          <ChartBarIcon className="h-5 w-5 mr-2" />
          哈希值可视化
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAdvancedStats(!showAdvancedStats)}
            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${showAdvancedStats
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <ChartPieIcon className="h-4 w-4 mr-1" />
            {showAdvancedStats ? '隐藏详情' : '显示详情'}
          </button>
        </div>
      </div>

      <div className={`space-y-4 ${isCompact ? 'sm:space-y-2' : 'sm:space-y-6'}`}>
        {/* 视觉模式 */}
        <div className={`grid gap-4 ${isCompact ? 'grid-cols-1 sm:grid-cols-2' :
          showComparisonMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
          }`}>
          <div className="flex flex-col items-center">
            <div className="text-sm text-gray-600 mb-2">主哈希视图</div>
            <VisualPattern
              hash={currentHash}
              size={8}
              showStats={!isCompact}
              className="w-full max-w-sm"
              isComparison={showComparisonMode}
              comparisonHash={comparisonHash}
              showComparisonMode={showComparisonMode}
              showAdvancedStats={showAdvancedStats && !isCompact}
            />
          </div>
          {showComparisonMode && comparisonHash && (
            <div className="flex flex-col items-center">
              <div className="text-sm text-gray-600 mb-2">对比哈希视图</div>
              <VisualPattern
                hash={comparisonHash}
                size={8}
                showStats={!isCompact}
                className="w-full max-w-sm"
                isComparison={true}
                comparisonHash={currentHash}
                showComparisonMode={showComparisonMode}
                showAdvancedStats={showAdvancedStats && !isCompact}
              />
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {!isCompact && (
          <>
            {/* 基本统计 */}
            <div className={`grid gap-4 ${showComparisonMode ? 'grid-cols-1 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'
              }`}>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">熵值</div>
                <div className="text-lg font-medium">
                  {hashStats.entropy.toFixed(3)}
                  {showComparisonMode && comparisonStats && (
                    <span className="text-sm ml-2 text-gray-500">
                      vs {comparisonStats.entropy.toFixed(3)}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">字符种类</div>
                <div className="text-lg font-medium">
                  {hashStats.distribution.length}
                  {showComparisonMode && comparisonStats && (
                    <span className="text-sm ml-2 text-gray-500">
                      vs {comparisonStats.distribution.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">分布均匀度</div>
                <div className="text-lg font-medium">
                  {((hashStats.entropy / Math.log2(16)) * 100).toFixed(1)}%
                  {showComparisonMode && comparisonStats && (
                    <span className="text-sm ml-2 text-gray-500">
                      vs {comparisonStats.uniformity.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              {showComparisonMode && comparisonStats && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">分布相似度</div>
                  <div className="text-lg font-medium">
                    {(
                      (1 -
                        Math.abs(
                          hashStats.entropy - comparisonStats.entropy
                        ) /
                        Math.max(hashStats.entropy, comparisonStats.entropy)) *
                      100
                    ).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>

            {/* 字符分布 */}
            <div className="space-y-2">
              <div className="text-sm text-gray-600">字符分布</div>
              <div className={`grid gap-2 ${isCompact ? 'grid-cols-1' :
                showComparisonMode ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
                }`}>
                {(showComparisonMode && comparisonStats
                  ? Array.from(
                    new Set([
                      ...hashStats.distribution.map(([char]) => char),
                      ...comparisonStats.distribution.map(([char]) => char)
                    ])
                  ).sort()
                  : hashStats.distribution.map(([char]) => char)
                ).map((char) => {
                  const mainCount =
                    hashStats.distribution.find(([c]) => c === char)?.[1] || 0;
                  const compCount = showComparisonMode
                    ? comparisonStats?.distribution.find(([c]) => c === char)?.[1] || 0
                    : undefined;
                  return (
                    <CharDistribution
                      key={char}
                      char={char}
                      mainCount={mainCount}
                      total={currentHash.length}
                      compCount={compCount}
                      compTotal={comparisonHash?.length}
                      showDifference={showComparisonMode}
                    />
                  );
                })}
              </div>
            </div>

            {/* 二进制分布 */}
            {showBinaryView && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">二进制分布</div>
                <BinaryDistribution
                  zeros={hashStats.zeros}
                  ones={hashStats.ones}
                />
              </div>
            )}

            {/* 二进制视图 */}
            {showBinaryView && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">二进制视图</div>
                <div className="font-mono text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto whitespace-pre">
                  {currentHash.split('').map((char, i) => {
                    const binary = parseInt(char, 16).toString(2).padStart(4, '0');
                    return (
                      <span key={i} className="inline-block px-0.5">
                        {binary}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HashVisualizationView; 