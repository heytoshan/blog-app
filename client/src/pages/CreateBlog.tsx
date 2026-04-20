import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogStore } from '../store/useBlogStore';
import { ImagePlus, X, Send, ArrowLeft, Loader2, Tag, Layout, Folders, Eye, EyeOff } from 'lucide-react';

const CATEGORY_OPTIONS = ['Technology', 'Design', 'Startups', 'Productivity', 'Mindset', 'Programming', 'Philosophy', 'AI', 'Business', 'Psychology'];

const CreateBlog = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    categories: [] as string[],
    tags: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const { createBlog } = useBlogStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const toggleCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent, publish = true) => {
    e.preventDefault();
    setIsPublishing(true);

    const blogData = new FormData();
    blogData.append('data', JSON.stringify({
      title: formData.title,
      content: formData.content,
      excerpt: formData.excerpt,
      categories: formData.categories,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
      isPublished: publish,
    }));
    if (image) blogData.append('featuredImage', image);

    try {
      const blog = await createBlog(blogData);
      if (blog) navigate(`/blog/${blog.slug}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.title || !formData.content || !formData.excerpt) return;
    setSavingDraft(true);
    const e = { preventDefault: () => {} } as React.FormEvent;
    await handleSubmit(e, false);
    setSavingDraft(false);
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.ceil(wordCount / 200);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-xl border border-white/[0.08] text-gray-500 hover:text-white hover:border-white/20 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>New Story</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {wordCount > 0 ? `${wordCount} words · ~${estimatedReadTime} min read` : 'Start writing...'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setPreviewMode(!previewMode)}
          className="btn-ghost px-4 py-2 text-[13px] flex items-center gap-2"
        >
          {previewMode ? <><EyeOff size={14} /> Edit</> : <><Eye size={14} /> Preview</>}
        </button>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <div className="surface rounded-2xl p-8">
          {preview && (
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8">
              <img src={preview} alt="Cover" className="w-full h-full object-cover" />
            </div>
          )}
          {formData.categories.length > 0 && (
            <div className="flex gap-2 mb-4">
              {formData.categories.map(cat => (
                <span key={cat} className="tag-pill">{cat}</span>
              ))}
            </div>
          )}
          <h1 className="text-4xl font-black text-white mb-6" style={{ letterSpacing: '-0.03em' }}>
            {formData.title || 'Your title here'}
          </h1>
          {formData.excerpt && (
            <blockquote className="border-l-[3px] border-white/20 pl-6 mb-8">
              <p className="text-base text-gray-400 italic">{formData.excerpt}</p>
            </blockquote>
          )}
          <div className="blog-content">
            {formData.content.split('\n\n').map((para, i) => {
              if (para.startsWith('## ')) return <h2 key={i}>{para.replace('## ', '')}</h2>;
              if (para.startsWith('### ')) return <h3 key={i}>{para.replace('### ', '')}</h3>;
              return <p key={i}>{para}</p>;
            })}
          </div>
        </div>
      ) : (
        /* Edit Mode */
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cover Image */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`relative rounded-2xl overflow-hidden border-2 border-dashed transition-all cursor-pointer ${
              preview ? 'border-transparent' : 'border-white/[0.08] hover:border-white/20'
            } ${!preview ? 'flex items-center justify-center h-56' : ''}`}
          >
            {preview ? (
              <>
                <div className="aspect-[16/9] w-full">
                  <img src={preview} alt="Cover" className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-semibold text-sm">Click to change image</p>
                </div>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setImage(null); setPreview(null); }}
                  className="absolute top-3 right-3 p-2 bg-black/70 rounded-xl text-white hover:bg-black transition-colors"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="text-center text-gray-600 hover:text-gray-400 transition-colors py-8">
                <ImagePlus size={32} className="mx-auto mb-3" />
                <p className="text-sm font-semibold">Add cover image</p>
                <p className="text-xs mt-1">JPG, PNG or WebP · Max 5MB</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          {/* Title */}
          <div>
            <input
              id="create-title"
              type="text"
              placeholder="Your headline..."
              required
              className="w-full bg-transparent text-4xl font-black text-white placeholder:text-white/10 border-none outline-none resize-none leading-tight"
              style={{ letterSpacing: '-0.03em' }}
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
              <Layout size={11} /> Summary (250 chars max)
            </label>
            <textarea
              id="create-excerpt"
              placeholder="A short description of your story..."
              required
              maxLength={250}
              rows={3}
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-white/15 resize-none transition-all"
              value={formData.excerpt}
              onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
            />
            <p className="text-[11px] text-gray-700 text-right">{formData.excerpt.length}/250</p>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
              <Folders size={11} /> Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`tag-pill ${formData.categories.includes(cat) ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-gray-600">
              <Tag size={11} /> Tags (comma separated)
            </label>
            <input
              id="create-tags"
              type="text"
              placeholder="react, typescript, tutorial"
              className="w-full bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-white/15 transition-all"
              value={formData.tags}
              onChange={e => setFormData({ ...formData, tags: e.target.value })}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Content</label>
            <p className="text-[11px] text-gray-700">Supports ## headings, **bold**, and paragraph breaks</p>
            <textarea
              id="create-content"
              required
              placeholder="Start writing your masterpiece...

## Introduction

Your first paragraph here.

## Section

More content here.

**Bold text** for emphasis."
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 text-[15px] text-gray-300 placeholder:text-gray-800 focus:outline-none focus:border-white/12 min-h-[500px] resize-y transition-all leading-relaxed font-mono"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          {/* Sticky bottom bar */}
          <div className="sticky bottom-6 glass-dark rounded-2xl px-6 py-4 flex items-center justify-between border border-white/[0.1] shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600 font-medium">
                {wordCount} words · {estimatedReadTime} min read
              </span>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft || !formData.title}
                className="text-xs text-gray-500 hover:text-white transition-colors disabled:opacity-40"
              >
                {savingDraft ? 'Saving...' : 'Save draft'}
              </button>
            </div>
            <button
              id="create-publish"
              type="submit"
              disabled={isPublishing}
              className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2"
            >
              {isPublishing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <><Send size={15} /> Publish</>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateBlog;
