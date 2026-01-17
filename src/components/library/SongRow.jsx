import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import SongCard from './SongCard';
import { usePlayer } from '../../contexts/PlayerContext';

export default function SongRow({ title, songs, showAll, onShowAll }) {
  const scrollRef = useRef(null);
  const { currentSong, isPlaying, playSong } = usePlayer();

  const handlePlay = (song) => {
    playSong(song, songs);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (songs.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {showAll && onShowAll && (
          <button
            onClick={onShowAll}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Show all
          </button>
        )}
      </div>

      <div className="relative group">
        {/* Left scroll button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -ml-4"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Scrollable row */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {songs.map((song) => (
            <div key={song.id} className="flex-shrink-0 w-44">
              <SongCard
                song={song}
                onPlay={handlePlay}
                isPlaying={isPlaying}
                isCurrentSong={currentSong?.id === song.id}
              />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-4"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
