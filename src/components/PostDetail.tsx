import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Helmet } from 'react-helmet-async';
import { db } from '../firebase';
import { Post } from '../types';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

interface PostDetailProps {
  slug: string;
  onBack?: () => void;
}

export default function PostDetail({ slug, onBack }: PostDetailProps) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch post dari Firebase
  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!slug) {
          setError('Slug tidak ditemukan');
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, 'posts'),
          where('slug', '==', slug),
          where('status', '==', 'published')
        );
        
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docSnap = querySnapshot.docs[0];
          setPost({ id: docSnap.id, ...docSnap.data() } as Post);
        } else {
          setError('Artikel tidak ditemukan atau belum dipublikasikan');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Gagal memuat artikel');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Inject JSON-LD ke head setelah post loaded
  useEffect(() => {
    if (!post) return;

    const excerpt = post.content
      .replace(/<[^>]*>/g, '')
      .trim()
      .substring(0, 160) + '...';
    
    const articleUrl = `https://benculukspot.vercel.app/artikel/${post.slug}`;
    const siteUrl = 'https://benculukspot.vercel.app';
    
    // Transform image untuk Pinterest
    const transformedImage = (() => {
      if (!post.coverImage) return `${siteUrl}/images/og-default.png`;
      
      if (post.coverImage.includes('cloudinary.com')) {
        const cloudinaryMatch = post.coverImage.match(/\/upload\/(.*?)(\.jpg|\.png|\.webp)/);
        if (cloudinaryMatch) {
          const publicId = cloudinaryMatch[1];
          const format = cloudinaryMatch[2];
          return `https://res.cloudinary.com/uj6flyyh/image/upload/w_1000,h_1500,c_fill,q_auto/${publicId}${format}`;
        }
      }
      
      return post.coverImage;
    })();

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.seo?.metaDescription || excerpt,
      image: transformedImage,
      datePublished: post.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      dateModified: post.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
      author: {
        '@type': 'Organization',
        name: 'Benculuk Spot',
        url: siteUrl,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Benculuk Spot',
        logo: {
          '@type': 'ImageObject',
          url: `${siteUrl}/logo.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
    });
    
    document.head.appendChild(script);
    
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin mb-4">⏳</div>
          <p className="text-gray-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">❌ {error || 'Artikel tidak ditemukan'}</p>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          )}
        </div>
      </div>
    );
  }

  // Format tanggal
  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Estimate reading time
  const estimateReadTime = (html: string) => {
    const textOnly = html.replace(/<[^>]*>/g, '');
    const wordCount = textOnly.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  // Extract excerpt
  const extractExcerpt = (html: string, limit: number = 160) => {
    const textOnly = html.replace(/<[^>]*>/g, '').trim();
    return textOnly.length > limit ? textOnly.substring(0, limit) + '...' : textOnly;
  };

  // Transform image untuk Pinterest (1000x1500px portrait ratio)
  const transformImageForPinterest = (imageUrl: string | undefined): string => {
    if (!imageUrl) return 'https://benculukspot.vercel.app/images/og-default.png';

    // Kalau Cloudinary — add transformation params
    if (imageUrl.includes('cloudinary.com')) {
      // Extract public_id dari Cloudinary URL
      const cloudinaryMatch = imageUrl.match(/\/upload\/(.*?)(\.jpg|\.png|\.webp)/);
      if (cloudinaryMatch) {
        const publicId = cloudinaryMatch[1];
        const format = cloudinaryMatch[2];
        return `https://res.cloudinary.com/uj6flyyh/image/upload/w_1000,h_1500,c_fill,q_auto/${publicId}${format}`;
      }
    }

    // Kalau image service lain, return as-is (Pinterest akan handle)
    return imageUrl;
  };

  const readTime = estimateReadTime(post.content);
  const excerpt = extractExcerpt(post.content);
  const articleUrl = `https://benculukspot.vercel.app/artikel/${post.slug}`;
  const siteUrl = 'https://benculukspot.vercel.app';
  const ogImage = transformImageForPinterest(post.coverImage);

  return (
    <>
      {/* Helmet: Dynamic Meta Tags untuk Facebook, Pinterest, Twitter */}
      <Helmet>
        <title>{post.title} | Benculuk Spot</title>
        <meta name="description" content={post.seo?.metaDescription || excerpt} />
        <meta name="keywords" content={post.seo?.keywords?.join(', ') || post.title} />
        <meta name="author" content="Benculuk Spot" />

        {/* Open Graph Tags */}
        <meta property="og:site_name" content="Benculuk Spot" />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.seo?.metaDescription || excerpt} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1000" />
        <meta property="og:image:height" content="1500" />

        {/* Article Meta Tags */}
        {post.createdAt && (
          <meta property="article:published_time" content={new Date(post.createdAt.toDate?.() || post.createdAt).toISOString()} />
        )}
        {post.seo?.keywords && post.seo.keywords.length > 0 && (
          <meta property="article:tag" content={post.seo.keywords.join(', ')} />
        )}

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.seo?.metaDescription || excerpt} />
        <meta name="twitter:image" content={ogImage} />

        <link rel="canonical" href={articleUrl} />
      </Helmet>

      <article className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b bg-gray-50">
          <div className="max-w-3xl mx-auto px-4 py-4">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Daftar Artikel
              </button>
            )}
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full h-96 overflow-hidden bg-gray-100">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-3xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>

          <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-600 border-b pb-6">
            {post.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.createdAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readTime} min baca</span>
            </div>
          </div>

          <div
            className="prose prose-lg max-w-none
                       prose-p:my-4 prose-p:leading-relaxed prose-p:text-gray-700
                       prose-h1:my-6 prose-h1:text-3xl prose-h1:font-bold
                       prose-h2:my-5 prose-h2:text-2xl prose-h2:font-bold prose-h2:border-l-4 prose-h2:border-blue-500 prose-h2:pl-4
                       prose-h3:my-4 prose-h3:text-xl prose-h3:font-bold
                       prose-strong:font-bold prose-strong:text-gray-900
                       prose-em:italic prose-em:text-gray-800
                       prose-ul:my-4 prose-ul:ml-6 prose-ul:space-y-1
                       prose-ol:my-4 prose-ol:ml-6 prose-ol:space-y-1
                       prose-li:text-gray-700
                       prose-img:rounded-lg prose-img:shadow-md prose-img:max-w-full prose-img:my-4
                       prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 prose-blockquote:my-4
                       prose-code:bg-gray-100 prose-code:rounded prose-code:px-2 prose-code:py-1 prose-code:font-mono prose-code:text-sm prose-code:text-red-600
                       prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:my-4
                       prose-pre:code:bg-transparent prose-pre:code:text-inherit prose-pre:code:p-0
                       prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800
                       prose-hr:my-6 prose-hr:border-gray-300
                       prose-table:w-full prose-table:border-collapse prose-table:my-4
                       prose-th:bg-gray-100 prose-th:font-bold prose-th:p-3 prose-th:text-left
                       prose-td:border prose-td:border-gray-300 prose-td:p-3"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </main>

        {/* Footer */}
        <footer className="bg-gray-50 border-t mt-12">
          <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="text-xs text-gray-500 space-y-1">
              {post.seo?.metaDescription && (
                <p><strong>Deskripsi:</strong> {post.seo.metaDescription}</p>
              )}
              {post.seo?.keywords && post.seo.keywords.length > 0 && (
                <p><strong>Keywords:</strong> {post.seo.keywords.join(', ')}</p>
              )}
            </div>
          </div>
        </footer>
      </article>
    </>
  );
}