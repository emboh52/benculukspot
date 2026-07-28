import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Post {
  id: string;
  title: string;
  content: string;
  coverImage: string;
  seo: { metaTitle: string; metaDescription: string };
}

interface PostDetailProps {
  slug: string;
  onBack: () => void;
}

export default function PostDetail({ slug, onBack }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'posts'),
          where('slug', '==', slug),
          where('status', '==', 'published')
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const d = snapshot.docs[0];
          setPost({ id: d.id, ...d.data() } as Post);
        } else {
          setPost(null);
        }
      } catch (err) {
        console.error('Gagal ambil artikel:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post?.seo?.metaTitle) document.title = post.seo.metaTitle;
  }, [post]);

  if (loading) return <p>Memuat artikel...</p>;
  if (!post) return <p>Artikel tidak ditemukan.</p>;

  return (
    <article className="post-detail">
      <button onClick={onBack}>&larr; Kembali ke daftar artikel</button>
      <img src={post.coverImage} alt={post.title} />
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}