import { TableCellsIcon, ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { copySuccessStyle } from '@/constants/styles';
import { HashBit } from '@/types/hash';
import { useEffect, useState } from 'react';

interface HashDisplayProps {
  title: string;
  currentHash: string;
  showBinaryView: boolean;
  hashBits: HashBit[];
  highlightedBits: number[];
  diffPositions?: number[];
  onBitHighlight: (index: number) => void;
  onCopy: () => void;
  copySuccess: boolean;
  animateChange?: boolean;
  previousHash?: string;
}

const HashDisplay: React.FC<HashDisplayProps> = ({
  title,
  currentHash,
  showBinaryView,
  diffPositions = [],
  onBitHighlight,
  onCopy,
  copySuccess,
  previousHash
}) => {
  const [changedBits, setChangedBits] = useState<number[]>([]);

  useEffect(() => {
    if (previousHash && currentHash !== previousHash) {
      const newChangedBits: number[] = [];
      const current = showBinaryView ? hexToBinary(currentHash) : currentHash;
      const previous = showBinaryView ? hexToBinary(previousHash) : previousHash;

      current.split('').forEach((bit, index) => {
        if (bit !== previous[index]) {
          newChangedBits.push(index);
        }
      });

      setChangedBits(newChangedBits);

      // 清除高亮效果的定时器
      const timer = setTimeout(() => {
        setChangedBits([]);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [currentHash, previousHash, showBinaryView]);

  const hexToBinary = (hex: string): string => {
    return hex.split('').map(char =>
      parseInt(char, 16).toString(2).padStart(4, '0')
    ).join('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <TableCellsIcon className="h-5 w-5 mr-2" />
          <h3 className="font-medium">{title}</h3>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            长度: {showBinaryView ? currentHash.length * 4 : currentHash.length} {showBinaryView ? '位' : '字符'}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="font-mono text-sm flex flex-wrap pr-10 py-2">
          {(showBinaryView ? hexToBinary(currentHash) : currentHash).split('').map((bit, index) => {
            const hexIndex = showBinaryView ? Math.floor(index / 4) : index;
            const isDifferent = diffPositions.includes(hexIndex);
            const isChanged = changedBits.includes(index);

            // 确定显示样式
            let displayStyle = '';
            let tooltipText = `位置: ${index + 1}`;

            // 在对比模式下（有diffPositions），使用对比样式
            if (diffPositions.length > 0) {
              if (isDifferent) {
                displayStyle = 'bg-red-50 text-red-600 font-medium border border-red-200';
                tooltipText += ' (差异)';
              } else {
                displayStyle = 'bg-green-50 text-green-600 font-medium border border-green-200';
                tooltipText += ' (相同)';
              }
            }
            // 在非对比模式下，显示前后变化对比
            else if (previousHash) {
              if (isChanged) {
                displayStyle = 'bg-red-50 text-red-600 font-medium border border-red-200';
                tooltipText += ' (已更改)';
              } else {
                displayStyle = 'bg-green-50 text-green-600 font-medium border border-green-200';
                tooltipText += ' (未更改)';
              }
            }
            // 初始状态或重置状态，全部显示为绿色
            else {
              displayStyle = 'bg-green-50 text-green-600 font-medium border border-green-200';
              tooltipText += ' (初始值)';
            }

            return (
              <span
                key={index}
                onClick={() => onBitHighlight(index)}
                className={`cursor-pointer transition-all duration-300 p-1.5 rounded-md m-0.5
                  ${displayStyle}
                  ${showBinaryView ? 'mx-1' : 'mx-0.5'}
                  hover:bg-opacity-75`}
                title={tooltipText}
              >
                {bit}
              </span>
            );
          })}
        </div>
        <button
          onClick={onCopy}
          className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors group"
          style={{ top: 0 }}
          title={`复制${title}`}
        >
          <ClipboardIcon className="h-4 w-4 group-hover:scale-110 transition-transform" />
          {copySuccess && (
            <span className={copySuccessStyle}>
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              已复制
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default HashDisplay; 