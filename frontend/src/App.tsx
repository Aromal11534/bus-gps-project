import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-gray-900">
        <nav className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <Link to="/" className="text-lg font-semibold tracking-tight text-blue-600">
              Smart Bus Tracking
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Dashboard
              </Link>
              <Link
                to="/admin"
                className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
