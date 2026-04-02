import { useEffect } from 'react';
import { usePlayer } from '../contexts/PlayerContext';

export function useKeyboardShortcuts() {
  const { currentSong, togglePlay, seek, currentTime, duration, setVolume, volume, playNext, playPrevious } = usePlayer();

  useEffect(() => {
    const handler = (e) => {
      // Don't fire when typing in an input/textarea
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (currentSong) togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentSong) seek(Math.min(currentTime + 5, duration));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentSong) seek(Math.max(currentTime - 5, 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(volume + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(volume - 0.1, 0));
          break;
        case 'n':
        case 'N':
          if (currentSong) playNext();
          break;
        case 'p':
        case 'P':
          if (currentSong) playPrevious();
          break;
        case 'm':
        case 'M':
          setVolume(volume === 0 ? 1 : 0);
          break;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [currentSong, togglePlay, seek, currentTime, duration, setVolume, volume, playNext, playPrevious]);
}
