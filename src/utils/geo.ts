// Haversine formula to calculate distance between two coordinates in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function toRad(Value: number): number {
  return (Value * Math.PI) / 180;
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

// Category color maps for UI badges & leaflet markers
export function getCategoryBadgeStyle(category: string): { bg: string; text: string; border: string; hex: string } {
  const cat = category.toLowerCase();
  if (cat.includes('sego') || cat.includes('tempong')) {
    return { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', hex: '#d97706' };
  }
  if (cat.includes('rujak') || cat.includes('soto')) {
    return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200', hex: '#059669' };
  }
  if (cat.includes('sate')) {
    return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', hex: '#dc2626' };
  }
  if (cat.includes('warung') || cat.includes('kuliner') || cat.includes('makan')) {
    return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200', hex: '#ea580c' };
  }
  if (cat.includes('wisata')) {
    return { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200', hex: '#0d9488' };
  }
  if (cat.includes('toko') || cat.includes('pasar') || cat.includes('oleh')) {
    return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', hex: '#2563eb' };
  }
  if (cat.includes('ibadah') || cat.includes('masjid')) {
    return { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300', hex: '#10b981' };
  }
  if (cat.includes('homestay') || cat.includes('penginapan') || cat.includes('hotel')) {
    return { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200', hex: '#4f46e5' };
  }
  return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200', hex: '#0284c7' };
}
