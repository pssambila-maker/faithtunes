import { NavLink } from 'react-router-dom';
import { Home, Library, Heart, LogOut, Music, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_UIDS = [
  'tGI50dxIhJQmFbsqucuJJb8FenG3', // eus.java@gmail.com
  'xTye4MLVkOUOy7Cb98mnjwXInGP2'  // pssambila@gmail.com
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-black px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-green-500" />
          <h1 className="text-xl font-bold text-white">FaithTunes</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </NavLink>

          <NavLink
            to="/library"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Library className="w-5 h-5" />
            <span className="hidden sm:inline">Library</span>
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            <Heart className="w-5 h-5" />
            <span className="hidden sm:inline">Favorites</span>
          </NavLink>

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'text-yellow-500 hover:text-yellow-400'
                }`
              }
            >
              <Shield className="w-5 h-5" />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* User Section */}
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm hidden md:inline">
          {user?.email}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors p-2 rounded-full hover:bg-gray-800"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}
