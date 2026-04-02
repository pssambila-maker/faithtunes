import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#111827', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'sans-serif', padding: '2rem', textAlign: 'center'
        }}>
          <div>
            <p style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</p>
            <h1 style={{ marginBottom: '0.5rem' }}>App failed to start</h1>
            <p style={{ color: '#9ca3af', marginBottom: '1rem' }}>
              {this.state.error?.message}
            </p>
            {this.state.error?.message?.includes('Firebase') || !import.meta.env.VITE_FIREBASE_API_KEY ? (
              <p style={{ color: '#22c55e', fontSize: '0.875rem' }}>
                Missing <strong>.env</strong> file — copy <code>.env.example</code> to <code>.env</code> and fill in your Firebase credentials.
              </p>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
