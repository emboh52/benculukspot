import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place } from '../types';
import { getCategoryBadgeStyle, calculateDistanceKm, formatDistance } from '../utils/geo';
import {
  X,
  MapPin,
  Phone,
  ExternalLink,
  Clock,
  Star,
  CheckCircle2,
  Navigation,
  MessageCircle,
  Share2,
} from 'lucide-react';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  userLocation?: { lat: number; lng: number } | null;
}

export const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({
  place,
  onClose,
  userLocation,
}) => {
  const badgeStyle = place ? getCategoryBadgeStyle(place.kategori) : { bg: '', text: '', border: '' };

  const distance = place && userLocation
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, place.latitude, place.longitude)
    : null;

  const waPhone = place ? place.telepon.replace(/[^0-9]/g, '') : '';
  const formattedWa = waPhone.startsWith('0') ? '62' + waPhone.slice(1) : waPhone;

  const handleShare = () => {
    if (!place) return;
    if (navigator.share) {
      navigator.share({
        title: place.nama,
        text: `${place.nama} - ${place.alamat}`,
        url: place.googlemaps,
      });
    } else {
      navigator.clipboard.writeText(`${place.nama}\n${place.alamat}\n${place.googlemaps}`);
      alert('Tautan tempat berhasil disalin ke clipboard!');
    }
  };

  return (
    <AnimatePresence>
      {place && (
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
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner Image */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-100">
          <img
            src={
              place.gambarUrl ||
              'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'
            }
            alt={place.nama}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

          {/* Close & Share Buttons */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white transition-colors"
              title="Bagikan Tempat"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Badge & Title on Banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text} border ${badgeStyle.border}`}
              >
                {place.kategori}
              </span>
              {distance !== null && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white">
                  Jarak {formatDistance(distance)}
                </span>
              )}
              {place.rating && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  {place.rating.toFixed(1)}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
              {place.nama}
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Deskripsi */}
          {place.deskripsi && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Deskripsi & Informasi
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {place.deskripsi}
              </p>
            </div>
          )}

          {/* Alamat & Jam Buka */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Alamat Lengkap</span>
              </div>
              <p className="text-xs text-slate-800 leading-normal">{place.alamat}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Jam Operasional</span>
              </div>
              <p className="text-xs text-slate-800 font-semibold">
                {place.jamBuka || 'Setiap Hari (08:00 - 21:00 WIB)'}
              </p>
            </div>
          </div>

          {/* Telepon / Whatsapp */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Telepon / WhatsApp</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">{place.telepon || '-'}</p>
            </div>

            {place.telepon && place.telepon !== '-' && (
              <a
                href={`https://wa.me/${formattedWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat WA</span>
              </a>
            )}
          </div>

          {/* Fasilitas Tag Pills */}
          {place.fasilitas && place.fasilitas.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Fasilitas & Layanan
              </h4>
              <div className="flex flex-wrap gap-2">
                {place.fasilitas.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-lg"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{f}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Koordinat Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>
              Koordinat: {place.latitude}, {place.longitude}
            </span>
          </div>
        </div>

        {/* Modal Footer Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <a
            href={place.googlemaps}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.01]"
          >
            <Navigation className="w-4 h-4" />
            <span>Navigasi di Google Maps Asli</span>
            <ExternalLink className="w-4 h-4 ml-auto" />
          </a>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
