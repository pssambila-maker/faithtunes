import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAllSongsAdmin, addSong, updateSong, deleteSong } from '../services/songService';
import Loader from '../components/ui/Loader';
import toast from 'react-hot-toast';
import { Shield, Plus, Edit2, Trash2, Save, X, Music, RefreshCw } from 'lucide-react';

const ADMIN_UIDS = [
  'tGI50dxIhJQmFbsqucuJJb8FenG3', // eus.java@gmail.com
  'xTye4MLVkOUOy7Cb98mnjwXInGP2'  // pssambila@gmail.com
];

const emptySong = {
  title: '',
  artist: '',
  tags: '',
  scriptureRefs: '',
  storagePath: '',
  coverPath: '',
  published: true
};

export default function AdminPage() {
  const { user } = useAuth();
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [formData, setFormData] = useState(emptySong);
  const [showForm, setShowForm] = useState(false);

  const isAdmin = ADMIN_UIDS.includes(user?.uid);

  useEffect(() => {
    if (isAdmin) {
      fetchSongs();
    }
  }, [isAdmin]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await getAllSongsAdmin();
      setSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
      toast.error('Failed to load songs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.artist || !formData.storagePath) {
      toast.error('Please fill in required fields');
      return;
    }

    setSaving(true);

    try {
      const songData = {
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        scriptureRefs: formData.scriptureRefs ? formData.scriptureRefs.split(',').map(s => s.trim()).filter(Boolean) : [],
        storagePath: formData.storagePath.trim(),
        coverPath: formData.coverPath.trim(),
        published: formData.published
      };

      if (editingSong) {
        await updateSong(editingSong.id, songData);
        toast.success('Song updated successfully');
      } else {
        await addSong(songData);
        toast.success('Song added successfully');
      }

      setFormData(emptySong);
      setEditingSong(null);
      setShowForm(false);
      fetchSongs();
    } catch (error) {
      console.error('Error saving song:', error);
      toast.error('Failed to save song');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (song) => {
    setEditingSong(song);
    setFormData({
      title: song.title || '',
      artist: song.artist || '',
      tags: Array.isArray(song.tags) ? song.tags.join(', ') : '',
      scriptureRefs: Array.isArray(song.scriptureRefs) ? song.scriptureRefs.join(', ') : '',
      storagePath: song.storagePath || '',
      coverPath: song.coverPath || '',
      published: song.published ?? true
    });
    setShowForm(true);
  };

  const handleDelete = async (song) => {
    if (!window.confirm(`Are you sure you want to delete "${song.title}"?`)) {
      return;
    }

    try {
      await deleteSong(song.id);
      toast.success('Song deleted successfully');
      fetchSongs();
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('Failed to delete song');
    }
  };

  const handleCancel = () => {
    setFormData(emptySong);
    setEditingSong(null);
    setShowForm(false);
  };

  const handleAddNew = () => {
    setFormData(emptySong);
    setEditingSong(null);
    setShowForm(true);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader size="large" text="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pb-32">
      {/* Header */}
      <header className="sticky top-16 bg-gray-900/95 backdrop-blur-sm z-10 px-6 py-4 border-b border-gray-800">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-gray-400 text-sm">{songs.length} songs in database</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchSongs}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-full transition"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-full transition"
              >
                <Plus className="w-5 h-5" />
                Add Song
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-6 py-6">
        <div className="max-w-screen-xl mx-auto">
          {/* Add/Edit Form */}
          {showForm && (
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">
                {editingSong ? 'Edit Song' : 'Add New Song'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Song title"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Artist *</label>
                    <input
                      type="text"
                      name="artist"
                      value={formData.artist}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Artist name"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Storage Path *</label>
                    <input
                      type="text"
                      name="storagePath"
                      value={formData.storagePath}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="songs/filename.mp3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Cover Path</label>
                    <input
                      type="text"
                      name="coverPath"
                      value={formData.coverPath}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="covers/filename.png"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Tags (comma-separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="worship, praise, gospel"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Scripture Refs (comma-separated)</label>
                    <input
                      type="text"
                      name="scriptureRefs"
                      value={formData.scriptureRefs}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Psalm 23:1, John 3:16"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="published"
                    id="published"
                    checked={formData.published}
                    onChange={handleInputChange}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-green-500 focus:ring-green-500"
                  />
                  <label htmlFor="published" className="text-gray-300">Published (visible to users)</label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 text-black font-semibold px-6 py-2 rounded-full transition"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-black rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editingSong ? 'Update Song' : 'Add Song'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full transition"
                  >
                    <X className="w-5 h-5" />
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Songs List */}
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">All Songs</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {songs.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400">
                  <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No songs in database. Add your first song!</p>
                </div>
              ) : (
                songs.map(song => (
                  <div key={song.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-700/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium truncate">{song.title}</h3>
                        {!song.published && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">Draft</span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                      <p className="text-gray-500 text-xs truncate mt-1">{song.storagePath}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(song)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(song)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-600 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
