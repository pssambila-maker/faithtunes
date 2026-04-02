import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, Shuffle, ListMusic, Maximize2
} from 'lucide-react';
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
    currentSong, isPlaying, duration, currentTime, volume, coverUrl, loading,
    repeatMode, shuffleMode, showQueue, setShowQueue, setShowNowPlaying,
    activePlaylist, togglePlay, seek, setVolume, playNext, playPrevious,
    toggleRepeat, toggleShuffle, playSong,
  } = usePlayer();

  if (!currentSong) return null;

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const currentIndex = activePlaylist.findIndex(s => s.id === currentSong.id);
  const upNext = activePlaylist.slice(currentIndex + 1, currentIndex + 6);

  return (
    <>
      {/* Queue Panel */}
      {showQueue && (
        <div className="fixed bottom-24 right-4 w-72 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="text-white font-semibold text-sm">Up Next</h3>
            <button
              onClick={() => setShowQueue(false)}
              className="text-gray-400 hover:text-white transition text-lg leading-none"
            >
              ✕
            </button>
          </div>
          {/* Now playing */}
          <div className="px-3 py-2 border-b border-gray-800">
            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1 px-2">Now Playing</p>
            <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg bg-gray-800/60">
              <span className="text-green-500 text-xs w-4">▶</span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{currentSong.title}</p>
                <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
              </div>
            </div>
          </div>
          <div className="p-2 max-h-60 overflow-y-auto">
            {upNext.length > 0 ? (
              upNext.map((song, i) => (
                <button
                  key={song.id}
                  onClick={() => { playSong(song, activePlaylist); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-left"
                >
                  <span className="text-gray-500 text-xs w-4">{currentIndex + 2 + i}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{song.title}</p>
                    <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-6">No more songs in queue</p>
            )}
          </div>
        </div>
      )}

      {/* Player Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-b from-gray-900/95 to-black border-t border-gray-800 px-4 py-3 z-50 backdrop-blur-sm">
        <div className="max-w-screen-xl mx-auto flex items-center gap-4">

          {/* Song Info */}
          <div className="flex items-center gap-3 w-64 min-w-0">
            <button
              onClick={() => setShowNowPlaying(true)}
              className="relative group flex-shrink-0"
              title="Open Now Playing"
            >
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={currentSong.title}
                  className="w-14 h-14 rounded shadow-lg object-cover group-hover:opacity-75 transition"
                />
              ) : (
                <div className="w-14 h-14 bg-gray-700 rounded shadow-lg flex items-center justify-center group-hover:opacity-75 transition">
                  <span className="text-2xl">🎵</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <Maximize2 className="w-4 h-4 text-white drop-shadow" />
              </div>
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-white font-medium truncate text-sm">{currentSong.title}</p>
              <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
            </div>
            <FavoriteButton songId={currentSong.id} size="small" />
          </div>

          {/* Player Controls */}
          <div className="flex-1 flex flex-col items-center gap-1 max-w-2xl">
            <div className="flex items-center gap-5">
              <button
                onClick={toggleShuffle}
                className={`transition ${shuffleMode ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
                title={shuffleMode ? 'Shuffle On' : 'Shuffle Off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={playPrevious}
                className="text-gray-400 hover:text-white transition"
                title="Previous"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={loading}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 transition shadow-lg disabled:opacity-50"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
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
                className="text-gray-400 hover:text-white transition"
                title="Next"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`transition ${repeatMode !== 'off' ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
                title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat Off'}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            <div className="w-full flex items-center gap-2">
              <span className="text-xs text-gray-400 w-10 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <ProgressBar
                progress={progress}
                duration={duration}
                onSeek={(percent) => seek(percent * duration)}
              />
              <span className="text-xs text-gray-400 w-10 tabular-nums">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="w-44 flex items-center gap-3 justify-end">
            <button
              onClick={() => setShowQueue(q => !q)}
              className={`transition ${showQueue ? 'text-green-500' : 'text-gray-500 hover:text-white'}`}
              title="Queue"
            >
              <ListMusic className="w-5 h-5" />
            </button>
            <button
              onClick={() => setVolume(volume === 0 ? 1 : 0)}
              className="text-gray-400 hover:text-white transition"
              title={volume === 0 ? 'Unmute (M)' : 'Mute (M)'}
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 accent-green-500"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      </div>
    </>
  );
}
