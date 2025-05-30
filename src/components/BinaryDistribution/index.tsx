/**
 * 这是二进制分布组件，用于显示二进制分布的分析结果
 * 包括0/1比例、零位数量、一位数量
 */

import DistributionBar from '@/components/DistributionBar';

interface BinaryDistributionProps {
  zeros: number;
  ones: number;
  showPercentage?: boolean;
}

const BinaryDistribution: React.FC<BinaryDistributionProps> = ({
  zeros,
  ones,
  showPercentage = true
}) => {
  const total = zeros + ones;
  const zeroPercentage = (zeros / total) * 100;
  const onePercentage = (ones / total) * 100;

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">0/1 比例</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">
              {zeroPercentage.toFixed(1)}% / {onePercentage.toFixed(1)}%
            </span>
          )}
        </div>
        <DistributionBar value={zeros} total={total} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-mono">{zeros}</div>
          <div className="text-sm text-gray-600">零位数量</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-mono">{ones}</div>
          <div className="text-sm text-gray-600">一位数量</div>
        </div>
      </div>
    </div>
  );
};

export default BinaryDistribution; 