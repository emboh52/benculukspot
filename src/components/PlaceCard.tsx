import React from 'react';
import { motion } from 'framer-motion';
import { Place } from '../types';
import { getCategoryBadgeStyle, calculateDistanceKm, formatDistance } from '../utils/geo';
import {
  MapPin,
  Phone,
  ExternalLink,
  Star,
  Clock,
  Compass,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onSelect: (place: Place) => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isSelected,
  onSelect,
  userLocation,
}) => {
  const badgeStyle = getCategoryBadgeStyle(place.kategori);

  const distance = userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, place.latitude, place.longitude)
    : null;

  // Format whatsapp clean phone
  const waPhone = place.telepon.replace(/[^0-9]/g, '');
  const formattedWa = waPhone.startsWith('0') ? '62' + waPhone.slice(1) : waPhone;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -2 }}
      onClick={() => onSelect(place)}
      className={`group relative bg-white rounded-2xl p-4 border transition-all cursor-pointer ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/10'
          : 'border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Photo Image / Placeholder */}
        <div className="relative w-full sm:w-28 h-32 sm:h-28 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
          <img
            src={
              place.gambarUrl ||
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
            }
            alt={place.nama}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80';
            }}
          />
          {distance !== null && (
            <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Compass className="w-2.5 h-2.5 text-emerald-400" />
              <span>{formatDistance(distance)}</span>
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}
              >
                {place.kategori}
              </span>
              {place.rating && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{place.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {place.nama}
            </h3>

            {/* Address */}
            <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5 line-clamp-2 leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <span>{place.alamat}</span>
            </p>

            {/* Jam Buka */}
            {place.jamBuka && (
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{place.jamBuka}</span>
              </p>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              {place.telepon && place.telepon !== '-' && (
                <a
                  href={`https://wa.me/${formattedWa}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 font-medium px-2.5 py-1 rounded-lg transition-colors"
                  title="Hubungi via WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Kontak</span>
                </a>
              )}
            </div>

            <a
              href={place.googlemaps}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
            >
              <span>Petunjuk Maps</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
