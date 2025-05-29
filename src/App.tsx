import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HomeIcon, ShieldCheckIcon, AcademicCapIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Home from './pages/Home';
import HashCalculator from './pages/HashCalculator';
import Demo from './pages/Demo';

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

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">哈希检测平台</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLink to="/">
                    <HomeIcon className="h-5 w-5 mr-1" />
                    首页
                  </NavLink>
                  <NavLink to="/hash">
                    <ShieldCheckIcon className="h-5 w-5 mr-1" />
                    哈希计算
                  </NavLink>
                  <NavLink to="/demo">
                    <AcademicCapIcon className="h-5 w-5 mr-1" />
                    演示教学
                  </NavLink>
                </div>
              </div>
              <div className="flex items-center sm:hidden">
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="sr-only">打开主菜单</span>
                  {mobileMenuOpen ? (
                    <XMarkIcon className="block h-6 w-6" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 移动端菜单 */}
          <div className={`sm:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <HomeIcon className="inline-block h-5 w-5 mr-1" />
                首页
              </Link>
              <Link
                to="/hash"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldCheckIcon className="inline-block h-5 w-5 mr-1" />
                哈希计算
              </Link>
              <Link
                to="/demo"
                className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                <AcademicCapIcon className="inline-block h-5 w-5 mr-1" />
                演示教学
              </Link>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/hash" element={<HashCalculator />} />
            <Route path="/demo" element={<Demo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
