import { useEffect, useState } from 'react';
import { useBlogStore } from '../store/useBlogStore';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Flame, Clock, Eye, Heart, Award } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/Skeletons';

const Trending = () => {
  const { trendingBlogs, fetchTrendingBlogs, trendingLoading, blogs, fetchBlogs, loading } = useBlogStore();
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchTrendingBlogs();
    fetchBlogs({ limit: 12 });
  }, [fetchTrendingBlogs, fetchBlogs]);

  const displayBlogs = trendingBlogs.length > 0 ? trendingBlogs : blogs;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame size={20} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>Trending Now</h1>
            <p className="text-sm text-gray-500 mt-0.5">The stories everyone is reading</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6">
          {(['week', 'month', 'all'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`tag-pill ${timeframe === tf ? 'active' : ''}`}
            >
              {tf === 'week' ? 'This Week' : tf === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 featured */}
      {!trendingLoading && displayBlogs.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {displayBlogs.slice(0, 3).map((blog, idx) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {idx === 0 && (
                <div className="absolute -top-3 left-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold">
                  <Award size={10} /> #1 Trending
                </div>
              )}
              <BlogCard blog={blog} index={idx} />
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main list */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={16} className="text-gray-500" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">All Trending</h2>
          </div>

          {trendingLoading || loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => <BlogCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {displayBlogs.slice(3).map((blog, idx) => (
                <BlogCard key={blog._id} blog={blog} index={idx + 3} />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Top ranked list */}
        <aside className="hidden lg:block w-72 flex-shrink-0">
          <div className="surface rounded-2xl p-5 sticky top-24">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Award size={14} className="text-yellow-400" /> Top Stories
            </h3>
            <div>
              {displayBlogs.slice(0, 8).map((blog, idx) => (
                <Link
                  key={blog._id}
                  to={`/blog/${blog.slug}`}
                  className="flex gap-3 items-start py-3 border-b border-white/[0.05] last:border-0 hover:opacity-75 transition-opacity group"
                >
                  <span className="text-xs font-black text-gray-700 mt-0.5 w-5 flex-shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white line-clamp-2 leading-snug">
                      {blog.title}
                    </p>
                    <div className="flex items-center gap-2.5 mt-1.5 text-gray-600">
                      <span className="text-[11px] flex items-center gap-1">
                        <Heart size={9} /> {blog.likes.length}
                      </span>
                      <span className="text-[11px] flex items-center gap-1">
                        <Eye size={9} /> {blog.views}
                      </span>
                      <span className="text-[11px] flex items-center gap-1">
                        <Clock size={9} /> {blog.readTime}m
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Trending;
