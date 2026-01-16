import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import { Music } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-600 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/library" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
            <Music className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-white">FaithTunes</h1>
          <p className="text-gray-400 mt-2">Sign in to continue</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
