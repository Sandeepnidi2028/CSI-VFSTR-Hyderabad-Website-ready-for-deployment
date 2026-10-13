import React, { useState, useEffect } from 'react';
import { galleryService } from '../../services/api';
import { GalleryAlbum } from '../../types';
import {
  Images,
  Plus,
  Trash2,
  Upload,
  X,
  Calendar,
  Sparkles,
  Eye
} from 'lucide-react';
import { getImageUrl, FALLBACK_EVENT_IMAGE } from '../../utils/imageUrl';

export const AdminGallery: React.FC = () => {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    eventName: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [imageFiles, setImageFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Album Detail / Manage Photos Modal
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null);
  const [addMoreFiles, setAddMoreFiles] = useState<FileList | null>(null);
  const [uploadingMore, setUploadingMore] = useState(false);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const data = await galleryService.getAll();
      setAlbums(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    setSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('eventName', formData.eventName);
    data.append('date', formData.date);
    data.append('description', formData.description);

    if (imageFiles) {
      for (let i = 0; i < imageFiles.length; i++) {
        data.append('images', imageFiles[i]);
      }
    }

    try {
      await galleryService.create(data);
      setIsModalOpen(false);
      setFormData({
        title: '',
        eventName: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setImageFiles(null);
      fetchAlbums();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to create album.';
      alert(`Failed to create album: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlbum = async (id: string, title: string) => {
    if (confirm(`Delete album "${title}" and all its photos?`)) {
      try {
        await galleryService.deleteAlbum(id);
        fetchAlbums();
        if (selectedAlbum?.id === id) setSelectedAlbum(null);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete album.';
        alert(`Failed to delete album: ${msg}`);
      }
    }
  };

  const handleDeletePhoto = async (albumId: string, imageId: string) => {
    if (confirm('Delete this photo?')) {
      try {
        const updated = await galleryService.deleteImage(albumId, imageId);
        setSelectedAlbum(updated);
        fetchAlbums();
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message || 'Failed to delete image.';
        alert(`Failed to delete image: ${msg}`);
      }
    }
  };

  const handleAddMorePhotos = async () => {
    if (!selectedAlbum || !addMoreFiles || addMoreFiles.length === 0) return;

    setUploadingMore(true);
    const data = new FormData();
    for (let i = 0; i < addMoreFiles.length; i++) {
      data.append('images', addMoreFiles[i]);
    }

    try {
      const updated = await galleryService.addImages(selectedAlbum.id, data);
      setSelectedAlbum(updated);
      setAddMoreFiles(null);
      fetchAlbums();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload photos.';
      alert(`Failed to upload photos: ${msg}`);
    } finally {
      setUploadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900">
            Gallery Albums & Photos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize photo albums for hackathons, workshops, and chapter orientations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Album</span>
        </button>
      </div>

      {/* Album Cards Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading albums...</div>
        ) : albums.length === 0 ? (
          <div className="p-12 text-center">
            <Images className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Albums Created Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Create an album to upload and categorize photos from your chapter events.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
            >
              + Create First Album
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div
                key={album.id}
                className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/90 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-video bg-navy-900 overflow-hidden">
                  {album.coverImage ? (
                    <img
                      src={getImageUrl(album.coverImage)}
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      No cover image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white font-bold text-[10px]">
                    {album.images?.length || 0} Photos
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900 line-clamp-1 mb-1">
                      {album.title}
                    </h3>
                    <p className="text-xs text-slate-500 mb-2">
                      {[album.eventName, album.date].filter(Boolean).join(' • ')}
                    </p>
                    {album.description && (
                      <p className="text-xs text-slate-600 line-clamp-2">{album.description}</p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedAlbum(album)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage Photos</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAlbum(album.id, album.title)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete Album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL: Create Album --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-lg text-slate-900">Create Photo Album</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Album Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Hackathon 2026 / Orientation Day"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Event</label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="e.g. CodeForge 2026"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of memories or activities in this album..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Upload Photos (Multiple)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif,.HEIC,.HEIF"
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imageFiles && imageFiles.length > 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">
                    ✓ {imageFiles.length} photo{imageFiles.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating Album...' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Manage Album Photos --- */}
      {selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-display font-bold text-lg text-slate-900">
                  {selectedAlbum.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAlbum.images?.length || 0} Photos in album
                </p>
              </div>
              <button
                onClick={() => setSelectedAlbum(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add More Photos Upload Bar */}
            <div className="py-4 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif,.HEIC,.HEIF"
                  onChange={(e) => setAddMoreFiles(e.target.files)}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {addMoreFiles && addMoreFiles.length > 0 && (
                  <p className="text-[11px] text-emerald-600 font-medium mt-1">
                    ✓ {addMoreFiles.length} photo{addMoreFiles.length > 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
              <button
                onClick={handleAddMorePhotos}
                disabled={!addMoreFiles || addMoreFiles.length === 0 || uploadingMore}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 shrink-0 flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {uploadingMore ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading {addMoreFiles ? `${addMoreFiles.length} Photos...` : '...'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload {addMoreFiles && addMoreFiles.length > 0 ? `${addMoreFiles.length} Photos` : 'Photos'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Photos Grid */}
            <div className="flex-1 overflow-y-auto py-4">
              {!selectedAlbum.images || selectedAlbum.images.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No photos in this album yet. Use the upload bar above to add images.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {selectedAlbum.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative rounded-xl overflow-hidden aspect-square bg-slate-100 group border border-slate-200"
                    >
                      <img
                        src={getImageUrl(img.url)}
                        alt={img.title || 'Photo'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = FALLBACK_EVENT_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleDeletePhoto(selectedAlbum.id, img.id)}
                          className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors"
                          title="Delete photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
