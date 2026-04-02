import { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { getAudioUrl, getCoverUrl } from '../services/songService';

const PlayerContext = createContext(null);

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const STORAGE_KEY = 'faithtunes_player';

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [shuffledPlaylist, setShuffledPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [coverUrl, setCoverUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'
  const [shuffleMode, setShuffleMode] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Load persisted preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { volume: v, repeatMode: r, shuffleMode: s } = JSON.parse(saved);
        if (v !== undefined) setVolumeState(v);
        if (r) setRepeatMode(r);
        if (s !== undefined) setShuffleMode(s);
      }
    } catch {}
  }, []);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume, repeatMode, shuffleMode }));
    } catch {}
  }, [volume, repeatMode, shuffleMode]);

  const activePlaylist = shuffleMode && shuffledPlaylist.length > 0 ? shuffledPlaylist : playlist;

  // Internal play — does not toggle if same song, just loads
  const loadAndPlay = useCallback(async (song, newPlaylist = null) => {
    setLoading(true);
    setCurrentSong(song);
    setCoverUrl(null);
    setDuration(0);
    setCurrentTime(0);

    if (newPlaylist) {
      setPlaylist(newPlaylist);
      setShuffledPlaylist(shuffleArray(newPlaylist));
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
  }, []);

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
        audio.currentTime = 0;
        audio.play();
        return;
      }
      if (activePlaylist.length > 0) {
        const idx = activePlaylist.findIndex(s => s.id === currentSong?.id);
        const nextIdx = idx + 1;
        if (nextIdx < activePlaylist.length) {
          loadAndPlay(activePlaylist[nextIdx]);
        } else if (repeatMode === 'all') {
          loadAndPlay(activePlaylist[0]);
        } else {
          setIsPlaying(false);
          setCurrentTime(0);
        }
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleError = () => setLoading(false);
    const handleCanPlay = () => setLoading(false);

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
  }, [repeatMode, activePlaylist, currentSong, loadAndPlay]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playSong = useCallback(async (song, songs = []) => {
    if (currentSong?.id === song.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }
    loadAndPlay(song, songs.length > 0 ? songs : null);
  }, [currentSong, isPlaying, loadAndPlay]);

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
    if (!currentSong || activePlaylist.length === 0) return;
    const idx = activePlaylist.findIndex(s => s.id === currentSong.id);
    const nextIdx = (idx + 1) % activePlaylist.length;
    if (nextIdx !== idx) loadAndPlay(activePlaylist[nextIdx]);
  }, [currentSong, activePlaylist, loadAndPlay]);

  const playPrevious = useCallback(() => {
    if (!currentSong) return;
    // Restart if more than 3s in
    if (audioRef.current.currentTime > 3) {
      seek(0);
      return;
    }
    if (activePlaylist.length === 0) return;
    const idx = activePlaylist.findIndex(s => s.id === currentSong.id);
    const prevIdx = idx === 0 ? activePlaylist.length - 1 : idx - 1;
    if (prevIdx !== idx) loadAndPlay(activePlaylist[prevIdx]);
  }, [currentSong, activePlaylist, loadAndPlay, seek]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffleMode(prev => {
      if (!prev && playlist.length > 0) {
        setShuffledPlaylist(shuffleArray(playlist));
      }
      return !prev;
    });
  }, [playlist]);

  const addToQueue = useCallback((song) => {
    setPlaylist(prev => {
      if (prev.some(s => s.id === song.id)) return prev;
      return [...prev, song];
    });
    setShuffledPlaylist(prev => {
      if (prev.some(s => s.id === song.id)) return prev;
      return [...prev, song];
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
    activePlaylist,
    repeatMode,
    shuffleMode,
    showQueue,
    setShowQueue,
    showNowPlaying,
    setShowNowPlaying,
    playSong,
    togglePlay,
    seek,
    setVolume,
    playNext,
    playPrevious,
    toggleRepeat,
    toggleShuffle,
    addToQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
}
