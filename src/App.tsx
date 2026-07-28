import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Place, AdminUser, Post } from './types';
import { INITIAL_PLACES } from './data/initialPlaces';
import { exportPlacesToCsv } from './utils/csv';
import { Navbar } from './components/Navbar';
import { PublicDirectory } from './components/PublicDirectory';
import { AdminDashboard } from './components/AdminDashboard';
import  PostEditor  from './components/PostEditor';
import { AdminLoginPage } from './components/AdminLoginPage';
import { PlaceFormModal } from './components/PlaceFormModal';
import { PlaceDetailModal } from './components/PlaceDetailModal';
import { MapPin, Heart, Shield, CheckCircle2 } from 'lucide-react';
import PostList from './components/PostList';
import AdminPostList from './components/AdminPostList';
import PostDetail from './components/PostDetail';


const LOCAL_STORAGE_KEY = 'benculuk_places_v1';
const ADMIN_STORAGE_KEY = 'benculuk_admin_v1';

export default function App() {
  // Places State
const [places, setPlaces] = useState<Place[]>(INITIAL_PLACES);
useEffect(() => {
  const fetchPlaces = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'places'));
      if (!querySnapshot.empty) {
        const firebasePlaces: Place[] = querySnapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        } as Place));
        setPlaces(firebasePlaces);
      } else {
        // Jika database Firestore masih kosong, masukkan data awal (INITIAL_PLACES)
        for (const place of INITIAL_PLACES) {
          const { id, ...rest } = place;
          await setDoc(doc(db, 'places', id), rest);
        }
        setPlaces(INITIAL_PLACES);
      }
    } catch (e) {
      console.error('Gagal mengambil data dari Firebase:', e);
    }
  };
  fetchPlaces();
}, []);

useEffect(() => {
  const handleHashChange = () => {
    if (window.location.hash === '#login') {
      setActiveTab('login');
    }
  };
  window.addEventListener('hashchange', handleHashChange);
  if (window.location.hash === '#login') {
    setActiveTab('login');
  }
  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);

// Baca URL /artikel/:slug saat pertama kali load atau saat back/forward browser
useEffect(() => {
  const syncFromUrl = () => {
    const match = window.location.pathname.match(/^\/artikel\/([^/]+)\/?$/);
    if (match) {
      setActiveTab('blog');
      setSelectedPostSlug(decodeURIComponent(match[1]));
    } else if (window.location.pathname === '/blog') {
      setActiveTab('blog');
      setSelectedPostSlug(null);
    }
  };
  syncFromUrl();
  window.addEventListener('popstate', syncFromUrl);
  return () => window.removeEventListener('popstate', syncFromUrl);
}, []);
const [darkMode, setDarkMode] = useState<boolean>(() => {
  return localStorage.getItem('benculuk_darkmode') === 'true';
});

useEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode);
  localStorage.setItem('benculuk_darkmode', String(darkMode));
}, [darkMode]);

  // Admin Auth State
  const [admin, setAdmin] = useState<AdminUser>(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load admin from localStorage', e);
    }
    return { email: '', isLoggedIn: false };
  });

  // UI Navigation & Modals State
  const [activeTab, setActiveTab] = useState<'public' | 'login' | 'admin' | 'posts' | 'blog'>('public');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedPostSlug, setSelectedPostSlug] = useState<string | null>(null);
  const [detailModalPlace, setDetailModalPlace] = useState<Place | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  

  // Save Places to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(places));
    } catch (e) {
      console.error('Failed to save places to localStorage', e);
    }
  }, [places]);

  // Save Admin State
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    } catch (e) {
      console.error('Failed to save admin state', e);
    }
  }, [admin]);

  // Show Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Request User Location
  const handleRequestUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          showToast('Lokasi Anda berhasil terdeteksi!');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          showToast('Gagal mendeteksi lokasi. Pastikan izin lokasi aktif.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      showToast('Perangkat tidak mendukung Geolocation.');
    }
  };

  // Admin Login Handler
  const handleLoginSuccess = (email: string) => {
    setAdmin({ email, isLoggedIn: true });
    setActiveTab('admin');
    showToast(`Selamat datang Kembali, Admin (${email})!`);
  };

  // Admin Logout Handler
  const handleLogoutAdmin = () => {
    setAdmin({ email: '', isLoggedIn: false });
    setActiveTab('public');
    showToast('Berhasil keluar dari mode Admin.');
  };

  // CRUD: Add or Update Place
 const handleSavePlace = async (placeData: Omit<Place, 'id'>, id?: string) => {
  try {
    // Bersihkan data dari nilai undefined agar tidak ditolak Firestore
    const cleanedData = Object.fromEntries(
      Object.entries(placeData).filter(([_, v]) => v !== undefined)
    );

    if (id) {
      // Proses Update / Edit data
      const placeRef = doc(db, 'places', id);
      await updateDoc(placeRef, cleanedData);

      setPlaces((prev) =>
        prev.map((p) => (p.id === id ? { ...placeData, id } : p))
      );
      showToast(`Data "${placeData.nama}" berhasil diperbarui!`);
    } else {
      // Proses Create / Tambah data baru
      const docRef = await addDoc(collection(db, 'places'), cleanedData);
      const newPlace: Place = {
        ...placeData,
        id: docRef.id,
      };

      setPlaces((prev) => [newPlace, ...prev]);
      showToast(`Tempat baru "${placeData.nama}" berhasil ditambahkan!`);
    }
  } catch (e) {
    console.error('Gagal menyimpan data ke Firebase:', e);
    showToast('Gagal menyimpan data ke database online.');
  }
};

  // CRUD: Delete Place
