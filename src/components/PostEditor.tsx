import { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import slugify from 'slugify';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase'; // sesuaikan path ke config Firebase kamu
import ImagePicker from './ImagePicker';
import { Post } from '../types';
import { ArrowLeft } from 'lucide-react';

interface SeoData {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

interface PostEditorProps {
  existingPost?: Post | null; // kalau ada, editor jalan dalam mode EDIT
  onDone?: () => void; // dipanggil setelah simpan/batal, biasanya balik ke PostList
}

export default function PostEditor({ existingPost = null, onDone }: PostEditorProps) {
  const isEditMode = !!existingPost;

  const [title, setTitle] = useState(existingPost?.title || '');
  const [coverImage, setCoverImage] = useState(existingPost?.coverImage || '');
  const [showPicker, setShowPicker] = useState<'cover' | 'inline' | null>(null);
  const [seo, setSeo] = useState<SeoData>({
    metaTitle: existingPost?.seo?.metaTitle || '',
    metaDescription: existingPost?.seo?.metaDescription || '',
    keywords: existingPost?.seo?.keywords?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'draft' | 'published'>(existingPost?.status || 'draft');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link,
      Placeholder.configure({ placeholder: 'Tulis isi artikel di sini...' }),
    ],
    content: existingPost?.content || '',
  });

  // Kalau existingPost berubah (misal user klik edit post lain tanpa unmount),
  // sinkronkan ulang isi editor & field lain
  useEffect(() => {
    if (existingPost && editor) {
      setTitle(existingPost.title);
      setCoverImage(existingPost.coverImage);
      setSeo({
        metaTitle: existingPost.seo?.metaTitle || '',
        metaDescription: existingPost.seo?.metaDescription || '',
        keywords: existingPost.seo?.keywords?.join(', ') || '',
      });
      setStatus(existingPost.status);
      editor.commands.setContent(existingPost.content || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPost?.id, editor]);

  // Saat gambar dipilih dari ImagePicker
  const handleImageSelect = useCallback((path: string) => {
    if (showPicker === 'cover') {
      setCoverImage(path);
    } else if (showPicker === 'inline' && editor) {
      editor.chain().focus().setImage({ src: path }).run();
    }
    setShowPicker(null);
  }, [showPicker, editor]);

  const handleSave = async (publishNow: boolean) => {
    if (!title.trim()) {
      alert('Judul belum diisi');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        slug: slugify(title, { lower: true, strict: true }),
        content: editor?.getHTML() || '',
        coverImage,
        status: publishNow ? 'published' : 'draft',
        seo: {
          metaTitle: seo.metaTitle || title,
          metaDescription: seo.metaDescription,
          keywords: seo.keywords.split(',').map(k => k.trim()).filter(Boolean),
        },
        updatedAt: serverTimestamp(),
      };

      if (isEditMode && existingPost) {
        // MODE EDIT: update dokumen yang sudah ada, createdAt tidak diubah
        await updateDoc(doc(db, 'posts', existingPost.id), payload);
      } else {
        // MODE CREATE: dokumen baru
        await addDoc(collection(db, 'posts'), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      setStatus(publishNow ? 'published' : 'draft');
      alert(publishNow ? 'Artikel diterbitkan!' : 'Draft tersimpan!');
      onDone?.();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan, cek console untuk detail error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex gap-6 p-6 max-w-6xl mx-auto">
      {/* Kolom kiri: editor utama */}
      <div className="flex-1">
        {onDone && (
          <button
            onClick={onDone}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke daftar postingan
          </button>
        )}

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul artikel"
          className="w-full text-2xl font-bold border-b pb-2 mb-4 outline-none"
        />

        {/* Cover image */}
        <div className="mb-4">
          {coverImage ? (
            <div className="relative">
              <img src={coverImage} alt="Cover" className="w-full h-48 object-cover rounded" />
              <button
                onClick={() => setShowPicker('cover')}
                className="absolute top-2 right-2 bg-white px-2 py-1 text-sm rounded shadow"
              >
                Ganti
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPicker('cover')}
              className="w-full h-32 border-2 border-dashed rounded text-gray-500"
            >
              + Pilih Gambar Cover
            </button>
          )}
        </div>

        {/* Toolbar Tiptap */}
        {editor && (
          <div className="flex gap-2 mb-2 border-b pb-2">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-2 py-1 border rounded font-bold">B</button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-2 py-1 border rounded italic">I</button>
            <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded">H2</button>
            <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2 py-1 border rounded">• List</button>
            <button onClick={() => setShowPicker('inline')} className="px-2 py-1 border rounded">🖼 Gambar</button>
          </div>
        )}

        {/* Area tulis */}
        <EditorContent editor={editor} className="prose max-w-none min-h-[300px] border rounded p-4" />

        {/* Modal Image Picker */}
        {showPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between mb-2">
                <h3 className="font-bold">Pilih Gambar</h3>
                <button onClick={() => setShowPicker(null)}>✕</button>
              </div>
              <ImagePicker onSelect={handleImageSelect} />
            </div>
          </div>
        )}
      </div>

      {/* Kolom kanan: panel SEO + tombol simpan */}
      <div className="w-80 border-l pl-6">
        <h3 className="font-bold mb-2">Pengaturan SEO</h3>
        <label className="block text-sm mb-1">Meta Title</label>
        <input
          type="text"
          value={seo.metaTitle}
          onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
          placeholder={title || 'Otomatis pakai judul artikel'}
          className="w-full border rounded p-2 mb-3 text-sm"
        />

        <label className="block text-sm mb-1">Meta Description</label>
        <textarea
          value={seo.metaDescription}
          onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
          rows={3}
          className="w-full border rounded p-2 mb-3 text-sm"
        />

        <label className="block text-sm mb-1">Keywords (pisah koma)</label>
        <input
          type="text"
          value={seo.keywords}
          onChange={(e) => setSeo({ ...seo, keywords: e.target.value })}
          placeholder="furniture, meja custom, kursi jati"
          className="w-full border rounded p-2 mb-4 text-sm"
        />

        {/* Preview hasil pencarian Google */}
        <div className="border rounded p-3 mb-4 bg-gray-50">
          <p className="text-blue-700 text-sm truncate">{seo.metaTitle || title || 'Judul artikel'}</p>
          <p className="text-green-700 text-xs">benculukspot.com/{slugify(title || '', { lower: true, strict: true })}</p>
          <p className="text-gray-600 text-xs line-clamp-2">{seo.metaDescription || 'Deskripsi akan muncul di sini...'}</p>
        </div>

        {isEditMode && (
          <div className="text-xs text-slate-500 mb-3 bg-slate-50 border rounded p-2">
            Mode edit — status saat ini: <span className="font-semibold">{status === 'published' ? 'Terbit' : 'Draft'}</span>
          </div>
        )}

        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="w-full border rounded py-2 mb-2"
        >
          {saving ? 'Menyimpan...' : 'Simpan Draft'}
        </button>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded py-2"
        >
          {saving ? 'Menyimpan...' : isEditMode ? 'Update & Terbitkan' : 'Terbitkan'}
        </button>
      </div>
    </div>
  );
}