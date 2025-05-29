import { LightBulbIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const TutorialPanel: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center">
          <LightBulbIcon className="h-6 w-6 mr-2 text-blue-600" />
          <h3 className="font-medium">哈希函数特性解释</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
            <h4 className="text-sm font-medium text-blue-800 mb-2">1. 雪崩效应</h4>
            <p className="text-sm text-gray-600">
              输入的微小改变会导致输出的显著变化。通过修改一个字符，可以观察到大约50%的输出位发生变化。
            </p>
            <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
              提示：尝试修改一个字符，观察变化的位数
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
            <h4 className="text-sm font-medium text-blue-800 mb-2">2. 确定性</h4>
            <p className="text-sm text-gray-600">
              相同的输入总是产生相同的哈希值，这保证了哈希函数的可靠性和一致性。
            </p>
            <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
              提示：重复输入相同文本，观察哈希值是否相同
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
            <h4 className="text-sm font-medium text-blue-800 mb-2">3. 不可逆性</h4>
            <p className="text-sm text-gray-600">
              从哈希值无法反推出原始输入，这是密码学哈希函数的核心安全特性。
            </p>
            <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
              提示：切换到二进制视图，观察数据的复杂性
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all">
            <h4 className="text-sm font-medium text-blue-800 mb-2">4. 固定长度输出</h4>
            <p className="text-sm text-gray-600">
              无论输入长度如何，SHA-256 始终产生 256 位（64个十六进制字符）的输出。
            </p>
            <div className="mt-3 text-xs bg-blue-50 p-2 rounded">
              提示：尝试输入超长文本，观察输出长度
            </div>
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            使用建议
          </h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>从简单的示例开始，逐步尝试更复杂的输入</li>
            <li>使用动画功能观察哈希值的变化过程</li>
            <li>切换不同的视图模式来深入理解数据结构</li>
            <li>关注统计数据，了解哈希值的分布特性</li>
            <li>尝试预测哈希值的变化，验证你的理解</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default TutorialPanel; 