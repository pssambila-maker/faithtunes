import { lazy, Suspense, Component } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Sidebar from './components/ui/Sidebar';
import AudioPlayer from './components/player/AudioPlayer';
import NowPlayingModal from './components/player/NowPlayingModal';
import Loader from './components/ui/Loader';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Lazy-loaded pages
const HomePage      = lazy(() => import('./pages/HomePage'));
const LibraryPage   = lazy(() => import('./pages/LibraryPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminPage     = lazy(() => import('./pages/AdminPage'));
const LoginPage     = lazy(() => import('./pages/LoginPage'));
const SignupPage    = lazy(() => import('./pages/SignupPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-64 py-24">
      <Loader size="large" />
    </div>
  );
}

class ErrorBoundary extends Component {
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
        <div className="flex items-center justify-center min-h-64 py-24">
          <div className="text-center max-w-md px-6">
            <p className="text-4xl mb-4">⚠️</p>
            <h2 className="text-white text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 text-sm mb-6">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-2 rounded-full transition"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Layout component — uses <Outlet /> so React Router renders child routes inside it
function AppLayout() {
  useKeyboardShortcuts();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-24 min-w-0" id="main-content">
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <AudioPlayer />
      <NowPlayingModal />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <FavoritesProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/login"  element={<Suspense fallback={<PageLoader />}><LoginPage /></Suspense>} />
              <Route path="/signup" element={<Suspense fallback={<PageLoader />}><SignupPage /></Suspense>} />

              {/* Protected layout — AppLayout renders <Outlet /> for child routes */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/"          element={<HomePage />} />
                <Route path="/library"   element={<LibraryPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/admin"     element={<AdminPage />} />
                <Route path="*"          element={<Navigate to="/" replace />} />
              </Route>
            </Routes>

            <Toaster
              position="bottom-center"
              containerStyle={{ bottom: 100 }}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />
          </FavoritesProvider>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
