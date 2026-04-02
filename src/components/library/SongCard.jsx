import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Heart, ListPlus, Share2 } from 'lucide-react';
import { getCoverUrl } from '../../services/songService';
import { usePlayer } from '../../contexts/PlayerContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import toast from 'react-hot-toast';

function SongCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 animate-pulse">
      <div className="aspect-square mb-4 rounded bg-gray-700" />
      <div className="h-4 bg-gray-700 rounded mb-2 w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
    </div>
  );
}

function ContextMenu({ x, y, song, onClose }) {
  const { addToQueue, playSong, activePlaylist } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();
  const menuRef = useRef(null);
  const fav = isFavorite(song.id);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('contextmenu', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('contextmenu', handler);
    };
  }, [onClose]);

  // Adjust position so menu doesn't overflow viewport
  const menuX = Math.min(x, window.innerWidth - 200);
  const menuY = Math.min(y, window.innerHeight - 160);

  const handleAddToQueue = () => {
    addToQueue(song);
    toast.success(`Added "${song.title}" to queue`);
    onClose();
  };

  const handleFavorite = async () => {
    try {
      await toggleFavorite(song.id);
      toast.success(fav ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorite');
    }
    onClose();
  };

  const handlePlay = () => {
    playSong(song, activePlaylist.length > 0 ? activePlaylist : [song]);
    onClose();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}?song=${song.id}`).catch(() => {});
    toast.success('Link copied to clipboard');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[200] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl py-1 w-48 text-sm"
      style={{ left: menuX, top: menuY }}
    >
      <button
        onClick={handlePlay}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition text-left"
      >
        <Play className="w-4 h-4" />
        Play
      </button>
      <button
        onClick={handleAddToQueue}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition text-left"
      >
        <ListPlus className="w-4 h-4" />
        Add to queue
      </button>
      <button
        onClick={handleFavorite}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition text-left"
      >
        <Heart className={`w-4 h-4 ${fav ? 'fill-green-500 text-green-500' : ''}`} />
        {fav ? 'Remove from favorites' : 'Add to favorites'}
      </button>
      <div className="border-t border-gray-700 my-1" />
      <button
        onClick={handleShare}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700 transition text-left"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>
    </div>
  );
}

export default function SongCard({ song, onPlay, isPlaying, isCurrentSong, selectMode, isSelected, selectionOrder }) {
  const [coverUrl, setCoverUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (song.coverPath) {
      setImageLoading(true);
      getCoverUrl(song.coverPath)
        .then((url) => { setCoverUrl(url); setImageLoading(false); })
        .catch(() => setImageLoading(false));
    } else {
      setImageLoading(false);
    }
  }, [song.coverPath]);

  const handleContextMenu = useCallback((e) => {
    if (selectMode) return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, [selectMode]);

  if (imageLoading) return <SongCardSkeleton />;

  return (
    <>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          song={song}
          onClose={() => setContextMenu(null)}
        />
      )}

      <div
        className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-700/80 transition cursor-pointer group relative ${
          isCurrentSong ? 'ring-2 ring-green-500' : ''
        } ${selectMode && isSelected ? 'ring-2 ring-blue-500 bg-blue-900/20' : ''}`}
        onClick={() => onPlay(song)}
        onContextMenu={handleContextMenu}
      >
        {/* Cover Art */}
        <div className="relative aspect-square mb-4 rounded overflow-hidden bg-gray-700">
          {coverUrl ? (
            <img src={coverUrl} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <span className="text-5xl">🎵</span>
            </div>
          )}

          {/* Selection indicator */}
          {selectMode && (
            <div
              className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 ${
                isSelected ? 'bg-blue-500 border-blue-500' : 'bg-gray-800/80 border-gray-400'
              }`}
            >
              {isSelected ? (
                <span className="text-white font-bold text-sm">{selectionOrder}</span>
              ) : (
                <span className="text-gray-400 text-xs">+</span>
              )}
            </div>
          )}

          {/* Play button */}
          {!selectMode && (
            <button
              className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:bg-green-400 transition-all ${
                isCurrentSong ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
              }`}
              onClick={(e) => { e.stopPropagation(); onPlay(song); }}
            >
              {isCurrentSong && isPlaying ? (
                <Pause className="w-6 h-6 text-black fill-black" />
              ) : (
                <Play className="w-6 h-6 text-black fill-black ml-1" />
              )}
            </button>
          )}
        </div>

        {/* Song Info */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>
              {song.title}
            </h3>
            <p className="text-gray-400 text-sm truncate">{song.artist}</p>
          </div>
        </div>

        {/* Tags */}
        {song.tags && Array.isArray(song.tags) && song.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {song.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
            {song.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{song.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
