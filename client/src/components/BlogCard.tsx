import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Eye, Heart, Bookmark } from 'lucide-react';
import type { Blog } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { useBlogStore } from '../store/useBlogStore';
import toast from 'react-hot-toast';

interface BlogCardProps {
  blog: Blog;
  index?: number;
  compact?: boolean;
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&h=450&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop',
];

const CATEGORY_COLORS: Record<string, string> = {
  Technology: 'hsl(220, 90%, 65%)',
  Design: 'hsl(280, 85%, 65%)',
  Startups: 'hsl(30, 90%, 60%)',
  Business: 'hsl(30, 90%, 60%)',
  Productivity: 'hsl(140, 70%, 55%)',
  Mindset: 'hsl(140, 70%, 55%)',
  Programming: 'hsl(200, 85%, 60%)',
  Philosophy: 'hsl(310, 80%, 65%)',
  AI: 'hsl(220, 90%, 65%)',
  Psychology: 'hsl(310, 80%, 65%)',
};

export const getCategoryColor = (cat: string) =>
  CATEGORY_COLORS[cat] || 'rgba(255,255,255,0.7)';

const BlogCard = ({ blog, index = 0, compact = false }: BlogCardProps) => {
  const { user, updateBookmarks } = useAuthStore();
  const { toggleLike, toggleBookmark } = useBlogStore();
  const isLiked = user ? (blog.likes || []).includes(user._id) : false;
  const isBookmarked = user ? (user.bookmarks || []).includes(blog._id) : false;

  const fallbackImg = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  const primaryCategory = blog.categories?.[0];
  const categoryColor = primaryCategory ? getCategoryColor(primaryCategory) : undefined;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Login to like'); return; }
    await toggleLike(blog._id, user._id);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Login to save'); return; }
    const result = await toggleBookmark(blog._id);
    updateBookmarks(blog._id, result.isBookmarked);
  };

  if (compact) {
    return (
      <Link to={`/blog/${blog.slug}`} className="flex gap-4 group items-start py-4 border-b border-white/[0.05] last:border-0 hover:opacity-80 transition-opacity">
        <div className="flex-1 min-w-0">
          {primaryCategory && (
            <span className="text-[10px] font-bold uppercase tracking-widest mb-2 block" style={{ color: categoryColor }}>
              {primaryCategory}
            </span>
          )}
          <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-gray-300 transition-colors">
            {blog.title}
          </h4>
          <div className="flex items-center gap-3 mt-2 text-gray-500">
            <span className="text-[11px] font-medium">{blog.author?.fullName}</span>
            <span className="text-[11px] font-medium flex items-center gap-1">
              <Clock size={10} /> {blog.readTime} min
            </span>
          </div>
        </div>
        {blog.featuredImage && (
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <img src={blog.featuredImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </div>
        )}
      </Link>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="group flex flex-col surface rounded-2xl overflow-hidden card-hover"
    >
      {/* Image */}
      <Link to={`/blog/${blog.slug}`} className="relative h-52 overflow-hidden block flex-shrink-0">
        <img
          src={blog.featuredImage || fallbackImg}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {primaryCategory && (
          <span
            className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
            style={{ background: `${categoryColor}20`, color: categoryColor, border: `1px solid ${categoryColor}30` }}
          >
            {primaryCategory}
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Author */}
        <div className="flex items-center gap-3 mb-4">
          <Link to={`/profile/${blog.author?.username}`} className="flex-shrink-0">
            <img
              src={blog.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author?.fullName || 'User')}&background=222&color=fff&size=80`}
              alt={blog.author?.username}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10"
            />
          </Link>
          <div className="min-w-0">
            <Link to={`/profile/${blog.author?.username}`} className="text-xs font-semibold text-white hover:underline underline-offset-2 truncate block">
              {blog.author?.fullName || 'Unknown'}
            </Link>
            <span className="text-[11px] text-gray-600">
              {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Title & Excerpt */}
        <Link to={`/blog/${blog.slug}`}>
          <h3 className="text-base font-bold text-white leading-snug mb-2 line-clamp-2 group-hover:text-gray-300 transition-colors" style={{ letterSpacing: '-0.01em' }}>
            {blog.title}
          </h3>
        </Link>
        <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed mb-4">
          {blog.excerpt}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-600">
            <span className="flex items-center gap-1.5 text-[12px] font-medium">
              <Clock size={12} /> {blog.readTime} min
            </span>
            <span className="flex items-center gap-1.5 text-[12px] font-medium">
              <Eye size={12} /> {blog.views >= 1000 ? `${(blog.views / 1000).toFixed(1)}k` : blog.views}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                isLiked ? 'text-red-400 bg-red-500/10' : 'text-gray-600 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <Heart size={13} className={isLiked ? 'fill-red-400' : ''} />
              {blog.likes.length}
            </button>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg text-[12px] transition-all ${
                isBookmarked ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-600 hover:text-yellow-400 hover:bg-yellow-500/10'
              }`}
            >
              <Bookmark size={13} className={isBookmarked ? 'fill-yellow-400' : ''} />
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default BlogCard;
