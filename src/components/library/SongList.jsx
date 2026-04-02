import { useState, useEffect } from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import SongCard from './SongCard';
import { usePlayer } from '../../contexts/PlayerContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getCoverUrl } from '../../services/songService';
import toast from 'react-hot-toast';

function SongRow({ song, index, songs }) {
  const { currentSong, isPlaying, playSong } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [coverUrl, setCoverUrl] = useState(null);
  const [hovered, setHovered] = useState(false);

  const isActive = currentSong?.id === song.id;
  const fav = isFavorite(song.id);

  useEffect(() => {
    if (song.coverPath) {
      getCoverUrl(song.coverPath).then(setCoverUrl).catch(() => {});
    }
  }, [song.coverPath]);

  const handleFavorite = async (e) => {
    e.stopPropagation();
    try {
      await toggleFavorite(song.id);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <tr
      className={`group cursor-pointer transition-colors ${
        isActive ? 'bg-green-900/20' : 'hover:bg-gray-800/60'
      }`}
      onClick={() => playSong(song, songs)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* # / Play indicator */}
      <td className="pl-4 pr-2 py-2.5 w-10 text-center">
        {hovered || isActive ? (
          <button
            className="text-white hover:text-green-400 transition"
            onClick={(e) => { e.stopPropagation(); playSong(song, songs); }}
          >
            {isActive && isPlaying
              ? <Pause className="w-4 h-4 fill-green-500 text-green-500" />
              : <Play className="w-4 h-4 fill-white" />
            }
          </button>
        ) : (
          <span className={`text-sm tabular-nums ${isActive ? 'text-green-500' : 'text-gray-500'}`}>
            {index + 1}
          </span>
        )}
      </td>

      {/* Cover + Title + Artist */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gray-700 flex-shrink-0 overflow-hidden">
            {coverUrl
              ? <img src={coverUrl} alt={song.title} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
            }
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${isActive ? 'text-green-500' : 'text-white'}`}>
              {song.title}
            </p>
            <p className="text-gray-400 text-xs truncate">{song.artist}</p>
          </div>
        </div>
      </td>

      {/* Tags */}
      <td className="px-3 py-2 hidden md:table-cell">
        <div className="flex gap-1 flex-wrap">
          {song.tags?.slice(0, 2).map((tag, i) => (
            <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </td>

      {/* Favorite */}
      <td className="px-3 py-2 w-10">
        <button
          onClick={handleFavorite}
          className={`transition opacity-0 group-hover:opacity-100 ${fav ? 'opacity-100 text-green-500' : 'text-gray-500 hover:text-white'}`}
        >
          <Heart className={`w-4 h-4 ${fav ? 'fill-green-500' : ''}`} />
        </button>
      </td>
    </tr>
  );
}

export default function SongList({ songs, emptyMessage, selectMode, selectedSongs = [], onToggleSelect, viewMode = 'grid' }) {
  const { currentSong, isPlaying, playSong } = usePlayer();

  const handlePlay = (song) => {
    if (selectMode) {
      onToggleSelect(song);
    } else {
      playSong(song, songs);
    }
  };

  if (songs.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p>{emptyMessage || 'No songs found'}</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wide">
              <th className="pl-4 pr-2 py-3 w-10 text-center">#</th>
              <th className="px-3 py-3 text-left">Title</th>
              <th className="px-3 py-3 text-left hidden md:table-cell">Tags</th>
              <th className="px-3 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {songs.map((song, i) => (
              <SongRow key={song.id} song={song} index={i} songs={songs} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {songs.map((song) => (
        <SongCard
          key={song.id}
          song={song}
          onPlay={handlePlay}
          isPlaying={isPlaying}
          isCurrentSong={currentSong?.id === song.id}
          selectMode={selectMode}
          isSelected={selectedSongs.some(s => s.id === song.id)}
          selectionOrder={selectedSongs.findIndex(s => s.id === song.id) + 1}
        />
      ))}
    </div>
  );
}
