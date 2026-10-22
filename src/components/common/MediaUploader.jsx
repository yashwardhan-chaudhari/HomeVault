import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, FileText, Trash2, Plus, AlertCircle, RefreshCw } from 'lucide-react';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_EXTENSIONS = ['.pdf', '.txt', '.png', '.jpg', '.jpeg'];

export const MediaUploader = ({
  images = [],
  setImages,
  videos = [],
  setVideos,
  documents = [],
  setDocuments
}) => {
  const imageInputRef = useRef(null);
  const replaceInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [replacingIndex, setReplacingIndex] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const clearErrorAfterDelay = () => {
    setTimeout(() => setErrorMessage(''), 5000);
  };

  const handleImageUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setErrorMessage('');

    const newImages = [...images];
    let hadError = false;

    Array.from(files).forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setErrorMessage(`"${file.name}" is not a supported format. Please upload JPEG, PNG, or WebP.`);
        hadError = true;
        return;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setErrorMessage(`"${file.name}" exceeds the 5MB size limit.`);
        hadError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          if (replacingIndex !== null) {
            newImages[replacingIndex] = reader.result;
            setReplacingIndex(null);
            setImages([...newImages]);
          } else {
            setImages([...newImages, reader.result]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (hadError) clearErrorAfterDelay();
    e.target.value = '';
  };

  const handleDocumentUpload = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setErrorMessage('');

    let hadError = false;
    const newDocs = [...documents];

    Array.from(files).forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_DOC_EXTENSIONS.includes(ext) && !file.type.startsWith('image/')) {
        setErrorMessage(`"${file.name}" has an unsupported format. Allowed: PDF, JPG, PNG, TXT.`);
        hadError = true;
        return;
      }

      if (file.size > MAX_DOC_SIZE_BYTES) {
        setErrorMessage(`"${file.name}" exceeds the 10MB document size limit.`);
        hadError = true;
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
        const newDoc = {
          id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          name: safeName,
          url: typeof reader.result === 'string' ? reader.result : '#',
          type: file.type || 'application/octet-stream',
          size: file.size
        };
        newDocs.push(newDoc);
        setDocuments([...newDocs]);
      };
      reader.readAsDataURL(file);
    });

    if (hadError) clearErrorAfterDelay();
    e.target.value = '';
  };

  const triggerReplace = (index) => {
    setReplacingIndex(index);
    replaceInputRef.current?.click();
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
      const trimmed = url.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        setErrorMessage('Video link must start with https://');
        clearErrorAfterDelay();
        return;
      }
      setVideos([...videos, trimmed]);
    }
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden inputs */}
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleImageUpload}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />
      <input
        type="file"
        ref={docInputRef}
        onChange={handleDocumentUpload}
        accept=".pdf,.txt,.png,.jpg,.jpeg"
        multiple
        className="hidden"
      />

      {/* Photo / Image Upload Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Item Photos ({images.length})
            <span className="text-[10px] text-slate-400 font-normal lowercase">(Max 5MB each, JPEG/PNG/WebP)</span>
          </label>
          <button
            type="button"
            onClick={() => {
              setReplacingIndex(null);
              imageInputRef.current?.click();
            }}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Photo
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((imgUrl, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm">
              <img src={imgUrl} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  title="Replace image"
                  onClick={() => triggerReplace(idx)}
                  className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 shadow-md transition-transform hover:scale-110"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Remove image"
                  onClick={() => removeImage(idx)}
                  className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-transform hover:scale-110"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              setReplacingIndex(null);
              imageInputRef.current?.click();
            }}
            className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-600 dark:hover:border-indigo-400 bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-3 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors group"
          >
            <Upload className="w-6 h-6 mb-1 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
            <span className="text-[11px] font-semibold text-center">Upload Photo</span>
          </button>
        </div>
      </div>

      {/* Document Attachments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Warranties & Manuals ({documents.length})
            <span className="text-[10px] text-slate-400 font-normal lowercase">(Max 10MB PDF/TXT/Images)</span>
          </label>
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {documents.length > 0 ? (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-850 transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-500">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : 'Attached File'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
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
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <VideoIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Video Links ({videos.length})
          </label>
          <button
            type="button"
            onClick={addVideoUrl}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Video Link
          </button>
        </div>

        {videos.length > 0 && (
          <div className="space-y-2">
            {videos.map((vUrl, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs">
                <span className="truncate text-slate-700 dark:text-slate-300 font-mono text-[11px]">{vUrl}</span>
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
