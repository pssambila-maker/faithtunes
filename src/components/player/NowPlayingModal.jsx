import { useEffect } from 'react';
import {
  X, Play, Pause, SkipBack, SkipForward, Repeat, Repeat1,
  Shuffle, Volume2, VolumeX, Heart
} from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import ProgressBar from './ProgressBar';
import toast from 'react-hot-toast';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function NowPlayingModal() {
  const {
    currentSong, isPlaying, duration, currentTime, volume, coverUrl, loading,
    repeatMode, shuffleMode, showNowPlaying, setShowNowPlaying,
    togglePlay, seek, setVolume, playNext, playPrevious, toggleRepeat, toggleShuffle,
  } = usePlayer();
  const { isFavorite, toggleFavorite } = useFavorites();

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const fav = currentSong ? isFavorite(currentSong.id) : false;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setShowNowPlaying(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setShowNowPlaying]);

  if (!showNowPlaying || !currentSong) return null;

  const handleFavorite = async () => {
    try {
      await toggleFavorite(currentSong.id);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowNowPlaying(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden shadow-2xl">
        {/* Blurred background */}
        <div className="absolute inset-0 overflow-hidden">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt=""
              className="w-full h-full object-cover scale-110"
              style={{ filter: 'blur(40px) brightness(0.35)' }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-900 to-gray-900" />
          )}
        </div>

        {/* Content */}
        <div className="relative px-8 pt-6 pb-8">
          {/* Close */}
          <button
            onClick={() => setShowNowPlaying(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>

          <p className="text-white/60 text-xs text-center uppercase tracking-widest mb-6">Now Playing</p>

          {/* Album Art */}
          <div className="w-56 h-56 mx-auto mb-6 rounded-xl overflow-hidden shadow-2xl bg-gray-800">
            {coverUrl ? (
              <img src={coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
                <span className="text-7xl">🎵</span>
              </div>
            )}
          </div>

          {/* Song Info + Favorite */}
          <div className="flex items-start justify-between mb-6">
            <div className="min-w-0 flex-1 mr-3">
              <h2 className="text-white font-bold text-xl truncate">{currentSong.title}</h2>
              <p className="text-white/60 truncate">{currentSong.artist}</p>
              {currentSong.scripture && (
                <p className="text-green-400 text-xs mt-1 italic truncate">{currentSong.scripture}</p>
              )}
            </div>
            <button
              onClick={handleFavorite}
              className={`p-2 rounded-full transition flex-shrink-0 ${fav ? 'text-green-500' : 'text-white/40 hover:text-white'}`}
            >
              <Heart className={`w-6 h-6 ${fav ? 'fill-green-500' : ''}`} />
            </button>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <ProgressBar
              progress={progress}
              duration={duration}
              onSeek={(percent) => seek(percent * duration)}
            />
            <div className="flex justify-between mt-1">
              <span className="text-white/50 text-xs tabular-nums">{formatTime(currentTime)}</span>
              <span className="text-white/50 text-xs tabular-nums">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <button
              onClick={toggleShuffle}
              className={`transition ${shuffleMode ? 'text-green-500' : 'text-white/40 hover:text-white'}`}
              title="Shuffle"
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button onClick={playPrevious} className="text-white/70 hover:text-white transition">
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={togglePlay}
              disabled={loading}
              className="w-14 h-14 bg-white rounded-full flex items-center justify-center hover:scale-105 transition shadow-xl disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-6 h-6 text-black fill-black" />
              ) : (
                <Play className="w-6 h-6 text-black fill-black ml-1" />
              )}
            </button>

            <button onClick={playNext} className="text-white/70 hover:text-white transition">
              <SkipForward className="w-6 h-6" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`transition ${repeatMode !== 'off' ? 'text-green-500' : 'text-white/40 hover:text-white'}`}
              title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat Off'}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-3">
            <button onClick={() => setVolume(volume === 0 ? 1 : 0)} className="text-white/50 hover:text-white transition">
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-1 accent-green-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
