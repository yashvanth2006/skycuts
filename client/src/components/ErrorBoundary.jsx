import { Component } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111',
          color: '#e8e8e8',
          fontFamily: "'Inter', system-ui, sans-serif",
          padding: '20px',
        }}>
          <div style={{
            maxWidth: 500,
            width: '100%',
            textAlign: 'center',
          }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              border: '2px solid rgba(239,68,68,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <AlertCircle size={40} style={{ color: '#ef4444' }} />
            </div>
            
            <h1 style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 12,
              color: '#e8e8e8',
            }}>
              Something went wrong
            </h1>
            
            <p style={{
              fontSize: 15,
              color: '#9a9a9a',
              lineHeight: 1.6,
              marginBottom: 32,
            }}>
              An unexpected error occurred. We've been notified and are working to fix the issue.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                background: '#1c1c1c',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24,
                fontSize: 12,
                color: '#ef4444',
              }}>
                <summary style={{
                  cursor: 'pointer',
                  fontWeight: 600,
                  marginBottom: 8,
                  color: '#e8e8e8',
                }}>
                  Error Details
                </summary>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                  overflow: 'auto',
                  maxHeight: 200,
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
            }}>
              <button
                onClick={this.handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 8,
                  background: '#2F74D0',
                  border: 'none',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4A9EFF'}
                onMouseOut={(e) => e.currentTarget.style.background = '#2F74D0'}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              
              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 24px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#e8e8e8',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
