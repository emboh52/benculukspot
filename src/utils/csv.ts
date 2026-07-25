import Papa from 'papaparse';
import { Place } from '../types';

export function exportPlacesToCsv(places: Place[]) {
  const data = places.map((place) => ({
    Nama: place.nama,
    Kategori: place.kategori,
    Deskripsi: place.deskripsi || '',
    Alamat: place.alamat,
    Telepon: place.telepon,
    Latitude: place.latitude,
    longitude: place.longitude,
    Googlemaps: place.googlemaps,
    GambarUrl: place.gambarUrl || '',
    JamBuka: place.jamBuka || '',
    Fasilitas: place.fasilitas ? place.fasilitas.join('; ') : '',
  }));
  const csvString = Papa.unparse(data);
  const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Direktori_Tempat_Benculuk_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCsvFile(file: File): Promise<Place[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedPlaces: Place[] = results.data.map((row: any, idx: number) => {
            const getVal = (...keys: string[]) => {
              for (const key of keys) {
                const foundKey = Object.keys(row).find(
                  (k) => k.toLowerCase().trim() === key.toLowerCase().trim()
                );
                if (foundKey && row[foundKey] !== undefined) {
                  return String(row[foundKey]).trim();
                }
              }
              return '';
            };

            const nama = getVal('Nama', 'Name', 'nama_tempat');
            const kategori = getVal('Kategori', 'Category') || 'Lainnya';
            const deskripsi = getVal('Deskripsi', 'Description', 'ket');
            const alamat = getVal('Alamat', 'Address');
            const telepon = getVal('Telepon', 'Phone', 'Telp', 'Hp', 'whatsapp');
            
            // Mendukung kolom latitude dan longitude (termasuk huruf kecil longitude)
            const latRaw = getVal('Latitude', 'Lat', 'latitude');
            const lngRaw = getVal('Longitude', 'Lng', 'Long', 'longitude', 'long');
            let googlemaps = getVal('Googlemaps', 'Google Maps', 'Gmaps', 'Maps', 'googlemaps');

            const lat = parseFloat(latRaw) || -8.43;
            const lng = parseFloat(lngRaw) || 114.22;

            if (!googlemaps) {
              googlemaps = `https://maps.google.com/?q=${lat},${lng}`;
            }

            const gambarUrl = getVal('GambarUrl', 'Gambar', 'Image', 'Foto') || undefined;
            const jamBuka = getVal('JamBuka', 'Jam Buka', 'OpeningHours') || undefined;
            const fasilitasRaw = getVal('Fasilitas', 'Facility');
            const fasilitas = fasilitasRaw
              ? fasilitasRaw.split(';').map((f) => f.trim()).filter(Boolean)
              : undefined;

            return {
              id: `imported-${Date.now()}-${idx}`,
              nama: nama || `Tempat Tanpa Nama ${idx + 1}`,
              kategori: kategori,
              deskripsi: deskripsi || 'Informasi belum tersedia.',
              alamat: alamat || 'Alamat tidak dicantumkan.',
              telepon: telepon || '-',
              latitude: lat,
              longitude: lng,
              googlemaps: googlemaps,
              gambarUrl,
              jamBuka,
              fasilitas,
              rating: 4.5,
            };
          });
          resolve(parsedPlaces);
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => reject(err),
    });
  });
}