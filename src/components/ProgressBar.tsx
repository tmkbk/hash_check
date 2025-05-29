interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
  className?: string;
  height?: string;
}

export default function ProgressBar({
  progress,
  showPercentage = true,
  className = '',
  height = 'h-2'
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height} ${className}`}>
      <div
        className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
        style={{ width: `${percentage}%` }}
      >
        {showPercentage && percentage > 0 && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs text-white font-medium">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    </div>
  );
} 