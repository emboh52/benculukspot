import { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
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
      StarterKit.configure({
        codeBlock: false, // pakai extension CodeBlock terpisah untuk lebih baik
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({ 
        placeholder: 'Tulis isi artikel di sini...',
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      CodeBlock.configure({
        languageClassPrefix: 'language-',
      }),
      Blockquote,
      HorizontalRule,
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

    const rawContent = editor?.getHTML() || '';
    if (!rawContent.trim()) {
      alert('Isi artikel belum ditulis');
      return;
    }

    setSaving(true);
    try {
      // Clean up HTML: remove empty tags, normalize spacing
      const cleanHTML = rawContent
        .replace(/<p><br><\/p>/g, '') // remove empty paragraphs
        .replace(/<p>\s*<\/p>/g, '') // remove whitespace-only paragraphs
        .replace(/&nbsp;/g, ' ') // normalize spaces
        .replace(/\s+/g, ' ') // collapse multiple spaces (per line)
        .trim();

      const payload = {
        title: title.trim(),
        slug: slugify(title, { lower: true, strict: true }),
        content: cleanHTML,
        coverImage,
        status: publishNow ? 'published' : 'draft',
        seo: {
          metaTitle: (seo.metaTitle || title).trim(),
          metaDescription: seo.metaDescription.trim(),
          keywords: seo.keywords
            .split(',')
            .map(k => k.trim())
            .filter(Boolean),
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
      alert(publishNow ? '✅ Artikel diterbitkan!' : '✅ Draft tersimpan!');
      onDone?.();
    } catch (err) {
      console.error('Save error:', err);
      alert(`❌ Gagal menyimpan: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          <div className="space-y-2 mb-2">
            {/* Row 1: Text styling */}
            <div className="flex gap-1 border-b pb-2">
              <button 
                onClick={() => editor.chain().focus().toggleBold().run()} 
                className={`px-2 py-1 border rounded font-bold text-sm ${editor.isActive('bold') ? 'bg-blue-100' : ''}`}
                title="Bold"
              >B</button>
              <button 
                onClick={() => editor.chain().focus().toggleItalic().run()} 
                className={`px-2 py-1 border rounded italic text-sm ${editor.isActive('italic') ? 'bg-blue-100' : ''}`}
                title="Italic"
              >I</button>
              <button 
                onClick={() => editor.chain().focus().toggleUnderline().run()} 
                className={`px-2 py-1 border rounded underline text-sm ${editor.isActive('underline') ? 'bg-blue-100' : ''}`}
                title="Underline"
              >U</button>
              <div className="border-l mx-1"></div>
              <button 
                onClick={() => editor.chain().focus().toggleStrike().run()} 
                className={`px-2 py-1 border rounded line-through text-sm ${editor.isActive('strike') ? 'bg-blue-100' : ''}`}
                title="Strikethrough"
              >S</button>
              <button 
                onClick={() => editor.chain().focus().toggleCode().run()} 
                className={`px-2 py-1 border rounded font-mono text-sm ${editor.isActive('code') ? 'bg-blue-100' : ''}`}
                title="Inline Code"
              >&lt;/&gt;</button>
            </div>

            {/* Row 2: Headings */}
            <div className="flex gap-1 border-b pb-2">
              <button 
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
                className={`px-2 py-1 border rounded font-bold text-sm ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100' : ''}`}
                title="Heading 1"
              >H1</button>
              <button 
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                className={`px-2 py-1 border rounded font-bold text-sm ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100' : ''}`}
                title="Heading 2"
              >H2</button>
              <button 
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
                className={`px-2 py-1 border rounded font-bold text-sm ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100' : ''}`}
                title="Heading 3"
              >H3</button>
              <div className="border-l mx-1"></div>
              <button 
                onClick={() => editor.chain().focus().toggleBlockquote().run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive('blockquote') ? 'bg-blue-100' : ''}`}
                title="Blockquote"
              >&quot;</button>
            </div>

            {/* Row 3: Lists & alignment */}
            <div className="flex gap-1 border-b pb-2">
              <button 
                onClick={() => editor.chain().focus().toggleBulletList().run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive('bulletList') ? 'bg-blue-100' : ''}`}
                title="Bullet List"
              >• List</button>
              <button 
                onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive('orderedList') ? 'bg-blue-100' : ''}`}
                title="Numbered List"
              >1. List</button>
              <div className="border-l mx-1"></div>
              <button 
                onClick={() => editor.chain().focus().setTextAlign('left').run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : ''}`}
                title="Align Left"
              >←</button>
              <button 
                onClick={() => editor.chain().focus().setTextAlign('center').run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : ''}`}
                title="Align Center"
              >↔</button>
              <button 
                onClick={() => editor.chain().focus().setTextAlign('right').run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100' : ''}`}
                title="Align Right"
              >→</button>
            </div>

            {/* Row 4: Media & special */}
            <div className="flex gap-1">
              <button onClick={() => setShowPicker('inline')} className="px-2 py-1 border rounded text-sm hover:bg-gray-100">🖼 Gambar</button>
              <button 
                onClick={() => editor.chain().focus().insertContent('<hr />').run()} 
                className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                title="Horizontal Line"
              >―</button>
              <button 
                onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
                className={`px-2 py-1 border rounded text-sm ${editor.isActive('codeBlock') ? 'bg-blue-100' : ''}`}
                title="Code Block"
              >&lt;&gt;</button>
              <div className="border-l mx-1"></div>
              <button 
                onClick={() => editor.chain().focus().undo().run()} 
                className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                title="Undo"
              >↶</button>
              <button 
                onClick={() => editor.chain().focus().redo().run()} 
                className="px-2 py-1 border rounded text-sm hover:bg-gray-100"
                title="Redo"
              >↷</button>
            </div>
          </div>
        )}

        {/* Area tulis */}
        <div className="border rounded bg-white">
          <EditorContent 
            editor={editor} 
            className="prose prose-sm max-w-none min-h-[400px] p-4 focus-within:outline-none
                       prose-p:my-2 prose-p:leading-relaxed
                       prose-h1:my-3 prose-h1:text-2xl
                       prose-h2:my-2 prose-h2:text-xl
                       prose-h3:my-2 prose-h3:text-lg
                       prose-strong:font-bold
                       prose-em:italic
                       prose-ul:my-2 prose-ul:ml-4
                       prose-ol:my-2 prose-ol:ml-4
                       prose-li:my-1
                       prose-img:rounded prose-img:max-w-full
                       prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic
                       prose-code:bg-gray-100 prose-code:rounded prose-code:px-1
                       prose-pre:bg-gray-100 prose-pre:rounded prose-pre:p-3 prose-pre:overflow-x-auto
                       prose-a:text-blue-600 prose-a:underline
                       prose-hr:my-4"
          />
        </div>

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