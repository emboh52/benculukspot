import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place } from '../types';
import { getCategoryBadgeStyle } from '../utils/geo';
import { MapPin, Navigation, ExternalLink, Info } from 'lucide-react';

interface InteractiveMapProps {
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  userLocation?: { lat: number; lng: number } | null;
  pickerMode?: boolean;
  pickerCoords?: { lat: number; lng: number };
  onPickerChange?: (coords: { lat: number; lng: number }) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  userLocation,
  pickerMode = false,
  pickerCoords,
  onPickerChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const userMarkerRef = useRef<L.Marker | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Default Center: Benculuk, Banyuwangi (-8.43, 114.223)
  const defaultCenter: [number, number] = [-8.43, 114.223];

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: selectedPlace ? [selectedPlace.latitude, selectedPlace.longitude] : defaultCenter,
        zoom: 14,
        zoomControl: true,
      });

      // CartoDB Positron / OpenStreetMap Tile Layer (Clean & readable layout)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      }).addTo(map);

      mapInstanceRef.current = map;

      // Handle map click in picker mode
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (pickerMode && onPickerChange) {
          onPickerChange({
            lat: Math.round(e.latlng.lat * 1000000) / 1000000,
            lng: Math.round(e.latlng.lng * 1000000) / 1000000,
          });
        }
      });
    }

    const map = mapInstanceRef.current;

    // Trigger map resize fix
    const resizeTimeout = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Update Places Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker: L.Marker) => marker.remove());
    markersRef.current = {};

    if (pickerMode) return; // In picker mode, only show picker marker

    places.forEach((place) => {
      const style = getCategoryBadgeStyle(place.kategori);
      const isSelected = selectedPlace?.id === place.id;

      // Custom SVG Marker Icon
      const customHtml = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: ${isSelected ? '38px' : '30px'};
          height: ${isSelected ? '38px' : '30px'};
          background-color: ${style.hex};
          color: white;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s ease, width 0.2s ease;
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        ">
          <svg width="${isSelected ? '20' : '16'}" height="${isSelected ? '20' : '16'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      `;

      const customIcon = L.divIcon({
        html: customHtml,
        className: 'custom-map-marker',
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 38 : 30],
        popupAnchor: [0, isSelected ? -38 : -30],
      });

      const marker = L.marker([place.latitude, place.longitude], { icon: customIcon }).addTo(map);

      // Popup content
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 min-w-[200px] font-sans text-slate-800';
      popupContent.innerHTML = `
        <div class="font-bold text-sm text-slate-900 mb-1">${place.nama}</div>
        <div class="inline-block px-2 py-0.5 text-xs font-semibold rounded-full mb-2" style="background-color: ${style.hex}20; color: ${style.hex};">
          ${place.kategori}
        </div>
        <div class="text-xs text-slate-600 mb-2 truncate">${place.alamat}</div>
        <div class="flex items-center gap-1.5 pt-1 border-t border-slate-100">
          <button id="btn-detail-${place.id}" class="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-1.5 px-2 rounded-md transition-colors">
            Lihat Detail
          </button>
          <a href="${place.googlemaps}" target="_blank" rel="noopener noreferrer" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs p-1.5 rounded-md flex items-center justify-center transition-colors" title="Buka di Google Maps">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: true,
        maxWidth: 260,
      });

      // Add click handler to button inside popup
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-detail-${place.id}`);
        if (btn) {
          btn.onclick = () => onSelectPlace(place);
        }
      });

      marker.on('click', () => {
        onSelectPlace(place);
      });

      markersRef.current[place.id] = marker;
    });
  }, [places, selectedPlace, pickerMode]);

  // Center on Selected Place
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace || pickerMode) return;

    map.panTo([selectedPlace.latitude, selectedPlace.longitude], {
      animate: true,
      duration: 0.8,
    });

    const marker = markersRef.current[selectedPlace.id];
    if (marker) {
      marker.openPopup();
    }
  }, [selectedPlace, pickerMode]);

  // Handle User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng]);
      } else {
        const userHtml = `
          <div style="
            width: 20px;
            height: 20px;
            background-color: #3b82f6;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3);
          "></div>
        `;
        const userIcon = L.divIcon({
          html: userHtml,
          className: 'user-loc-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>Lokasi Anda Sekarang</b>');
      }

      if (!selectedPlace) {
        map.setView([userLocation.lat, userLocation.lng], 15);
      }
    }
  }, [userLocation]);

  // Handle Picker Mode Marker (Admin Form)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickerMode || !pickerCoords) return;

    if (!pickerMarkerRef.current) {
      const pickerIcon = L.divIcon({
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background-color: #ef4444;
            color: white;
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
            cursor: move;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        className: 'picker-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([pickerCoords.lat, pickerCoords.lng], {
        icon: pickerIcon,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', (e: any) => {
        const latlng = e.target.getLatLng();
        if (onPickerChange) {
          onPickerChange({
            lat: Math.round(latlng.lat * 1000000) / 1000000,
            lng: Math.round(latlng.lng * 1000000) / 1000000,
          });
        }
      });

      pickerMarkerRef.current = marker;
      map.setView([pickerCoords.lat, pickerCoords.lng], 15);
    } else {
      pickerMarkerRef.current.setLatLng([pickerCoords.lat, pickerCoords.lng]);
    }
  }, [pickerMode, pickerCoords]);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[320px] z-0" />

      {pickerMode && (
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 bg-slate-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1.5 backdrop-blur-sm">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>Klik di peta atau geser pin merah untuk menentukan koordinat</span>
        </div>
      )}
    </div>
  );
};
