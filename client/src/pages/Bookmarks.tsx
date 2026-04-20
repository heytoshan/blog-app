import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import axios from '../lib/axios';
import { Bookmark, Loader2, BookOpen } from 'lucide-react';
import type { Blog } from '../store/useBlogStore';
import BlogCard from '../components/BlogCard';

const Bookmarks = () => {
  const { user } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const res = await axios.get('/users/bookmarks');
        setBookmarks(res.data.data || []);
      } catch {
        setBookmarks([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchBookmarks();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Bookmark size={48} className="mx-auto mb-4 text-white/10" />
        <h2 className="text-2xl font-black text-white mb-2">Sign in to view bookmarks</h2>
        <p className="text-gray-500 mb-8">Save stories to read them later.</p>
        <Link to="/login" className="btn-primary px-8 py-3 text-sm">Sign in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Bookmark size={20} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>Saved Stories</h1>
            <p className="text-sm text-gray-500 mt-0.5">{bookmarks.length} stories bookmarked</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-gray-500" size={32} />
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="py-24 text-center surface rounded-2xl">
          <BookOpen size={48} className="mx-auto mb-4 text-white/10" />
          <p className="text-gray-500 font-semibold text-sm mb-2">No saved stories yet</p>
          <p className="text-gray-600 text-xs mb-6">Bookmark stories from any blog post to find them here.</p>
          <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Discover Stories</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((blog, idx) => (
            <BlogCard key={blog._id} blog={blog} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;
