import { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // sesuaikan path ke config Firebase kamu

interface ImagePickerProps {
  onSelect: (path: string) => void;
}

// Isi dua nilai ini setelah daftar di cloudinary.com
// (Settings -> Upload -> Upload presets -> Add upload preset, Signing Mode: Unsigned)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'GANTI_CLOUD_NAME';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'GANTI_UPLOAD_PRESET';

interface GalleryImage {
  id: string;
  url: string;
}

function ImagePicker({ onSelect }: ImagePickerProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Ambil riwayat gambar yang pernah diupload, realtime dari Firestore
  useEffect(() => {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((d) => ({
        id: d.id,
        url: d.data().url as string,
      }));
      setImages(data);
    });
    return () => unsub();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (CLOUDINARY_CLOUD_NAME === 'GANTI_CLOUD_NAME') {
      setMessage('Gagal: Cloudinary belum disetel. Isi VITE_CLOUDINARY_CLOUD_NAME & VITE_CLOUDINARY_UPLOAD_PRESET di file .env');
      return;
    }

    setUploading(true);
    setMessage('Mengompres gambar...');

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });

      setMessage('Mengupload ke Cloudinary...');

      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error?.message || 'Upload ke Cloudinary gagal');
      }

      const secureUrl: string = result.secure_url;

      // Catat ke Firestore biar muncul di grid riwayat gambar
      await addDoc(collection(db, 'gallery'), {
        url: secureUrl,
        createdAt: serverTimestamp(),
      });

      setMessage(`Berhasil! Ukuran akhir: ${Math.round(compressedFile.size / 1024)} KB`);
      onSelect(secureUrl); // langsung pilih gambar yang baru diupload
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
        {images.map((img) => (
          <img
            key={img.id}
            src={img.url}
            onClick={() => onSelect(img.url)}
            className="cursor-pointer rounded hover:opacity-75 aspect-square object-cover"
          />
        ))}
      </div>
    </div>
  );
}

export default ImagePicker;