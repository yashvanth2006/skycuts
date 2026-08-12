import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ClientDashboard from './pages/client/ClientDashboard.jsx';
import ClientProjectPage from './pages/client/ClientProjectPage.jsx';
import EditorProfile from './pages/public/EditorProfile.jsx';

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

const RootRedirect = () => {
  const { currentUser, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  // Admin users belong in the separate admin app (port 5175/5176)
  if (!currentUser) return <Navigate to="/profile" replace />;
  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/profile" element={<EditorProfile />} />
      <Route path="/dashboard" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
      <Route path="/dashboard/project/:id" element={<ProtectedRoute role="client"><ClientProjectPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
