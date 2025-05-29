import { useMemo } from 'react';

interface HashComparisonProps {
  originalHash: string;
  modifiedHash: string;
}

export default function HashComparison({ originalHash, modifiedHash }: HashComparisonProps) {
  const comparison = useMemo(() => {
    const length = Math.max(originalHash.length, modifiedHash.length);
    const result = [];

    for (let i = 0; i < length; i++) {
      const original = originalHash[i] || '';
      const modified = modifiedHash[i] || '';
      const isDifferent = original !== modified;

      result.push({
        original,
        modified,
        isDifferent
      });
    }

    return result;
  }, [originalHash, modifiedHash]);

  const differentCount = comparison.filter(c => c.isDifferent).length;
  const similarity = ((comparison.length - differentCount) / comparison.length) * 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">原始哈希值</h4>
          <div className="font-mono text-sm break-all">
            {comparison.map((c, i) => (
              <span
                key={i}
                className={c.isDifferent ? 'bg-red-100' : ''}
              >
                {c.original}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">修改后哈希值</h4>
          <div className="font-mono text-sm break-all">
            {comparison.map((c, i) => (
              <span
                key={i}
                className={c.isDifferent ? 'bg-red-100' : ''}
              >
                {c.modified}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">哈希值差异分析</span>
          <span className="text-sm text-gray-500">
            相似度: {similarity.toFixed(2)}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${similarity}%` }}
          />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          不同位置数量: {differentCount} / {comparison.length} 位
        </div>
      </div>
    </div>
  );
} 