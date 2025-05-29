import { CubeTransparentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { hexToBinary } from '../../../../utils/hashAnalysis';

interface VisualPatternProps {
  title: string;
  hash: string;
  showEmpty?: boolean;
}

const VisualPattern: React.FC<VisualPatternProps> = ({ title, hash, showEmpty = true }) => {
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-medium mb-4 flex items-center">
        <CubeTransparentIcon className="h-5 w-5 mr-2 text-blue-600" />
        {title}
      </h3>
      <div className="flex flex-col items-center">
        {!hash && showEmpty ? (
          <div className="text-center p-6 bg-gray-50 rounded-lg w-full">
            <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">请输入文本以查看视觉模式</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-8 gap-px bg-gray-200 w-full max-w-[256px]">
              {generateVisualPattern(hash).map((row, i) =>
                row.map((cell, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`aspect-square ${cell === '1' ? 'bg-blue-600' : 'bg-white'
                      } transition-colors duration-300 hover:opacity-75`}
                  />
                ))
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm font-medium text-gray-600">1位数量</div>
                <div className="text-lg font-mono mt-1">
                  {calculateBitCounts(hash).ones}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-sm font-medium text-gray-600">0位数量</div>
                <div className="text-lg font-mono mt-1">
                  {calculateBitCounts(hash).zeros}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisualPattern;