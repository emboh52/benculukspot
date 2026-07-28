import { useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase'; // sesuaikan path ke config Firebase kamu
import { Post } from '../types';
import {
  Plus,
  Pencil,
  Trash2,
  Share2,
  AlertTriangle,
  FileText,
  Eye,
  Copy,
  Check,
} from 'lucide-react';

interface PostListProps {
  onCreateNew: () => void;
  onEditPost: (post: Post) => void;
}

// Otomatis pakai domain yang sedang aktif (localhost saat dev, domain asli saat production)
const SITE_URL = window.location.origin;

export default function AdminPostList({ onCreateNew, onEditPost }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ambil semua post realtime dari Firestore, terbaru dulu
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Post[];
        setPosts(data);
        setLoading(false);
      },
      (err) => {
        console.error('Gagal memuat postingan:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(db, 'posts', id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus postingan, cek console untuk detail error.');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async (post: Post) => {
    const url = `${SITE_URL}/artikel/${post.slug}`;

    // Pakai native share kalau tersedia (mobile), fallback copy link
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.seo?.metaDescription || post.title,
          url,
        });
        return;
      } catch (err) {
        // user cancel share, tidak perlu diapa-apakan
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
      alert('Gagal menyalin link. URL: ' + url);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '-';
    return timestamp.toDate().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold mb-2">
              <span>Panel Kontrol Admin</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Dashboard Postingan
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Kelola artikel & postingan Benculuk Spot — buat, edit, hapus, atau bagikan link
              publiknya.
            </p>
          </div>

          <button
            onClick={onCreateNew}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tulis Postingan Baru</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Cover</th>
                <th className="py-3.5 px-4">Judul</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal Dibuat</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Memuat postingan...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span>Belum ada postingan. Klik "Tulis Postingan Baru" untuk mulai.</span>
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        {post.coverImage ? (
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-[280px]">
                      <div className="font-bold text-slate-900 line-clamp-1">{post.title}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-1">/{post.slug}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          post.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {post.status === 'published' ? 'Terbit' : 'Draft'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(post.createdAt)}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {post.status === 'published' && (
                          <a
                            href={`${SITE_URL}/artikel/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Lihat Halaman Publik"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}

                        <button
                          onClick={() => handleShare(post)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Bagikan Link"
                        >
                          {copiedId === post.id ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => onEditPost(post)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit Postingan"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(post.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Postingan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast kecil saat link berhasil disalin */}
      {copiedId && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white text-xs font-medium py-2.5 px-4 rounded-xl shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <Copy className="w-3.5 h-3.5" />
          Link berhasil disalin!
        </div>
      )}

      {/* Modal Konfirmasi Hapus */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Konfirmasi Hapus Postingan</h3>
            <p className="text-xs text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus postingan ini? Tindakan ini tidak bisa dibatalkan.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                {deleting ? 'Menghapus...' : 'Hapus Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}