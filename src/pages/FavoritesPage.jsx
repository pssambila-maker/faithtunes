import { useState, useEffect } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlayer } from '../contexts/PlayerContext';
import { getSongById } from '../services/songService';
import SongList from '../components/library/SongList';
import Loader from '../components/ui/Loader';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { favorites, loading: favLoading } = useFavorites();
  const { currentSong, playSong, isPlaying } = usePlayer();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFavoriteSongs() {
      if (favLoading) return;

      if (favorites.length === 0) {
        setSongs([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const songPromises = favorites.map((fav) =>
          getSongById(fav.songId).catch(() => null)
        );
        const songData = await Promise.all(songPromises);
        const validSongs = songData.filter(Boolean);
        setSongs(validSongs);
        setError(null);
      } catch (err) {
        console.error('Error fetching favorite songs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFavoriteSongs();
  }, [favorites, favLoading]);

  if (loading || favLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader size="large" text="Loading your favorites..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Failed to load favorites</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-32">
      {/* Header */}
      <header className="px-6 py-8 bg-gradient-to-b from-green-900/30 to-gray-900">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <p className="text-gray-400 text-sm uppercase tracking-wider">Playlist</p>
              <h1 className="text-3xl font-bold text-white">Your Favorites</h1>
              <p className="text-gray-400 mt-1">
                {songs.length} {songs.length === 1 ? 'song' : 'songs'}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          {songs.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-20 h-20 mx-auto mb-6 text-gray-700" />
              <h2 className="text-xl font-semibold text-white mb-2">
                No favorites yet
              </h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Start adding songs to your favorites by clicking the heart icon
                on any song in your library.
              </p>
            </div>
          ) : (
            <SongList songs={songs} />
          )}
        </div>
      </main>
    </div>
  );
}