const handleDeletePlace = async (id: string) => {
  try {
    const deleted = places.find((p) => p.id === id);
    
    // Hapus dokumen dari Firestore
    await deleteDoc(doc(db, 'places', id));

    setPlaces((prev) => prev.filter((p) => p.id !== id));
    if (selectedPlace?.id === id) setSelectedPlace(null);
    showToast(`Tempat "${deleted?.nama || 'tersebut'}" berhasil dihapus.`);
  } catch (e) {
    console.error('Gagal menghapus data dari Firebase:', e);
    showToast('Gagal menghapus data dari database.');
  }
};
// dipanggil dari tombol "Artikel" di Navbar
function goToBlog() {
  console.log('goToBlog dipanggil, activeTab sebelumnya:', activeTab);
  setSelectedPostSlug(null); // pastikan mulai dari daftar, bukan nyangkut di artikel lama
  setActiveTab('blog');
  window.history.pushState({}, '', '/blog');
}

// Dipanggil saat memilih artikel (dari list publik) — sinkronkan URL juga
function handleSelectPost(slug: string) {
  setSelectedPostSlug(slug);
  window.history.pushState({}, '', `/artikel/${slug}`);
}

// Dipanggil saat kembali dari detail artikel ke daftar
function handleBackFromPost() {
  setSelectedPostSlug(null);
  window.history.pushState({}, '', '/blog');
}

  // CSV: Import Places
 const handleImportCsvPlaces = async (imported: Place[]) => {
  try {
    const newPlacesWithFirebaseId: Place[] = [];

    for (const place of imported) {
      // Hapus properti id lama agar Firestore membuatkan ID unik otomatis
      const { id, ...placeData } = place;
      
      // Bersihkan nilai undefined agar tidak ditolak Firestore
      const cleanedData = Object.fromEntries(
        Object.entries(placeData).filter(([_, v]) => v !== undefined)
      );

      // Simpan ke koleksi 'places' di Firebase
      const docRef = await addDoc(collection(db, 'places'), cleanedData);
      
      newPlacesWithFirebaseId.push({
        ...placeData,
        id: docRef.id,
      } as Place);
    }

    // Perbarui state lokal dengan data yang sudah memiliki ID dari Firebase
    setPlaces((prev) => [...newPlacesWithFirebaseId, ...prev]);
    showToast(`${imported.length} data tempat berhasil diimpor dan disimpan ke Firebase!`);
  } catch (e) {
    console.error('Gagal mengimpor data ke Firebase:', e);
    showToast('Gagal menyimpan data impor ke database online.');
  }
};

  // CSV: Export Places
  const handleExportCsv = () => {
    exportPlacesToCsv(places);
    showToast('File CSV berhasil diunduh ke komputer/hp Anda.');
  };

  // Reset Data to Initial
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin mengembalikan seluruh data ke sampel awal Benculuk?')) {
      setPlaces(INITIAL_PLACES);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      showToast('Data berhasil dikembalikan ke sampel awal Benculuk.');
    }
  };

  // Select Place for Map / Detail
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    setDetailModalPlace(place);
  };

  return (
<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors">      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}

      <Navbar
        admin={admin}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onGoToBlog={goToBlog}
        onLogoutAdmin={handleLogoutAdmin}
        onResetData={handleResetData}
        totalPlaces={places.length}
        totalCategories={new Set(places.map((p) => p.kategori)).size}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
           {activeTab === 'public' && (
  <PublicDirectory
    places={places}
    selectedPlace={selectedPlace}
    onSelectPlace={handleSelectPlace}
    userLocation={userLocation}
    onRequestUserLocation={handleRequestUserLocation}
  />
)}

            {activeTab === 'login' && (
              <AdminLoginPage
                onLoginSuccess={handleLoginSuccess}
                onBackToPublic={() => setActiveTab('public')}
              />
            )}

            {activeTab === 'admin' &&
              (admin.isLoggedIn ? (
                <AdminDashboard
                  places={places}
                  onAddPlace={() => {
                    setEditingPlace(null);
                    setIsFormModalOpen(true);
                  }}
                  onEditPlace={(p) => {
                    setEditingPlace(p);
                    setIsFormModalOpen(true);
                  }}
                  onDeletePlace={handleDeletePlace}
                  onImportCsvPlaces={handleImportCsvPlaces}
                  onExportCsv={handleExportCsv}
                  onResetData={handleResetData}
                  onPreviewPlace={(p) => setDetailModalPlace(p)}
                />
              ) : (
                <AdminLoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onBackToPublic={() => setActiveTab('public')}
                />
              ))}
              {activeTab === 'posts' && (
              admin.isLoggedIn ? (
                showPostEditor ? (
                  <PostEditor
                    existingPost={editingPost}
                    onDone={() => {
                      setShowPostEditor(false);
                      setEditingPost(null);
                    }}
                  />
                ) : (
                  <AdminPostList
                    onCreateNew={() => {
                      setEditingPost(null);
                      setShowPostEditor(true);
                    }}
                    onEditPost={(post) => {
                      setEditingPost(post);
                      setShowPostEditor(true);
                    }}
                  />
                )
              ) : (
                <AdminLoginPage
                  onLoginSuccess={handleLoginSuccess}
                  onBackToPublic={() => setActiveTab('public')}
                />
              )
            )}
            {activeTab === 'blog' && (
              selectedPostSlug ? (
                <PostDetail
                  slug={selectedPostSlug}
                  onBack={handleBackFromPost}
                />
              ) : (
                <PostList
                  onSelectPost={handleSelectPost}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Direktori Tempat Benculuk & Sekitarnya</span>
            <span>•</span>
            <span>Cluring, Banyuwangi</span>
          </div>

          
        </div>
      </footer>

      {/* Modals */}

      <PlaceFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingPlace(null);
        }}
        onSubmit={handleSavePlace}
        editPlace={editingPlace}
      />

      <PlaceDetailModal
        place={detailModalPlace}
        onClose={() => setDetailModalPlace(null)}
        userLocation={userLocation}
      />
    </div>
  );
}