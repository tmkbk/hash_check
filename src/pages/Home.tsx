import { FC } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const Home: FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          哈希函数与篡改检测演示平台
        </h1>
        <p className="text-xl text-gray-600">
          探索哈希函数的原理，体验数据完整性验证的过程
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Link
          to="/hash"
          className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="text-2xl font-semibold ml-3">哈希计算</h2>
          </div>
          <p className="text-gray-600">
            支持多种哈希算法，可以对文本或文件进行哈希计算，
            帮助你理解和验证数据的完整性。
          </p>
        </Link>

        <Link
          to="/demo"
          className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="text-2xl font-semibold ml-3">演示教学</h2>
          </div>
          <p className="text-gray-600">
            通过交互式演示，直观地了解哈希函数的特性，
            以及它在数据安全中的重要作用。
          </p>
        </Link>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">为什么使用哈希函数？</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">数据完整性</h3>
            <p className="text-gray-600">
              哈希函数可以生成数据的唯一标识符，
              任何细微的改变都会导致完全不同的哈希值，
              这使得它成为检测数据是否被篡改的有效工具。
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">安全性</h3>
            <p className="text-gray-600">
              哈希函数是单向的，这意味着无法从哈希值反推原始数据，
              这种特性使其在密码存储等安全场景中发挥重要作用。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 