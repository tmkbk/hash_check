import { buttonBaseStyle, selectBaseStyle } from '../../../../constants/styles';
import { INTERACTIVE_DEMOS } from '../../../../constants/hashDemo';
import { TabType } from '../../../../types/hash';

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
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={selectedDemoIndex === null ? '' : selectedDemoIndex}
            onChange={(e) => onDemoSelect(Number(e.target.value))}
            className={selectBaseStyle}
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
            className={`${buttonBaseStyle} px-3 py-1.5 rounded-md transition-colors ${showBinaryView
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            二进制视图
          </button>
        </div>
        <div className="flex rounded-md overflow-hidden border border-gray-200">
          <button
            onClick={() => onTabChange('visualization')}
            className={`${buttonBaseStyle} px-4 py-1.5 transition-colors ${selectedTab === 'visualization'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            可视化
          </button>
          <button
            onClick={() => onTabChange('analysis')}
            className={`${buttonBaseStyle} px-4 py-1.5 border-x border-gray-200 transition-colors ${selectedTab === 'analysis'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            分析
          </button>
          <button
            onClick={() => onTabChange('tutorial')}
            className={`${buttonBaseStyle} px-4 py-1.5 transition-colors ${selectedTab === 'tutorial'
              ? 'bg-blue-50 text-blue-700'
              : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            教程
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel; 