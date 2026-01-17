import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublishedSongs, getCoverUrl } from '../services/songService';
import { useFavorites } from '../contexts/FavoritesContext';
import { usePlayer } from '../contexts/PlayerContext';
import Loader from '../components/ui/Loader';
import { Play, Pause, Search, Library, Heart } from 'lucide-react';

export default function HomePage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { favorites } = useFavorites();
  const { playSong, currentSong, isPlaying } = usePlayer();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        const data = await getPublishedSongs();
        setSongs(data);
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  // Get favorite songs (limit to 6)
  const favoriteSongs = useMemo(() => {
    return songs.filter(song => favorites.includes(song.id)).slice(0, 6);
  }, [songs, favorites]);

  // Get recently added (limit to 6)
  const recentlyAdded = useMemo(() => {
    return [...songs]
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      })
      .slice(0, 6);
  }, [songs]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return songs.filter(s =>
      s.title?.toLowerCase().includes(term) ||
      s.artist?.toLowerCase().includes(term)
    ).slice(0, 12);
  }, [songs, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader size="large" text="Loading FaithTunes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-32">
      {/* Header */}
      <header className="bg-gradient-to-b from-green-900/40 to-gray-900 px-6 pt-6 pb-8">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">Good {getGreeting()}</h1>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="What do you want to play?"
              className="w-full bg-gray-800 text-white rounded-full pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
            />
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        <div className="max-w-screen-xl mx-auto">
          {/* Search Results */}
          {searchTerm ? (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">
                Results for "{searchTerm}"
              </h2>
              {searchResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {searchResults.map(song => (
                    <CompactSongCard
                      key={song.id}
                      song={song}
                      onPlay={() => playSong(song, searchResults)}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No songs found matching "{searchTerm}"</p>
              )}
            </section>
          ) : (
            <>
              {/* Quick Access Grid */}
              <section className="mb-8">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <QuickAccessCard
                    icon={<Library className="w-6 h-6 text-green-500" />}
                    title="Library"
                    subtitle={`${songs.length} songs`}
                    onClick={() => navigate('/library')}
                  />
                  <QuickAccessCard
                    icon={<Heart className="w-6 h-6 text-pink-500" />}
                    title="Favorites"
                    subtitle={`${favorites.length} songs`}
                    onClick={() => navigate('/favorites')}
                  />
                  {recentlyAdded[0] && (
                    <QuickAccessCard
                      coverPath={recentlyAdded[0].coverPath}
                      title={recentlyAdded[0].title}
                      subtitle="Recently Added"
                      onClick={() => playSong(recentlyAdded[0], recentlyAdded)}
                    />
                  )}
                </div>
              </section>

              {/* Your Favorites */}
              {favoriteSongs.length > 0 && (
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">Your Favorites</h2>
                    <button
                      onClick={() => navigate('/favorites')}
                      className="text-sm text-gray-400 hover:text-white transition"
                    >
                      Show all
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {favoriteSongs.map(song => (
                      <CompactSongCard
                        key={song.id}
                        song={song}
                        onPlay={() => playSong(song, favoriteSongs)}
                        isCurrentSong={currentSong?.id === song.id}
                        isPlaying={isPlaying}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Recently Added */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Recently Added</h2>
                  <button
                    onClick={() => navigate('/library')}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    Show all
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recentlyAdded.map(song => (
                    <CompactSongCard
                      key={song.id}
                      song={song}
                      onPlay={() => playSong(song, recentlyAdded)}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                    />
                  ))}
                </div>
              </section>

              {/* All Songs */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">All Songs</h2>
                  <button
                    onClick={() => navigate('/library')}
                    className="text-sm text-gray-400 hover:text-white transition"
                  >
                    View library
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {songs.slice(0, 12).map(song => (
                    <CompactSongCard
                      key={song.id}
                      song={song}
                      onPlay={() => playSong(song, songs)}
                      isCurrentSong={currentSong?.id === song.id}
                      isPlaying={isPlaying}
                    />
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// Compact song card for home page - no tags, cleaner look
function CompactSongCard({ song, onPlay, isCurrentSong, isPlaying }) {
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    if (song.coverPath) {
      getCoverUrl(song.coverPath)
        .then(setCoverUrl)
        .catch(() => {});
    }
  }, [song.coverPath]);

  return (
    <div
      className={`bg-gray-800/50 rounded-lg p-3 hover:bg-gray-700/70 transition cursor-pointer group ${
        isCurrentSong ? 'ring-2 ring-green-500 bg-green-900/20' : ''
      }`}
      onClick={onPlay}
    >
      {/* Cover Art */}
      <div className="relative aspect-square mb-3 rounded-md overflow-hidden bg-gray-700">
        {coverUrl ? (
          <img src={coverUrl} alt={song.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800">
            <span className="text-4xl">🎵</span>
          </div>
        )}

        {/* Play button */}
        <button
          className={`absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:bg-green-400 transition ${
            isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-5 h-5 text-black fill-black" />
          ) : (
            <Play className="w-5 h-5 text-black fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Song Info - clean, no tags */}
      <h3 className={`font-medium text-sm truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>
        {song.title}
      </h3>
      <p className="text-gray-400 text-xs truncate">{song.artist}</p>
    </div>
  );
}

// Quick access card for navigation
function QuickAccessCard({ icon, title, subtitle, onClick, coverPath }) {
  const [coverUrl, setCoverUrl] = useState(null);

  useEffect(() => {
    if (coverPath) {
      getCoverUrl(coverPath)
        .then(setCoverUrl)
        .catch(() => {});
    }
  }, [coverPath]);

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 bg-gray-800/80 hover:bg-gray-700 rounded-md p-3 transition text-left"
    >
      {coverUrl ? (
        <img src={coverUrl} alt="" className="w-12 h-12 rounded object-cover" />
      ) : icon ? (
        <div className="w-12 h-12 rounded bg-gray-700 flex items-center justify-center">
          {icon}
        </div>
      ) : (
        <div className="w-12 h-12 rounded bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
          <span className="text-2xl">🎵</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium text-sm truncate">{title}</p>
        <p className="text-gray-400 text-xs truncate">{subtitle}</p>
      </div>
    </button>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}
