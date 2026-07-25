export interface Place {
  id: string;
  nama: string;
  kategori: string;
  deskripsi: string;
  alamat: string;
  telepon: string;
  latitude: number;
  longitude: number;
  googlemaps: string;
  gambarUrl?: string;
  jamBuka?: string;
  fasilitas?: string[];
  rating?: number;
}

export type ViewMode = 'split' | 'list' | 'map';

export interface AdminUser {
  email: string;
  isLoggedIn: boolean;
}
