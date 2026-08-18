import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, FileText, Trash2, Plus } from 'lucide-react';

export const MediaUploader = ({
  images,
  setImages,
  videos,
  setVideos,
  documents,
  setDocuments
}) => {
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages([...images, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDocumentUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const newDoc = {
          id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3),
          name: file.name,
          url: typeof reader.result === 'string' ? reader.result : '#',
          type: file.type || 'application/octet-stream',
          size: file.size
        };
        setDocuments([...documents, newDoc]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  const addVideoUrl = () => {
    const url = prompt('Enter video URL (YouTube, Vimeo, or MP4 link):');
    if (url && url.trim()) {
      setVideos([...videos, url.trim()]);
    }
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Photo / Image Upload Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            Item Photos ({images.length})
          </label>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Image
          </button>
        </div>

        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          multiple
          className="hidden"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((imgUrl, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
              <img src={imgUrl} alt={`Uploaded ${idx}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-600 bg-slate-50 flex flex-col items-center justify-center p-3 text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <Upload className="w-6 h-6 mb-1 text-slate-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all" />
            <span className="text-[11px] font-semibold text-center">Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Document Attachments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600" />
            Warranties & Manuals ({documents.length})
          </label>
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload Document
          </button>
        </div>

        <input
          type="file"
          ref={docInputRef}
          onChange={handleDocumentUpload}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg"
          multiple
          className="hidden"
        />

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Attached File'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No receipts or warranty PDFs attached yet.</p>
        )}
      </div>

      {/* Video Attachments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <VideoIcon className="w-4 h-4 text-indigo-600" />
            Video Links ({videos.length})
          </label>
          <button
            type="button"
            onClick={addVideoUrl}
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Video URL
          </button>
        </div>

        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((vUrl, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                <span className="truncate text-slate-700 font-mono text-[11px]">{vUrl}</span>
                <button
                  type="button"
                  onClick={() => removeVideo(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
