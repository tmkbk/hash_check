import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HashVisualization from './components/HashVisualization/index';
import TamperDemo from './components/TamperDemo';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<HashVisualization />} />
            <Route path="/tamper-detection" element={<TamperDemo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
