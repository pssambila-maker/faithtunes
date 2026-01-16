import SongCard from './SongCard';
import { usePlayer } from '../../contexts/PlayerContext';

export default function SongList({ songs, emptyMessage }) {
  const { currentSong, isPlaying, playSong } = usePlayer();

  const handlePlay = (song) => {
    playSong(song, songs);
  };

  if (songs.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <p>{emptyMessage || 'No songs found'}</p>
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
        />
      ))}
    </div>
  );
}
