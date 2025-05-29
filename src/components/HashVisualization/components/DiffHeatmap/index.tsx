interface DiffHeatmapProps {
  diffPositions: number[];
  totalLength: number;
}

const DiffHeatmap: React.FC<DiffHeatmapProps> = ({ diffPositions, totalLength }) => (
  <div className="h-8 bg-gray-200 rounded-full overflow-hidden relative">
    {diffPositions.map((pos, index) => (
      <div
        key={index}
        className="absolute h-full bg-red-500 opacity-50"
        style={{
          left: `${(pos / totalLength) * 100}%`,
          width: '1%'
        }}
        title={`位置: ${pos + 1}`}
      />
    ))}
  </div>
);

export default DiffHeatmap; 