import React, { useState } from 'react';
import { Place, ViewMode } from '../types';
import { PlaceCard } from './PlaceCard';
import { InteractiveMap } from './InteractiveMap';
import { getCategoryBadgeStyle } from '../utils/geo';
import {
  Search,
  MapPin,
  Compass,
  LayoutGrid,
  Map as MapIcon,
  Columns,
  Store,
  Sparkles,
  SlidersHorizontal,
  Navigation,
  Check,
} from 'lucide-react';

interface PublicDirectoryProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  userLocation: { lat: number; lng: number } | null;
  onRequestUserLocation: () => void;
}

export const PublicDirectory: React.FC<PublicDirectoryProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  userLocation,
  onRequestUserLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [sortBy, setSortBy] = useState<'nama' | 'rating'>('nama');
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  // Categories extraction
  const categories: string[] = ['Semua', ...(Array.from(new Set(places.map((p) => p.kategori))) as string[])];

  // Filtering & Sorting
  const filteredPlaces = places
    .filter((p) => {
      const matchesSearch =
        p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCat = selectedCategory === 'Semua' || p.kategori === selectedCategory;

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      return a.nama.localeCompare(b.nama);
    });

  return (
    <div className="space-y-6 pb-12">
      {/* Hero Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-emerald-400/10 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 border border-white/20 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Informasi Kuliner DiBenculuk & Sekitarnya</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
            Temukan Pusat Kuliner & Fasilitas Terbaik
          </h2>

          <p className="text-xs sm:text-sm font-bold text-emerald-900 leading-relaxed">
            Menjelajahi keindahan De Djawatan Forest - Banyuwangi rasanya kurang lengkap tanpa menikmati sajian kuliner khas dan menemukan tempat beristirahat yang nyaman di sekitarnya. 
            Berikut adalah kurasi tempat makan lezat dan akomodasi pilihan yang siap menyempurnakan petualanganmu
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={onRequestUserLocation}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                userLocation
                  ? 'bg-emerald-400 text-slate-950 shadow-sm'
                  : 'bg-white/15 hover:bg-white/25 text-white backdrop-blur-md border border-white/20'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{userLocation ? 'Lokasi Saya Aktif' : 'Gunakan Lokasi Saya'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari tempat, makanan, alamat..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
            {/* Sort Option */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="nama">Urutkan: Nama (A-Z)</option>
              <option value="rating">Urutkan: Rating Tertinggi</option>
            </select>

            {/* View Mode Switcher (Split / List / Map) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors hidden sm:flex items-center gap-1 ${
                  viewMode === 'split' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
                title="Tampilan Bersama (Peta & Daftar)"
              >
                <Columns className="w-4 h-4" />
                <span className="text-[11px] font-semibold">Semua</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
                title="Tampilan Daftar Saja"
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="text-[11px] font-semibold sm:hidden">Daftar</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'map' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-500'
                }`}
                title="Tampilan Peta Saja"
              >
                <MapIcon className="w-4 h-4" />
                <span className="text-[11px] font-semibold sm:hidden">Peta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const badgeStyle = getCategoryBadgeStyle(cat);
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Directory Layout Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Container Column */}
        <div
          className={`${
            viewMode === 'list'
              ? 'hidden'
              : viewMode === 'map'
              ? 'lg:col-span-12 h-[650px]'
              : 'lg:col-span-7 h-[550px] lg:h-[650px]'
          } lg:sticky lg:top-20 transition-all duration-300`}
        >
          <InteractiveMap
            places={filteredPlaces}
            selectedPlace={selectedPlace}
            onSelectPlace={onSelectPlace}
            userLocation={userLocation}
          />
        </div>

        {/* List Cards Column */}
        <div
          className={`${
            viewMode === 'map'
              ? 'hidden'
              : viewMode === 'list'
              ? 'lg:col-span-12'
              : 'lg:col-span-5'
          } space-y-4`}
        >
          {/* Header List Summary */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>Menampilkan {filteredPlaces.length} Tempat</span>
            {selectedCategory !== 'Semua' && (
              <button
                onClick={() => setSelectedCategory('Semua')}
                className="text-emerald-600 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          {filteredPlaces.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
              <Store className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Tidak ada tempat ditemukan</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Coba gunakan kata kunci lain atau ubah kategori filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('Semua');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Tampilkan Semua Tempat
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[650px] overflow-y-auto pr-1">
              {filteredPlaces.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isSelected={selectedPlace?.id === place.id}
                  onSelect={onSelectPlace}
                  userLocation={userLocation}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
