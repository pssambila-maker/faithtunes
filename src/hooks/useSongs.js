import { useState, useEffect, useMemo } from 'react';
import { getPublishedSongs, searchSongs } from '../services/songService';

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        const data = await getPublishedSongs();
        setSongs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, []);

  const filteredSongs = useMemo(() => {
    return searchSongs(songs, searchTerm);
  }, [songs, searchTerm]);

  return {
    songs: filteredSongs,
    allSongs: songs,
    loading,
    error,
    searchTerm,
    setSearchTerm
  };
}
