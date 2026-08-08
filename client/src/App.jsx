import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext.jsx';

// Lazy load components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));
const AdminProjectPage = lazy(() => import('./pages/admin/AdminProjectPage.jsx'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard.jsx'));
const ClientProjectPage = lazy(() => import('./pages/client/ClientProjectPage.jsx'));
const EditorProfile = lazy(() => import('./pages/public/EditorProfile.jsx'));

// ─── Route Guards ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  return user ? children : <Navigate to="/login" replace />;
};

const ClientRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'client') return <Navigate to="/profile" replace />;
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
    ? <Navigate to="/profile" replace />
    : <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Public Route (now includes editor dashboard when logged in) */}
        <Route path="/profile" element={<EditorProfile />} />

        {/* Editor Project Detail Route */}
        <Route path="/profile/project/:id" element={<ProtectedRoute><AdminProjectPage /></ProtectedRoute>} />

        {/* Client Routes */}
        <Route path="/dashboard" element={<ClientRoute><ClientDashboard /></ClientRoute>} />
        <Route path="/dashboard/project/:id" element={<ClientRoute><ClientProjectPage /></ClientRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
