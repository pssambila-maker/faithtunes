import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { getAudioUrl, getCoverUrl } from '../services/songService';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [coverUrl, setCoverUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'

  // Setup audio event listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (repeatMode === 'one') {
        // Repeat the same song
        audio.currentTime = 0;
        audio.play();
      } else if (repeatMode === 'all' && playlist.length > 0) {
        // Play next song, loop back to first when at end
        const currentIndex = playlist.findIndex(s => s.id === currentSong?.id);
        const nextIndex = (currentIndex + 1) % playlist.length;
        if (playlist[nextIndex]) {
          playSong(playlist[nextIndex], playlist);
        }
      } else {
        // No repeat - stop at end or play next if available
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleError = (e) => {
      console.error('Audio error:', e);
      setLoading(false);
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [repeatMode, playlist, currentSong]);

  // Handle volume changes
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playSong = useCallback(async (song, songs = []) => {
    if (currentSong?.id === song.id) {
      togglePlay();
      return;
    }

    setLoading(true);
    setCurrentSong(song);
    setCoverUrl(null);

    if (songs.length > 0) {
      setPlaylist(songs);
    }

    try {
      const audioUrl = await getAudioUrl(song.storagePath);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);

      if (song.coverPath) {
        const cover = await getCoverUrl(song.coverPath);
        setCoverUrl(cover);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      setLoading(false);
    }
  }, [currentSong]);

  const togglePlay = useCallback(() => {
    if (!currentSong) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentSong]);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  }, []);

  const setVolume = useCallback((level) => {
    setVolumeState(level);
    audioRef.current.volume = level;
  }, []);

  const playNext = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    if (nextIndex !== currentIndex) {
      playSong(playlist[nextIndex], playlist);
    }
  }, [currentSong, playlist, playSong]);

  const playPrevious = useCallback(() => {
    if (!currentSong || playlist.length === 0) return;

    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    if (prevIndex !== currentIndex) {
      playSong(playlist[prevIndex], playlist);
    }
  }, [currentSong, playlist, playSong]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const value = {
    currentSong,
    isPlaying,
    duration,
    currentTime,
    volume,
    coverUrl,
    loading,
    playlist,
    repeatMode,
    playSong,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrevious,
    toggleRepeat
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
}
