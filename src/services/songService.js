import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const songsRef = collection(db, 'songs');
const PAGE_SIZE = 50;

export async function getPublishedSongs() {
  // Fetch all songs and filter client-side for debugging
  const snapshot = await getDocs(songsRef);
  const allSongs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Filter for published songs (handles both boolean and string)
  const songs = allSongs.filter(song =>
    song.published === true || song.published === 'true'
  );

  // Sort client-side by title
  return songs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
}

export async function getPublishedSongsPaginated(lastDoc = null) {
  // Fetch songs with pagination
  const snapshot = await getDocs(songsRef);
  const allSongs = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
    _doc: docSnap // Keep reference for pagination
  }));

  // Filter for published songs
  const publishedSongs = allSongs.filter(song =>
    song.published === true || song.published === 'true'
  );

  // Sort by title
  publishedSongs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));

  // Find starting index based on lastDoc
  let startIndex = 0;
  if (lastDoc) {
    const lastIndex = publishedSongs.findIndex(s => s.id === lastDoc);
    startIndex = lastIndex + 1;
  }

  // Get page of songs
  const pageSongs = publishedSongs.slice(startIndex, startIndex + PAGE_SIZE);
  const hasMore = startIndex + PAGE_SIZE < publishedSongs.length;

  // Remove _doc reference before returning
  const cleanSongs = pageSongs.map(({ _doc, ...song }) => song);

  return {
    songs: cleanSongs,
    lastDoc: pageSongs.length > 0 ? pageSongs[pageSongs.length - 1].id : null,
    hasMore,
    totalCount: publishedSongs.length
  };
}

export async function getSongById(songId) {
  const docRef = doc(db, 'songs', songId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    throw new Error('Song not found');
  }

  return { id: snapshot.id, ...snapshot.data() };
}

export async function getAudioUrl(storagePath) {
  const audioRef = ref(storage, storagePath);
  return getDownloadURL(audioRef);
}

export async function getCoverUrl(coverPath) {
  if (!coverPath) return null;
  try {
    const coverRef = ref(storage, coverPath);
    return await getDownloadURL(coverRef);
  } catch (error) {
    console.error('Error getting cover URL:', error);
    return null;
  }
}

export function searchSongs(songs, searchTerm) {
  const term = searchTerm.toLowerCase().trim();

  if (!term) return songs;

  return songs.filter(song => {
    const titleMatch = song.title?.toLowerCase().includes(term);
    const artistMatch = song.artist?.toLowerCase().includes(term);
    const tagMatch = song.tags?.some(tag => tag.toLowerCase().includes(term));
    const scriptureMatch = song.scriptureRefs?.some(ref =>
      ref.toLowerCase().includes(term)
    );

    return titleMatch || artistMatch || tagMatch || scriptureMatch;
  });
}

// Admin functions for song management
export async function getAllSongsAdmin() {
  const snapshot = await getDocs(songsRef);
  const songs = snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
  return songs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
}

export async function addSong(songData) {
  const newSong = {
    ...songData,
    tags: songData.tags || [],
    scriptureRefs: songData.scriptureRefs || [],
    published: songData.published ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(songsRef, newSong);
  return { id: docRef.id, ...newSong };
}

export async function updateSong(songId, songData) {
  const docRef = doc(db, 'songs', songId);
  const updateData = {
    ...songData,
    updatedAt: serverTimestamp()
  };

  await updateDoc(docRef, updateData);
  return { id: songId, ...updateData };
}

export async function deleteSong(songId) {
  const docRef = doc(db, 'songs', songId);
  await deleteDoc(docRef);
  return songId;
}
