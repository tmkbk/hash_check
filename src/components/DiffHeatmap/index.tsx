import React from 'react';

interface DiffHeatmapProps {
  diffPositions: number[];
  totalLength: number;
}

const DiffHeatmap: React.FC<DiffHeatmapProps> = ({ diffPositions, totalLength }) => {
  // 创建一个长度为totalLength的数组，用0填充
  const heatmap = new Array(totalLength).fill(0);

  // 标记差异位置
  diffPositions.forEach(pos => {
    if (pos >= 0 && pos < totalLength) {
      heatmap[pos] = 1;
    }
  });

  // 将数组分成多行显示
  const rows = [];
  const cellsPerRow = 16; // 每行显示16个字符
  for (let i = 0; i < heatmap.length; i += cellsPerRow) {
    rows.push(heatmap.slice(i, i + cellsPerRow));
  }

  return (
    <div className="space-y-1">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-1">
          {/* 行号 */}
          <div className="w-12 text-xs text-gray-500 flex items-center">
            {(rowIndex * cellsPerRow).toString(16).padStart(2, '0')}
          </div>
          {/* 热图单元格 */}
          <div className="flex space-x-1 flex-1">
            {row.map((value, colIndex) => (
              <div
                key={colIndex}
                className={`
                  w-6 h-6 rounded-sm transition-colors duration-200
                  ${value ? 'bg-red-500' : 'bg-gray-100'}
                  hover:opacity-75 cursor-pointer
                `}
                title={`Position: ${rowIndex * cellsPerRow + colIndex}`}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded-sm" />
          <span>差异位置</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-100 rounded-sm" />
          <span>相同位置</span>
        </div>
        <div>
          共 {diffPositions.length} 处差异
        </div>
      </div>
    </div>
  );
};

export default DiffHeatmap; 