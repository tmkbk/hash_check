import { TableCellsIcon, ClipboardIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { copySuccessStyle } from '../../../../constants/styles';
import { HashBit } from '../../../../types/hash';

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
}

const HashDisplay: React.FC<HashDisplayProps> = ({
  title,
  currentHash,
  showBinaryView,
  hashBits,
  highlightedBits,
  diffPositions = [],
  onBitHighlight,
  onCopy,
  copySuccess,
  animateChange = false,
}) => {
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
      <div className={`relative bg-gray-50 p-4 rounded-lg overflow-x-auto transition-all duration-300 ${animateChange ? 'bg-yellow-50' : ''}`}>
        <div className="font-mono text-sm flex flex-wrap pr-10">
          {(showBinaryView ? hexToBinary(currentHash) : currentHash).split('').map((bit, index) => {
            const hexIndex = showBinaryView ? Math.floor(index / 4) : index;
            const isDifferent = diffPositions.includes(hexIndex);

            return (
              <span
                key={index}
                onClick={() => onBitHighlight(index)}
                className={`cursor-pointer ${hashBits[hexIndex]?.changed
                  ? 'bg-yellow-200 text-red-600'
                  : isDifferent
                    ? 'bg-red-100 text-red-600'
                    : highlightedBits.includes(index)
                      ? 'bg-blue-200'
                      : ''
                  } ${showBinaryView ? 'mx-px' : ''
                  } transition-colors duration-300 p-1 hover:bg-blue-100`}
                title={`位置: ${index + 1}`}
              >
                {bit}
              </span>
            );
          })}
        </div>
        <button
          onClick={onCopy}
          className="absolute right-2 p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors group"
          style={{ top: 15 }}
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