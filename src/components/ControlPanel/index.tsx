import { buttonBaseStyle, selectBaseStyle } from '@/constants/styles';
import { INTERACTIVE_DEMOS } from '@/constants/hashDemo';
import { TabType } from '@/types/hash';

interface ControlPanelProps {
  showBinaryView: boolean;
  onBinaryViewToggle: () => void;
  selectedTab: TabType;
  onTabChange: (tab: TabType) => void;
  onDemoSelect: (demoIndex: number) => void;
  selectedDemoIndex: number | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  showBinaryView,
  onBinaryViewToggle,
  selectedTab,
  onTabChange,
  onDemoSelect,
  selectedDemoIndex
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center space-x-4">
          <select
            value={selectedDemoIndex === null ? '' : selectedDemoIndex}
            onChange={(e) => onDemoSelect(Number(e.target.value))}
            className={`${selectBaseStyle} w-52`}
          >
            <option value="">选择演示示例</option>
            {INTERACTIVE_DEMOS.map((demo, index) => (
              <option key={index} value={index}>
                {demo.title}
              </option>
            ))}
          </select>
          <button
            onClick={onBinaryViewToggle}
            className={`${buttonBaseStyle} min-w-[120px] px-5 py-2 rounded-md transition-colors ${showBinaryView
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            二进制视图
          </button>
        </div>
        <div className="flex items-center bg-gray-50/50 rounded-2xl p-2 backdrop-blur-sm">
          <button
            onClick={() => onTabChange('visualization')}
            className={`relative group px-7 mr-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${selectedTab === 'visualization'
              ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/20'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <span className="relative z-10">可视化</span>
            {selectedTab === 'visualization' && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-sm" />
            )}
          </button>
          <button
            onClick={() => onTabChange('analysis')}
            className={`relative group px-7 mr-2 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${selectedTab === 'analysis'
              ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/20'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <span className="relative z-10">分析</span>
            {selectedTab === 'analysis' && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-sm" />
            )}
          </button>
          <button
            onClick={() => onTabChange('tutorial')}
            className={`relative group px-7 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${selectedTab === 'tutorial'
              ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/20'
              : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
          >
            <span className="relative z-10">教程</span>
            {selectedTab === 'tutorial' && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 opacity-20 blur-sm" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 