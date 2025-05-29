import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomeIcon, ShieldCheckIcon, AcademicCapIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Home from './pages/Home';
import HashCalculator from './pages/HashCalculator';
import Demo from './pages/Demo';
import TamperDemo from './components/TamperDemo';
import FileIntegrityCheck from './components/FileIntegrityCheck';
import NotificationComponent from './components/Notification';

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
    >
      {children}
    </Link>
  );
}

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'demo' | 'verify'>('demo');

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <NotificationComponent />

        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              哈希函数与篡改检测演示平台
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* 标签切换 */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('demo')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'demo'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                篡改检测演示
              </button>
              <button
                onClick={() => setActiveTab('verify')}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'verify'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                文件完整性验证
              </button>
            </nav>
          </div>

          {/* 内容区域 */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            {activeTab === 'demo' ? <TamperDemo /> : <FileIntegrityCheck />}
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
