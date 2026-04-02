import { NavLink } from 'react-router-dom';
import { Home, Library, Heart, LogOut, Music, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePlayer } from '../../contexts/PlayerContext';
import toast from 'react-hot-toast';
import { useState } from 'react';

const ADMIN_UIDS = [
  'tGI50dxIhJQmFbsqucuJJb8FenG3',
  'xTye4MLVkOUOy7Cb98mnjwXInGP2'
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { currentSong } = usePlayer();
  const [collapsed, setCollapsed] = useState(false);
  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
      isActive
        ? 'bg-gray-700 text-white'
        : 'text-gray-400 hover:text-white hover:bg-gray-800'
    }`;

  return (
    <aside
      className={`flex-shrink-0 flex flex-col bg-black z-40 transition-all duration-300 h-screen sticky top-0 overflow-y-auto ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      style={{ paddingBottom: '88px' }} /* leave space for player */
    >
      {/* Logo + Collapse Toggle */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            <Music className="w-7 h-7 text-green-500 flex-shrink-0" />
            <span className="text-white font-bold text-lg truncate">FaithTunes</span>
          </div>
        )}
        {collapsed && <Music className="w-7 h-7 text-green-500 mx-auto" />}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="text-gray-500 hover:text-white transition ml-auto flex-shrink-0"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <NavLink to="/" end className={navLinkClass} title="Home">
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Home</span>}
        </NavLink>

        <NavLink to="/library" className={navLinkClass} title="Library">
          <Library className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Library</span>}
        </NavLink>

        <NavLink to="/favorites" className={navLinkClass} title="Favorites">
          <Heart className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Favorites</span>}
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/admin"
            title="Admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                isActive
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10'
              }`
            }
          >
            <Shield className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Admin</span>}
          </NavLink>
        )}
      </nav>

      {/* User Section */}
      <div className="px-2 py-3 border-t border-gray-800">
        <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-bold">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.email}</p>
              {currentSong && (
                <p className="text-green-500 text-xs truncate">▶ {currentSong.title}</p>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-white transition p-1 flex-shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
