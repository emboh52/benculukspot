import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';

interface ImagePickerProps {
  onSelect: (path: string) => void;
}

function ImagePicker({ onSelect }: ImagePickerProps) {
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadImages = () => {
    fetch('/images/manifest.json')
      .then((res) => res.json())
      .then(setImages);
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Mengompres gambar...');

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });

      const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);

      setMessage('Menyimpan ke folder public...');

      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

      const res = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, dataUrl }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Upload gagal');
      }

      setMessage(`Berhasil! Ukuran akhir: ${result.sizeKB} KB`);
      loadImages(); // refresh grid biar gambar baru langsung muncul
      onSelect(result.path); // langsung pilih gambar yang baru diupload
    } catch (err) {
      setMessage(`Gagal: ${(err as Error).message}`);
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input biar bisa upload file yang sama lagi
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Upload Gambar Baru</label>
        <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      </div>

      {message && (
        <p className={message.startsWith('Gagal') ? 'text-red-600 text-sm' : 'text-gray-600 text-sm'}>
          {message}
        </p>
      )}

      <div className="grid grid-cols-4 gap-2">
        {images.map((file) => (
          <img
            key={file}
            src={`/images/${file}`}
            onClick={() => onSelect(`/images/${file}`)}
            className="cursor-pointer rounded hover:opacity-75"
          />
        ))}
      </div>
    </div>
  );
}

export default ImagePicker;