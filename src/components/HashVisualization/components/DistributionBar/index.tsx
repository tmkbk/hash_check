interface DistributionBarProps {
  value: number;
  total: number;
  color?: string;
  className?: string;
}

const DistributionBar: React.FC<DistributionBarProps> = ({
  value,
  total,
  color = 'bg-blue-600',
  className = ''
}) => (
  <div className={`h-4 bg-gray-200 rounded-full overflow-hidden ${className}`}>
    <div
      className={`h-full ${color} transition-all duration-300`}
      style={{ width: `${(value / total) * 100}%` }}
    />
  </div>
);

export default DistributionBar; 