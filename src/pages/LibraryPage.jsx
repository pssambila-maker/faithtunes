import { useState, useMemo } from 'react';
import { useSongs } from '../hooks/useSongs';
import { usePlayer } from '../contexts/PlayerContext';
import { useAuth } from '../contexts/AuthContext';
import SongList from '../components/library/SongList';
import Loader from '../components/ui/Loader';
import {
  Library, Play, X, CheckSquare, ChevronDown, Search,
  LayoutGrid, List, ArrowUpDown, Shuffle
} from 'lucide-react';

const ADMIN_UIDS = [
  'tGI50dxIhJQmFbsqucuJJb8FenG3',
  'xTye4MLVkOUOy7Cb98mnjwXInGP2'
];

const SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'title_asc', label: 'Title A–Z' },
  { value: 'title_desc', label: 'Title Z–A' },
  { value: 'artist_asc', label: 'Artist A–Z' },
  { value: 'artist_desc', label: 'Artist Z–A' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function LibraryPage() {
  const { songs, allSongs, loading, loadingMore, error, searchTerm, setSearchTerm, hasMore, loadMore, totalCount } = useSongs();
  const { playSong, toggleShuffle, shuffleMode } = usePlayer();
  const { user } = useAuth();

  const [selectedSongs, setSelectedSongs] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [sortBy, setSortBy] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  const sortedSongs = useMemo(() => {
    const arr = [...songs];
    switch (sortBy) {
      case 'title_asc':  return arr.sort((a, b) => a.title?.localeCompare(b.title));
      case 'title_desc': return arr.sort((a, b) => b.title?.localeCompare(a.title));
      case 'artist_asc': return arr.sort((a, b) => a.artist?.localeCompare(b.artist));
      case 'artist_desc':return arr.sort((a, b) => b.artist?.localeCompare(a.artist));
      case 'newest':     return arr.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(a.createdAt) || 0;
        const db = b.createdAt?.toDate?.() || new Date(b.createdAt) || 0;
        return db - da;
      });
      case 'oldest':     return arr.sort((a, b) => {
        const da = a.createdAt?.toDate?.() || new Date(a.createdAt) || 0;
        const db = b.createdAt?.toDate?.() || new Date(b.createdAt) || 0;
        return da - db;
      });
      default: return arr;
    }
  }, [songs, sortBy]);

  const handlePlayAll = () => {
    if (sortedSongs.length > 0) playSong(sortedSongs[0], sortedSongs);
  };

  const handleShufflePlay = () => {
    if (sortedSongs.length > 0) {
      const shuffled = [...sortedSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const handlePlaySelected = () => {
    if (selectedSongs.length > 0) {
      playSong(selectedSongs[0], selectedSongs);
      setSelectedSongs([]);
      setSelectMode(false);
    }
  };

  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    if (selectMode) setSelectedSongs([]);
  };

  const toggleSongSelection = (song) => {
    setSelectedSongs(prev => {
      const isSelected = prev.some(s => s.id === song.id);
      return isSelected ? prev.filter(s => s.id !== song.id) : [...prev, song];
    });
  };

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort';

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
      <header className="sticky top-0 bg-gray-900/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Library className="w-7 h-7 text-green-500" />
              <h1 className="text-2xl font-bold text-white">Your Library</h1>
              {isAdmin && (
                <span className="text-gray-500 text-sm">
                  ({allSongs.length} of {totalCount} loaded)
                </span>
              )}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition ${viewMode === 'grid' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                title="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2 flex-wrap">
            {selectMode ? (
              <>
                <button
                  onClick={handlePlaySelected}
                  disabled={selectedSongs.length === 0}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-full transition text-sm"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Play {selectedSongs.length > 0 ? `(${selectedSongs.length})` : 'Selected'}
                </button>
                <button
                  onClick={toggleSelectMode}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition text-sm"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handlePlayAll}
                  disabled={sortedSongs.length === 0}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-full transition text-sm"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Play All
                </button>
                <button
                  onClick={handleShufflePlay}
                  disabled={sortedSongs.length === 0}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full transition text-sm"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
                <button
                  onClick={toggleSelectMode}
                  disabled={sortedSongs.length === 0}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full transition text-sm"
                >
                  <CheckSquare className="w-4 h-4" />
                  Select
                </button>

                {/* Sort */}
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowSortMenu(s => !s)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    {currentSortLabel}
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-xl shadow-xl py-1 w-44 z-20">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition hover:bg-gray-700 ${
                            sortBy === opt.value ? 'text-green-500 font-medium' : 'text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search songs..."
                className="w-56 pl-9 pr-8 py-2 bg-gray-800 text-white text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition placeholder-gray-400"
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
      </header>

      {/* Content */}
      <main className="px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          {searchTerm && (
            <p className="text-gray-400 text-sm mb-4">
              {sortedSongs.length} {sortedSongs.length === 1 ? 'result' : 'results'} for "{searchTerm}"
            </p>
          )}

          <SongList
            songs={sortedSongs}
            selectMode={selectMode}
            selectedSongs={selectedSongs}
            onToggleSelect={toggleSongSelection}
            viewMode={viewMode}
            emptyMessage={searchTerm ? 'No songs match your search' : 'No songs in your library yet'}
          />

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
