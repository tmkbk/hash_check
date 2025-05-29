import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { buttonBaseStyle } from '../../../../constants/styles';

interface ComparisonSectionProps {
  comparisonText: string;
  onComparisonChange: (text: string) => void;
  onResetComparison: () => void;
}

const ComparisonSection: React.FC<ComparisonSectionProps> = ({
  comparisonText,
  onComparisonChange,
  onResetComparison
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">对比文本</h3>
          <button
            onClick={onResetComparison}
            className={`${buttonBaseStyle} p-1.5 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50`}
            title="重置对比文本"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
        </div>
        <textarea
          value={comparisonText}
          onChange={(e) => onComparisonChange(e.target.value)}
          className="w-full h-24 p-3 border border-gray-200 rounded-md focus:border-blue-400 focus:ring-0 resize-none"
          placeholder="在此输入要对比的文本..."
        />
      </div>
    </div>
  );
};

export default ComparisonSection; 