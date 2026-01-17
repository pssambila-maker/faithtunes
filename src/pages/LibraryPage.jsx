import { useState } from 'react';
import { useSongs } from '../hooks/useSongs';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import SongList from '../components/library/SongList';
import Loader from '../components/ui/Loader';
import { Library, Play, X, CheckSquare, ChevronDown, Search } from 'lucide-react';

const ADMIN_UIDS = [
  'tGI50dxIhJQmFbsqucuJJb8FenG3',
  'xTye4MLVkOUOy7Cb98mnjwXInGP2'
];

export default function LibraryPage() {
  const { songs, allSongs, loading, loadingMore, error, searchTerm, setSearchTerm, hasMore, loadMore, totalCount } = useSongs();
  const { playSong } = usePlayer();
  const { user } = useAuth();
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectMode, setSelectMode] = useState(false);

  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handlePlaySelected = () => {
    if (selectedSongs.length > 0) {
      // Play in the order they were selected
      playSong(selectedSongs[0], selectedSongs);
      setSelectedSongs([]);
      setSelectMode(false);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) {
      setSelectedSongs([]);
    }
  };

  const toggleSongSelection = (song) => {
    setSelectedSongs(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      if (isSelected) {
        return prev.filter(s => s.id !== song.id);
      } else {
        return [...prev, song];
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader size="large" text="Loading your library..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Failed to load songs</p>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-32">
      {/* Header */}
      <header className="sticky top-16 bg-gray-900/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Library className="w-8 h-8 text-green-500" />
              <h1 className="text-2xl font-bold text-white">Your Library</h1>
              {isAdmin && (
                <span className="text-gray-500 text-sm">
                  ({allSongs.length} of {totalCount} loaded)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectMode ? (
                <>
                  <button
                    onClick={handlePlaySelected}
                    disabled={selectedSongs.length === 0}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-full transition"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    Play {selectedSongs.length > 0 ? `(${selectedSongs.length})` : 'Selected'}
                  </button>
                  <button
                    onClick={toggleSelectMode}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePlayAll}
                    disabled={songs.length === 0}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-full transition"
                  >
                    <Play className="w-5 h-5 fill-black" />
                    Play All
                  </button>
                  <button
                    onClick={toggleSelectMode}
                    disabled={songs.length === 0}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full transition"
                  >
                    <CheckSquare className="w-5 h-5" />
                    Select
                  </button>
                </>
              )}
              {/* Search Bar - inline */}
              <div className="relative ml-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, artist, tag..."
                  className="w-64 pl-9 pr-8 py-2 bg-gray-800 text-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          {searchTerm && (
            <p className="text-gray-400 text-sm mb-4">
              {songs.length} {songs.length === 1 ? 'result' : 'results'} for "{searchTerm}"
            </p>
          )}
          <SongList
            songs={songs}
            selectMode={selectMode}
            selectedSongs={selectedSongs}
            onToggleSelect={toggleSongSelection}
            emptyMessage={
              searchTerm
                ? 'No songs match your search'
                : 'No songs in your library yet'
            }
          />

          {/* Load More Button */}
          {hasMore && !searchTerm && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white px-6 py-3 rounded-full transition"
              >
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    Load More Songs
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
