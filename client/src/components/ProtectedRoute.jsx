import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const RouteLoader = () => (
  <div style={{
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-void)',
  }}>
    <div style={{
      width: 46,
      height: 46,
      borderRadius: '50%',
      border: '4px solid var(--border-subtle)',
      borderTopColor: 'var(--accent-blue)',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

export default function ProtectedRoute({ children, role }) {
  const { currentUser, loading } = useAuth();

  if (loading) return <RouteLoader />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (role && currentUser.role !== role) return <Navigate to="/login" replace />;
  return children;
}
