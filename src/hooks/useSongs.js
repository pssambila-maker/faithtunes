import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPublishedSongsPaginated, searchSongs } from '../services/songService';

export function useSongs() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchSongs() {
      try {
        setLoading(true);
        const result = await getPublishedSongsPaginated(null);
        setSongs(result.songs);
        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore);
        setTotalCount(result.totalCount);
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

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const result = await getPublishedSongsPaginated(lastDoc);
      setSongs(prev => [...prev, ...result.songs]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      console.error('Error loading more songs:', err);
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [lastDoc, hasMore, loadingMore]);

  const filteredSongs = useMemo(() => {
    return searchSongs(songs, searchTerm);
  }, [songs, searchTerm]);

  return {
    songs: filteredSongs,
    allSongs: songs,
    loading,
    loadingMore,
    error,
    searchTerm,
    setSearchTerm,
    hasMore,
    loadMore,
    totalCount
  };
}
