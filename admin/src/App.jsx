import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProjectPage from './pages/admin/AdminProjectPage.jsx';
import AdminPortfolioPage from './pages/admin/AdminPortfolioPage.jsx';

// ─── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/login" replace />;
  return children;
};

const FullPageLoader = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg-void)'
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: '50%',
      border: '3px solid var(--border-subtle)',
      borderTopColor: 'var(--accent-blue)',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Auth redirect helper ──────────────────────────────────────────────────────
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Routes */}
      <Route path="/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/project/:id" element={<AdminRoute><AdminProjectPage /></AdminRoute>} />
      <Route path="/portfolio" element={<AdminRoute><AdminPortfolioPage /></AdminRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
