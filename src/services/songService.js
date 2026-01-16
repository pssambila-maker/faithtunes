import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

const songsRef = collection(db, 'songs');

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
