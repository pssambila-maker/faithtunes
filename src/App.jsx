import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProvider } from './contexts/PlayerContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Navbar from './components/ui/Navbar';
import AudioPlayer from './components/player/AudioPlayer';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminPage from './pages/AdminPage';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <AudioPlayer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <FavoritesProvider>
            <div className="min-h-screen bg-gray-900">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <HomePage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <LibraryPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <FavoritesPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <AdminPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>

            <Toaster
              position="bottom-center"
              containerStyle={{
                bottom: 100
              }}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1f2937',
                  color: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #374151'
                },
                success: {
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff'
                  }
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff'
                  }
                }
              }}
            />
          </FavoritesProvider>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
