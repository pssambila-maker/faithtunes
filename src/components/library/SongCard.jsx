import { useState, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { getCoverUrl } from '../../services/songService';
import FavoriteButton from '../favorites/FavoriteButton';

export default function SongCard({ song, onPlay, isPlaying, isCurrentSong }) {
  const [coverUrl, setCoverUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (song.coverPath) {
      setImageLoading(true);
      getCoverUrl(song.coverPath)
        .then((url) => {
          setCoverUrl(url);
          setImageLoading(false);
        })
        .catch(() => {
          setImageLoading(false);
        });
    } else {
      setImageLoading(false);
    }
  }, [song.coverPath]);

  const handlePlay = (e) => {
    e.stopPropagation();
    onPlay(song);
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition cursor-pointer group ${
        isCurrentSong ? 'ring-2 ring-green-500' : ''
      }`}
      onClick={() => onPlay(song)}
    >
      {/* Cover Art */}
      <div className="relative aspect-square mb-4 rounded overflow-hidden bg-gray-700">
        {imageLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-green-500 rounded-full animate-spin" />
          </div>
        ) : coverUrl ? (
          <img
            src={coverUrl}
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
            <span className="text-5xl">🎵</span>
          </div>
        )}

        {/* Play button overlay */}
        <button
          className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:bg-green-400 transition ${
            isCurrentSong ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={handlePlay}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="w-6 h-6 text-black fill-black" />
          ) : (
            <Play className="w-6 h-6 text-black fill-black ml-1" />
          )}
        </button>
      </div>

      {/* Song Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold truncate ${isCurrentSong ? 'text-green-500' : 'text-white'}`}>
            {song.title}
          </h3>
          <p className="text-gray-400 text-sm truncate">{song.artist}</p>
        </div>
        <FavoriteButton songId={song.id} size="small" />
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
  );
}
