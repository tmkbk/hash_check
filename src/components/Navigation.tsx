import { Link, useLocation } from 'react-router-dom';
import {
  BeakerIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

export default function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              哈希函数演示平台
            </h1>
            <div className="hidden md:block ml-10">
              <div className="flex items-center space-x-4">
                <Link
                  to="/"
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${location.pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <BeakerIcon className="h-5 w-5 mr-2" />
                  哈希函数可视化
                </Link>
                <Link
                  to="/tamper-detection"
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium ${location.pathname === '/tamper-detection'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <ShieldCheckIcon className="h-5 w-5 mr-2" />
                  篡改检测演示
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 