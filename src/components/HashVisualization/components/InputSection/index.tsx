import { ArrowPathIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { buttonBaseStyle, selectBaseStyle } from '../../../../constants/styles';
import { DemoExample, AnimationState } from '../../../../types/hash';

interface InputSectionProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onAnimationToggle: () => void;
  onAnimationSpeedChange: (speed: AnimationState['speed']) => void;
  onResetDemo: () => void;
  animationState: AnimationState;
  currentDemo: DemoExample | null;
}

const InputSection: React.FC<InputSectionProps> = ({
  inputText,
  onInputChange,
  onAnimationToggle,
  onAnimationSpeedChange,
  onResetDemo,
  animationState,
  currentDemo
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">输入文本</h3>
          <div className="flex items-center space-x-2">
            {currentDemo?.animation && (
              <>
                <button
                  onClick={onAnimationToggle}
                  className={`${buttonBaseStyle} p-1.5 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50`}
                  title={animationState.isPlaying ? '暂停动画' : '播放动画'}
                >
                  {animationState.isPlaying ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                </button>
                <select
                  value={animationState.speed}
                  onChange={(e) => onAnimationSpeedChange(e.target.value as AnimationState['speed'])}
                  className={selectBaseStyle}
                >
                  <option value="slow">慢速</option>
                  <option value="normal">正常</option>
                  <option value="fast">快速</option>
                </select>
              </>
            )}
            <button
              onClick={onResetDemo}
              className={`${buttonBaseStyle} p-1.5 text-gray-600 hover:text-blue-600 rounded-md hover:bg-blue-50`}
              title="重置输入"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full h-24 p-3 border border-gray-200 rounded-md focus:border-blue-400 focus:ring-0 resize-none"
          placeholder="在此输入要计算哈希值的文本..."
        />
        {currentDemo && (
          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="font-medium text-sm mb-1">{currentDemo.title}</h4>
            <p className="text-sm text-gray-600">{currentDemo.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputSection; 