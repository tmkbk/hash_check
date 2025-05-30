import { CubeTransparentIcon, ExclamationTriangleIcon, ChartBarIcon, ChartPieIcon } from '@heroicons/react/24/outline';
import { hexToBinary } from '@/utils/hashAnalysis';

interface VisualPatternProps {
  title?: string;
  hash: string;
  showEmpty?: boolean;
  size?: number;
  className?: string;
  showStats?: boolean;
  isComparison?: boolean;
  comparisonHash?: string;
  showComparisonMode?: boolean;
  showAdvancedStats?: boolean;
}

const VisualPattern: React.FC<VisualPatternProps> = ({
  title,
  hash,
  showEmpty = true,
  size = 8,
  className = '',
  showStats = true,
  comparisonHash,
  showComparisonMode = false,
  showAdvancedStats = false
}) => {
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

  const calculateBitCounts = (hash: string) => {
    return hash.split('').reduce((acc, char) => {
      const bin = parseInt(char, 16).toString(2).padStart(4, '0');
      const ones = bin.split('1').length - 1;
      const zeros = bin.split('0').length - 1;
      return {
        ones: acc.ones + ones,
        zeros: acc.zeros + zeros
      };
    }, { ones: 0, zeros: 0 });
  };

  const calculateHashStats = (hash: string) => {
    const charCount = hash.split('').reduce((acc, char) => {
      acc[char] = (acc[char] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const distribution = Object.entries(charCount).sort((a, b) => b[1] - a[1]);
    const entropy = distribution.reduce((acc, [_, count]) => {
      const p = count / hash.length;
      return acc - (p * Math.log2(p));
    }, 0);

    return {
      distribution,
      entropy,
      uniformity: (entropy / Math.log2(16)) * 100
    };
  };

  const calculateSequenceStats = (hash: string) => {
    const maxConsecutive = hash.match(/(.)\1*/g)?.reduce((max, curr) =>
      curr.length > max ? curr.length : max, 0) || 0;

    const differentPairs = hash.split('').reduce((count, _, i) =>
      i > 0 && hash[i] !== hash[i - 1] ? count + 1 : count, 0);

    return {
      maxConsecutive,
      differentPairs
    };
  };

  const pattern = generateVisualPattern(hash);
  const comparisonPattern = comparisonHash ? generateVisualPattern(comparisonHash) : null;
  const bitCounts = calculateBitCounts(hash);
  const hashStats = calculateHashStats(hash);
  const sequenceStats = calculateSequenceStats(hash);

  const getCellStyle = (value: string, i: number, j: number) => {
    const baseStyle = {
      transform: value === '1' ? 'scale(1.05)' : 'scale(1)',
      zIndex: value === '1' ? 1 : 0,
      transition: 'all 0.3s ease-in-out'
    };

    if (!showComparisonMode || !comparisonHash) {
      const gradient = value === '1'
        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)';

      return {
        ...baseStyle,
        background: gradient,
        boxShadow: value === '1'
          ? '0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -2px rgba(59, 130, 246, 0.1)'
          : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      };
    }

    const comparisonValue = comparisonPattern?.[i][j];
    const isSame = value === comparisonValue;

    // 相同位使用绿色，不同位使用红色
    let gradient;
    let shadowColor;

    if (isSame) {
      gradient = value === '1'
        ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
        : 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)';
      shadowColor = 'rgba(34, 197, 94, 0.2)';
    } else {
      gradient = value === '1'
        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)';
      shadowColor = 'rgba(239, 68, 68, 0.2)';
    }

    return {
      ...baseStyle,
      background: gradient,
      boxShadow: value === '1'
        ? `0 4px 6px -1px ${shadowColor}, 0 2px 4px -2px ${shadowColor}`
        : `0 1px 2px 0 ${shadowColor}`
    };
  };

  return (
    <div className={`${className} ${title ? 'bg-white rounded-lg shadow-sm p-4' : ''}`}>
      {title && (
        <h3 className="text-sm font-medium mb-4 flex items-center">
          <CubeTransparentIcon className="h-5 w-5 mr-2 text-blue-600" />
          {title}
        </h3>
      )}
      <div className="flex flex-col items-center">
        {!hash && showEmpty ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg w-full">
            <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">请输入文本以查看视觉模式</p>
          </div>
        ) : (
          <>
            <div
              className="grid gap-1 bg-gray-100 p-2 rounded-xl"
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                width: title ? '100%' : '200px',
                maxWidth: '256px'
              }}
            >
              {pattern.map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className="aspect-square rounded-md"
                    style={getCellStyle(cell, i, j)}
                  />
                ))
              )}
            </div>
            {showStats && (
              <div className="w-full space-y-4 mt-4">
                {/* 基本统计 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-sm font-medium text-gray-600">1位数量</div>
                    <div className="text-lg font-mono mt-1">{bitCounts.ones}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <div className="text-sm font-medium text-gray-600">0位数量</div>
                    <div className="text-lg font-mono mt-1">{bitCounts.zeros}</div>
                  </div>
                </div>

                {/* 高级统计 */}
                {showAdvancedStats && (
                  <>
                    {/* 熵值和均匀度 */}
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <ChartPieIcon className="h-5 w-5 mr-2" />
                        分布分析
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">熵值</div>
                          <div className="text-lg font-medium mt-1">
                            {hashStats.entropy.toFixed(3)}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">均匀度</div>
                          <div className="text-lg font-medium mt-1">
                            {hashStats.uniformity.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 序列分析 */}
                    <div className="bg-white rounded-lg shadow-sm p-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <ChartBarIcon className="h-5 w-5 mr-2" />
                        序列分析
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">最长连续</div>
                          <div className="text-lg font-medium mt-1">
                            {sequenceStats.maxConsecutive}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-sm text-gray-600">不同字符对</div>
                          <div className="text-lg font-medium mt-1">
                            {sequenceStats.differentPairs}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 字符分布 */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">字符分布</div>
                      {hashStats.distribution.map(([char, count], index) => (
                        <div key={index} className="bg-gray-50 p-2 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono">{char}</span>
                            <span className="text-sm text-gray-600">{count}次</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600"
                              style={{ width: `${(count / hash.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VisualPattern;