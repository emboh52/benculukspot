import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '../types';
import { InteractiveMap } from './InteractiveMap';
import {
  X,
  MapPin,
  Save,
  Plus,
  Compass,
  Link,
  Phone,
  Clock,
  FileText,
  Image,
  Tag,
  Sparkles,
} from 'lucide-react';

interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (placeData: Omit<Place, 'id'>, id?: string) => void;
  editPlace: Place | null;
}

const DEFAULT_CATEGORIES = [
  'Warung',
  'Sego Tempong',
  'Rujak Soto',
  'Sate',
  'Toko',
  'Tempat Ibadah',
  'Homestay',
  'Wisata',
];

export const PlaceFormModal: React.FC<PlaceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editPlace,
}) => {
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Warung');
  const [customKategori, setCustomKategori] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [alamat, setAlamat] = useState('');
  const [telepon, setTelepon] = useState('');
  const [latitude, setLatitude] = useState<number>(-8.43);
  const [longitude, setLongitude] = useState<number>(114.223);
  const [googlemaps, setGooglemaps] = useState('');
  const [gambarUrl, setGambarUrl] = useState('');
  const [jamBuka, setJamBuka] = useState('08:00 - 21:00 WIB');
  const [fasilitasRaw, setFasilitasRaw] = useState('');
 const [unggulan, setUnggulan] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);

  useEffect(() => {
    if (editPlace) {
      setNama(editPlace.nama);
      if (DEFAULT_CATEGORIES.includes(editPlace.kategori)) {
        setKategori(editPlace.kategori);
        setCustomKategori('');
      } else {
        setKategori('Lainnya');
        setCustomKategori(editPlace.kategori);
      }
      setDeskripsi(editPlace.deskripsi || '');
      setAlamat(editPlace.alamat || '');
      setTelepon(editPlace.telepon || '');
      setLatitude(editPlace.latitude);
      setLongitude(editPlace.longitude);
      setGooglemaps(editPlace.googlemaps || '');
      setGambarUrl(editPlace.gambarUrl || '');
      setJamBuka(editPlace.jamBuka || '');
      setUnggulan(editPlace.unggulan || false);
      setFasilitasRaw(editPlace.fasilitas ? editPlace.fasilitas.join(', ') : '');
    } else {
      // Reset form
      setNama('');
      setKategori('Warung');
      setCustomKategori('');
      setDeskripsi('');
      setAlamat('');
      setTelepon('');
      setLatitude(-8.4300);
      setLongitude(114.2230);
      setGooglemaps('');
      setGambarUrl('');
      setUnggulan(false);
      setJamBuka('08:00 - 21:00 WIB');
      setFasilitasRaw('Parkir, Air Mineral, Halal');
    }
  }, [editPlace, isOpen]);

  if (!isOpen) return null;

  const handleAutoGenerateMaps = () => {
    setGooglemaps(`https://maps.google.com/?q=${latitude},${longitude}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalKategori = kategori === 'Lainnya' ? customKategori || 'Lainnya' : kategori;
    const finalMaps =
      googlemaps.trim() || `https://maps.google.com/?q=${latitude},${longitude}`;

    const fasilitas = fasilitasRaw
      .split(/[,;]/)
      .map((f) => f.trim())
      .filter(Boolean);

    onSubmit(
      {
        nama,
        kategori: finalKategori,
        deskripsi,
        alamat,
        telepon,
        latitude: Number(latitude),
        longitude: Number(longitude),
        googlemaps: finalMaps,
        unggulan: unggulan,
        gambarUrl: gambarUrl.trim() || undefined,
        jamBuka: jamBuka.trim() || undefined,
        fasilitas: fasilitas.length > 0 ? fasilitas : undefined,
        rating: editPlace?.rating || 4.8,
      },
      editPlace?.id
    );

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            {editPlace ? <FileText className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {editPlace ? 'Edit Data Tempat' : 'Tambah Tempat Baru'}
            </h3>
            <p className="text-xs text-slate-500">
              Isi formulir informasi tempat untuk diperbarui di direktori
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Tempat & Kategori */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nama Tempat *
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Warung Sego Tempong Mbak Pur"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kategori *
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Lainnya">Lainnya (Ketik Sendiri)</option>
              </select>
            </div>
          </div>

          {kategori === 'Lainnya' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ketik Kategori Baru
              </label>
              <input
                type="text"
                required
                value={customKategori}
                onChange={(e) => setCustomKategori(e.target.value)}
                placeholder="Contoh: Cafe, Bengkel, Apotek"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          )}

          {/* Alamat & Telepon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Alamat Lengkap *
              </label>
              <input
                type="text"
                required
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                placeholder="Jl. Raya Benculuk, Kec. Cluring..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={telepon}
                onChange={(e) => setTelepon(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deskripsi Singkat Tempat
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Penjelasan keunggulan menu, suasana, atau daya tarik tempat..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Coordinates Section + Map Picker Toggle */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Titik Lokasi (Latitude & Longitude)</span>
              </span>
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1 rounded-lg transition-colors"
              >
                {showMapPicker ? 'Sembunyikan Peta' : 'Pilih di Peta Interaktif'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {showMapPicker && (
              <div className="h-56 w-full rounded-2xl overflow-hidden mt-2 border border-slate-300 shadow-inner">
                <InteractiveMap
                  places={[]}
                  selectedPlace={null}
                  onSelectPlace={() => {}}
                  pickerMode={true}
                  pickerCoords={{ lat: latitude, lng: longitude }}
                  onPickerChange={(c) => {
                    setLatitude(c.lat);
                    setLongitude(c.lng);
                  }}
                />
              </div>
            )}
          </div>

          {/* Google Maps URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tautan Google Maps Asli
              </label>
              <button
                type="button"
                onClick={handleAutoGenerateMaps}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Buat Otomatis dari Koordinat
              </button>
            </div>
            <input
              type="url"
              value={googlemaps}
              onChange={(e) => setGooglemaps(e.target.value)}
              placeholder="https://maps.google.com/?q=-8.43,114.223"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Jam Buka & Gambar URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                value={jamBuka}
                onChange={(e) => setJamBuka(e.target.value)}
                placeholder="08:00 - 21:00 WIB"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL Foto / Thumbnail
              </label>
              <input
                type="url"
                value={gambarUrl}
                onChange={(e) => setGambarUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Fasilitas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Fasilitas (Dipisahkan Koma)
            </label>
            <input
              type="text"
              value={fasilitasRaw}
              onChange={(e) => setFasilitasRaw(e.target.value)}
              placeholder="Parkir Luas, Wi-Fi, Lesehan, Halal"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>
{/* Tampilkan di Rekomendasi Tempat Pilihan */}
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200/80">
            <input
              type="checkbox"
              id="unggulan"
              checked={unggulan}
              onChange={(e) => setUnggulan(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
            <label htmlFor="unggulan" className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Tampilkan di "Rekomendasi Tempat Pilihan" (halaman depan)
            </label>
          </div>
          
          {/* Submit Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Tempat</span>
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
