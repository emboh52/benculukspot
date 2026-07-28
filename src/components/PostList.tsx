import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase'; // sesuaikan path ke config Firebase kamu
import { Post } from '../types';
import { Calendar, FileText } from 'lucide-react';

interface PostListProps {
  onSelectPost: (slug: string) => void;
}

export default function PostList({ onSelectPost }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Hanya ambil post yang sudah published, buat halaman publik
  useEffect(() => {
    const q = query(
      collection(db, 'posts'),
      where('status', '==', 'published'),
      orderBy('createdAt', 'desc')
    );
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
        console.error('Gagal memuat artikel:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    return timestamp.toDate().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">Memuat artikel...</div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center text-slate-400">
        <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
        <p className="text-sm">Belum ada artikel yang diterbitkan.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Artikel Benculuk Spot
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Rekomendasi wisata & kuliner di sekitar Benculuk, Cluring, Banyuwangi
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <button
            key={post.id}
            onClick={() => onSelectPost(post.slug)}
            className="text-left bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
          >
            <div className="w-full h-44 bg-slate-100 overflow-hidden">
              {post.coverImage ? (
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <FileText className="w-8 h-8" />
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
                {post.title}
              </h2>
              {post.seo?.metaDescription && (
                <p className="text-slate-500 text-xs line-clamp-2 mb-3">
                  {post.seo.metaDescription}
                </p>
              )}
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Calendar className="w-3 h-3" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}