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
    <div className="space-y-1.5">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex space-x-2">
          {/* 行号 */}
          <div className="w-12 text-xs font-mono text-gray-500 flex items-center">
            {(rowIndex * cellsPerRow).toString(16).padStart(2, '0')}
          </div>
          {/* 热图单元格 */}
          <div className="flex space-x-1 flex-1">
            {row.map((value, colIndex) => (
              <div
                key={colIndex}
                className={`
                  w-7 h-7 rounded-md transition-all duration-200
                  ${value ? 'bg-red-500 shadow-md shadow-red-200' : 'bg-green-400 shadow-sm shadow-green-100'}
                  hover:scale-105 hover:shadow-lg cursor-pointer
                  ${value ? 'hover:shadow-red-200' : 'hover:shadow-green-200'}
                `}
                title={`Position: ${rowIndex * cellsPerRow + colIndex} (${value ? '差异' : '相同'})`}
              />
            ))}
          </div>
        </div>
      ))}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600 p-3 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-400 rounded-md shadow-sm" />
            <span>相同位置</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-md shadow-md" />
            <span>差异位置</span>
          </div>
        </div>
        <div className="font-medium">
          共 {diffPositions.length} 处差异
        </div>
      </div>
    </div>
  );
};

export default DiffHeatmap;