import React, { useState } from 'react';
import {
  AcademicCapIcon,
  LightBulbIcon,
  BeakerIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const TutorialPanel: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorials = [
    {
      title: '哈希值基础',
      icon: AcademicCapIcon,
      content: [
        '哈希值是通过哈希函数将任意长度的数据映射为固定长度的字符串',
        '常见的哈希函数包括 MD5、SHA-1、SHA-256 等',
        '哈希值的主要特点是单向性和确定性',
      ],
      tips: [
        '输入相同的数据总是得到相同的哈希值',
        '即使输入数据只有微小变化，输出的哈希值也会显著不同',
        '从哈希值反推原始数据在理论上是不可能的',
      ],
    },
    {
      title: '分析指标',
      icon: BeakerIcon,
      content: [
        '熵值：衡量哈希值的随机性和信息量',
        '分布均匀度：字符出现频率的均匀程度',
        '雪崩效应：输入变化对输出的影响程度',
      ],
      tips: [
        '熵值越高，表示哈希值的随机性越好',
        '分布越均匀，说明哈希函数的设计越合理',
        '好的哈希函数应具有明显的雪崩效应',
      ],
    },
    {
      title: '可视化解读',
      icon: ChartBarIcon,
      content: [
        '字符分布图：展示各字符的出现频率',
        '二进制分布：分析0和1的比例',
        '差异热图：直观显示两个哈希值的不同之处',
      ],
      tips: [
        '观察分布图可以判断哈希函数的均匀性',
        '二进制视图有助于发现潜在的模式',
        '热图可以快速定位差异的位置和程度',
      ],
    },
    {
      title: '最佳实践',
      icon: LightBulbIcon,
      content: [
        '选择合适的哈希函数：根据安全需求和性能要求',
        '注意输入处理：确保数据编码一致性',
        '定期更新：关注哈希算法的安全性更新',
      ],
      tips: [
        '对安全要求高的场景，推荐使用 SHA-256 或更强的算法',
        '注意处理特殊字符和编码问题',
        '定期检查和更新使用的哈希算法',
      ],
    },
  ];

  const currentTutorial = tutorials[currentStep];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* 进度指示器 */}
      <div className="flex justify-between items-center p-4 border-b">
        {tutorials.map((tutorial, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`flex-1 relative ${index === currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${index === currentStep
                    ? 'bg-blue-100 text-blue-600'
                    : index < currentStep
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100'
                  }`}
              >
                {index + 1}
              </div>
              <span className="text-xs font-medium">{tutorial.title}</span>
            </div>
            {index < tutorials.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 -z-10 ${index < currentStep ? 'bg-green-200' : 'bg-gray-200'
                  }`}
              />
            )}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <currentTutorial.icon className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">
            {currentTutorial.title}
          </h3>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900">核心概念</h4>
            <ul className="space-y-3">
              {currentTutorial.content.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2 text-blue-600" />
              实用提示
            </h4>
            <ul className="space-y-2">
              {currentTutorial.tips.map((tip, index) => (
                <li key={index} className="flex items-start space-x-2 text-gray-700">
                  <span className="text-blue-600">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between items-center p-4 border-t bg-gray-50 rounded-b-lg">
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 hover:bg-gray-100'
            }`}
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>上一步</span>
        </button>
        <button
          onClick={() => setCurrentStep(Math.min(tutorials.length - 1, currentStep + 1))}
          disabled={currentStep === tutorials.length - 1}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${currentStep === tutorials.length - 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
            }`}
        >
          <span>下一步</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default TutorialPanel; 