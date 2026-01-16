import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import toast from 'react-hot-toast';

export default function FavoriteButton({ songId, size = 'default' }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(false);

  const favorited = isFavorite(songId);

  const sizeClasses = {
    small: 'p-1.5',
    default: 'p-2',
    large: 'p-3'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  };

  const handleClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    try {
      await toggleFavorite(songId);
      toast.success(favorited ? 'Removed from favorites' : 'Added to favorites', {
        duration: 2000,
        icon: favorited ? '💔' : '❤️'
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${sizeClasses[size]} rounded-full transition-all hover:scale-110 ${
        favorited
          ? 'text-green-500 hover:text-green-400'
          : 'text-gray-400 hover:text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
      title={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform ${
          favorited ? 'fill-current scale-110' : ''
        } ${loading ? 'animate-pulse' : ''}`}
      />
    </button>
  );
}
