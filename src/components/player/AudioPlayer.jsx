import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import FavoriteButton from '../favorites/FavoriteButton';
import ProgressBar from './ProgressBar';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds === 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    coverUrl,
    loading,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrevious
  } = usePlayer();

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900 to-black border-t border-gray-800 px-4 py-3 z-50">
      <div className="max-w-screen-xl mx-auto flex items-center gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={currentSong.title}
              className="w-14 h-14 rounded shadow-lg object-cover"
            />
          ) : (
            <div className="w-14 h-14 bg-gray-700 rounded shadow-lg flex items-center justify-center">
              <span className="text-2xl">🎵</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-white font-medium truncate text-sm">
              {currentSong.title}
            </p>
            <p className="text-gray-400 text-xs truncate">
              {currentSong.artist}
            </p>
          </div>
          <FavoriteButton songId={currentSong.id} size="small" />
        </div>

        {/* Player Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl">
          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={playPrevious}
              className="text-gray-400 hover:text-white transition p-1"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              disabled={loading}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg disabled:opacity-50"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-black rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-black" />
              ) : (
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-gray-400 hover:text-white transition p-1"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2">
            <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>

            <ProgressBar
              progress={progress}
              onSeek={(percent) => seek(percent * duration)}
            />

            <span className="text-xs text-gray-400 w-10 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="w-32 flex items-center gap-2">
          <button
            onClick={() => setVolume(volume === 0 ? 1 : 0)}
            className="text-gray-400 hover:text-white transition"
            title={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-1 accent-green-500"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}
