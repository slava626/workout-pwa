'use client';

import { useEffect, useRef, useState } from 'react';
import { getMedia, putMedia, deleteMedia, mediaKey } from '@/lib/movementMedia';

interface Props {
  user: string;
  movementName: string;
  media?: string;
}

export default function MovementMedia({ user, movementName, media }: Props) {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [hasUploadedOverride, setHasUploadedOverride] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const key = mediaKey(user, movementName);
  const url = uploadedUrl ?? media ?? null;

  useEffect(() => {
    let cancelled = false;

    getMedia(key)
      .then((blob) => {
        if (cancelled || !blob) return;
        const objUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objUrl;
        setUploadedUrl(objUrl);
        setHasUploadedOverride(true);
      })
      .catch(() => { /* ignore */ });
    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [key]);

  const handleFile = async (file: File) => {
    await putMedia(key, file);
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const objUrl = URL.createObjectURL(file);
    objectUrlRef.current = objUrl;
    setUploadedUrl(objUrl);
    setHasUploadedOverride(true);
  };

  const handleDelete = async () => {
    await deleteMedia(key);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setUploadedUrl(null);
    setHasUploadedOverride(false);
    setModalOpen(false);
  };

  const openPicker = () => fileInputRef.current?.click();

  return (
    <>
      <button
        onClick={() => (url ? setModalOpen(true) : openPicker())}
        className={[
          'w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden transition-colors',
          url ? 'bg-gray-700' : 'bg-gray-800 border border-dashed border-gray-600 active:border-gray-400',
        ].join(' ')}
        aria-label={url ? 'View exercise image' : 'Upload exercise image'}
      >
        {url ? (
          <img src={url} alt={movementName} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7.5A1.5 1.5 0 014.5 6h3l1.5-2h6l1.5 2h3A1.5 1.5 0 0121 7.5v9A1.5 1.5 0 0119.5 18h-15A1.5 1.5 0 013 16.5z" />
            <circle cx="12" cy="12" r="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = '';
        }}
      />

      {modalOpen && url && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-gray-900 rounded-2xl overflow-hidden border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={url} alt={movementName} className="w-full max-h-[70vh] object-contain bg-black" />
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
              <span className="text-white font-semibold truncate pr-2">{movementName}</span>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={openPicker}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm active:bg-gray-600"
                >
                  Replace
                </button>
                {hasUploadedOverride && (
                  <button
                    onClick={handleDelete}
                    className="px-3 py-2 rounded-lg bg-red-600/80 text-white text-sm active:bg-red-600"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-lg bg-gray-700 text-white text-sm active:bg-gray-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
