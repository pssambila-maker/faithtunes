import { NavLink } from 'react-router-dom';
import { Home, Library, Heart, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const ADMIN_UIDS = [
  'tGI50dxIhJQmFbsqucuJJb8FenG3',
  'xTye4MLVkOUOy7Cb98mnjwXInGP2'
];

export default function BottomNav() {
  const { user } = useAuth();
  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  const linkClass = ({ isActive }) =>
    `flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
      isActive ? 'text-white' : 'text-gray-500'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black border-t border-gray-800 flex md:hidden">
      <NavLink to="/" end className={linkClass}>
        <Home className="w-5 h-5" />
        <span className="text-xs">Home</span>
      </NavLink>

      <NavLink to="/library" className={linkClass}>
        <Library className="w-5 h-5" />
        <span className="text-xs">Library</span>
      </NavLink>

      <NavLink to="/favorites" className={linkClass}>
        <Heart className="w-5 h-5" />
        <span className="text-xs">Favourites</span>
      </NavLink>

      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
              isActive ? 'text-yellow-400' : 'text-yellow-600'
            }`
          }
        >
          <Shield className="w-5 h-5" />
          <span className="text-xs">Admin</span>
        </NavLink>
      )}
    </nav>
  );
}
