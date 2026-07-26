import React from 'react';
import { Place } from '../types';

interface FeaturedSpotsProps {
  places: Place[];
  onSelectPlace: (place: Place) => void;
}

export function FeaturedSpots({ places, onSelectPlace }: FeaturedSpotsProps) {
  // Ambil tempat yang ditandai "unggulan" oleh admin
  const topPlaces = places.filter((p) => p.unggulan === true);

  if (topPlaces.length === 0) return null;

  return (
    <section className="py-8">
      <div className="mb-6">
        <span className="text-emerald-600 font-semibold text-sm tracking-wider uppercase">
          Benculuk Spotlight
        </span>
        <h2 className="text-2xl font-bold text-slate-800 mt-1">
          Rekomendasi Tempat Pilihan
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topPlaces.map((place) => (
          <div
            key={place.id}
            onClick={() => onSelectPlace(place)}
            className="cursor-pointer bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100 flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={place.gambarUrl || 'https://via.placeholder.com/600x400?text=Belum+Ada+Foto'}
                alt={place.nama}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                {place.kategori}
              </span>
              {place.rating !== undefined && (
                <span className="absolute top-3 right-3 bg-amber-400 text-slate-900 font-bold text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                  ★ {place.rating}
                </span>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">{place.nama}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  📍 {place.alamat}
                </p>
                <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                  {place.deskripsi}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}