import React from 'react';

interface CharDistributionProps {
  char: string;
  mainCount: number;
  compCount?: number;
  total: number;
  compTotal?: number;
  showDifference?: boolean;
}

const CharDistribution: React.FC<CharDistributionProps> = ({
  char,
  mainCount,
  compCount,
  total,
  compTotal,
  showDifference = false
}) => {
  return (
    <div className="flex items-center">
      <span className="font-mono w-8">{char}</span>
      <div className="flex-grow mx-2">
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-blue-600"
            style={{ width: `${(mainCount / total) * 100}%` }}
          />
          {showDifference && compCount !== undefined && compTotal && (
            <div
              className="h-full bg-red-600 opacity-50"
              style={{ width: `${(compCount / compTotal) * 100}%` }}
            />
          )}
        </div>
      </div>
      <span className="text-sm text-gray-600 w-24 text-right">
        {mainCount}{showDifference && compCount !== undefined ? ` vs ${compCount}` : ''}
      </span>
    </div>
  );
};

export default CharDistribution; 