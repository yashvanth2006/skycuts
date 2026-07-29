import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProjectPage from './pages/admin/AdminProjectPage.jsx';
import ClientDashboard from './pages/client/ClientDashboard.jsx';
import ClientProjectPage from './pages/client/ClientProjectPage.jsx';
import EditorProfile from './pages/public/EditorProfile.jsx';

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
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

const ClientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'client') return <Navigate to="/admin" replace />;
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
  return user.role === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Public Route */}
      <Route path="/profile" element={<EditorProfile />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/project/:id" element={<AdminRoute><AdminProjectPage /></AdminRoute>} />

      {/* Client Routes */}
      <Route path="/dashboard" element={<ClientRoute><ClientDashboard /></ClientRoute>} />
      <Route path="/dashboard/project/:id" element={<ClientRoute><ClientProjectPage /></ClientRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
