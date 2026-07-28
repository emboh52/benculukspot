import React, { useState, useRef } from 'react';
import { Place } from '../types';
import { getCategoryBadgeStyle } from '../utils/geo';
import { parseCsvFile } from '../utils/csv';
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Download,
  RotateCcw,
  Search,
  ExternalLink,
  MapPin,
  Phone,
  
  CheckCircle2,
  AlertTriangle,
  Store,
  Compass,
  Eye,
} from 'lucide-react';

interface AdminDashboardProps {
  places: Place[];
  onAddPlace: () => void;
  onEditPlace: (place: Place) => void;
  onDeletePlace: (id: string) => void;
  onImportCsvPlaces: (imported: Place[]) => void;
  onExportCsv: () => void;
  onResetData: () => void;
  onPreviewPlace: (place: Place) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  places,
  onAddPlace,
  onEditPlace,
  onDeletePlace,
  onImportCsvPlaces,
  onExportCsv,
  onResetData,
  onPreviewPlace,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categories list
  const categories: string[] = ['Semua', ...(Array.from(new Set(places.map((p) => p.kategori))) as string[])];

  // Filtered places
  const filteredPlaces = places.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.kategori.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'Semua' || p.kategori === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Handle CSV Import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = await parseCsvFile(file);
      if (parsed.length > 0) {
        onImportCsvPlaces(parsed);
        setImportStatus(`Berhasil mengimpor ${parsed.length} data tempat dari file CSV.`);
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        alert('File CSV tidak berisi data tempat yang valid.');
      }
    } catch (err) {
      alert('Gagal membaca file CSV. Pastikan format kolom sesuai.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl rounded-full" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2">
              
              <span>Panel Kontrol Admin</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Dashboard Manajemen Tempat (CRUD)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Tambah, perbarui, hapus, dan kelola data direktori tempat di wilayah Benculuk &
              sekitarnya secara langsung dan real-time.
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onAddPlace}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tempat Baru</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-xs py-2.5 px-3.5 rounded-xl border border-white/20 flex items-center gap-1.5 transition-colors"
              title="Upload file CSV data tempat"
            >
              <Upload className="w-4 h-4" />
              <span>Impor CSV</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Tempat
            </span>
            <span className="text-xl font-black text-white">{places.length}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Kategori Aktif
            </span>
            <span className="text-xl font-black text-emerald-400">
              {new Set(places.map((p) => p.kategori)).size}
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Koordinat Valid
            </span>
            <span className="text-xl font-black text-teal-300">
              {places.filter((p) => p.latitude && p.longitude).length}
            </span>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Status Sinkronisasi
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersimpan Lokal
            </span>
          </div>
        </div>
      </div>

      {/* Import Status Toast Alert */}
      {importStatus && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-medium">{importStatus}</span>
          </div>
        </div>
      )}

      {/* Table Filter & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama, alamat, atau kategori..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'Semua' ? 'Semua Kategori' : cat}
              </option>
            ))}
          </select>

          <button
            onClick={onResetData}
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Kembalikan data sampel bawaan Benculuk"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Table Data Places */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Foto</th>
                <th className="py-3.5 px-4">Nama & Kategori</th>
                <th className="py-3.5 px-4">Alamat & Kontak</th>
                <th className="py-3.5 px-4">Koordinat</th>
                <th className="py-3.5 px-4">Maps</th>
                <th className="py-3.5 px-4 text-right">Aksi Kelola</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Store className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>Tidak ada data tempat yang cocok dengan pencarian.</span>
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => {
                  const badgeStyle = getCategoryBadgeStyle(place.kategori);
                  return (
                    <tr key={place.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Photo Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                          <img
                            src={
                              place.gambarUrl ||
                              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=200&q=80'
                            }
                            alt={place.nama}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=200&q=80';
                            }}
                          />
                        </div>
                      </td>

                      {/* Name & Category */}
                      <td className="py-3 px-4 max-w-[220px]">
                        <div className="font-bold text-slate-900 line-clamp-1">{place.nama}</div>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}
                        >
                          {place.kategori}
                        </span>
                      </td>

                      {/* Address & Phone */}
                      <td className="py-3 px-4 max-w-[260px]">
                        <div className="text-slate-700 line-clamp-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span>{place.alamat}</span>
                        </div>
                        <div className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{place.telepon || '-'}</span>
                        </div>
                      </td>

                      {/* Coordinates */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                      </td>

                      {/* Maps Button */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <a
                          href={place.googlemaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg font-medium text-[11px]"
                        >
                          <span>Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>

                      {/* Action Buttons (Edit, Delete, View) */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onPreviewPlace(place)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Pratinjau Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onEditPlace(place)}
                            className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Data Place"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(place.id)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Place"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Konfirmasi Hapus Data</h3>
            <p className="text-xs text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus data tempat ini dari direktori? Perubahan ini akan
              langsung disimpan.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeletePlace(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                Hapus Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
