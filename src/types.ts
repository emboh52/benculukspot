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
  unggulan?: boolean;   // ← tambahan baru
}

export type ViewMode = 'split' | 'list' | 'map';

export interface AdminUser {
  email: string;
  isLoggedIn: boolean;
}

export interface PostSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string;
  status: 'draft' | 'published';
  seo: PostSeo;
  createdAt?: any;
  updatedAt?: any;
}