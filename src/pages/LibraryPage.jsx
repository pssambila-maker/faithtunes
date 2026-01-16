import { useSongs } from '../hooks/useSongs';
import SearchBar from '../components/library/SearchBar';
import SongList from '../components/library/SongList';
import Loader from '../components/ui/Loader';
import { Library } from 'lucide-react';

export default function LibraryPage() {
  const { songs, allSongs, loading, error, searchTerm, setSearchTerm } = useSongs();

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Library className="w-8 h-8 text-green-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Your Library</h1>
                <p className="text-gray-400 text-sm">
                  {allSongs.length} {allSongs.length === 1 ? 'song' : 'songs'} available
                </p>
              </div>
            </div>
          </div>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
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
            emptyMessage={
              searchTerm
                ? 'No songs match your search'
                : 'No songs in your library yet'
            }
          />
        </div>
      </main>
    </div>
  );
}
