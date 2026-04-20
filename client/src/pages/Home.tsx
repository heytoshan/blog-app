import { useEffect, useState } from 'react';
import { useBlogStore } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, Flame, Sparkles, ChevronRight,
  ArrowRight, Users, BookOpen, Zap, Award
} from 'lucide-react';
import BlogCard from '../components/BlogCard';
import { BlogCardSkeleton } from '../components/Skeletons';
import axios from '../lib/axios';

const CATEGORIES = ['All', 'Technology', 'Design', 'Startups', 'Productivity', 'Mindset', 'Programming', 'Philosophy'];

const STATS = [
  { icon: BookOpen, value: '10K+', label: 'Stories Published' },
  { icon: Users, value: '50K+', label: 'Active Readers' },
  { icon: Zap, value: '200+', label: 'Expert Writers' },
];

const Home = () => {
  const { blogs, trendingBlogs, loading, fetchBlogs, fetchTrendingBlogs } = useBlogStore();
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [topWriters, setTopWriters] = useState<any[]>([]);

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (activeCategory !== 'All') params.category = activeCategory;
    fetchBlogs(params);
    fetchTrendingBlogs();
    
    // Fetch Top Writers
    axios.get('/users/top-writers?limit=4')
      .then(res => setTopWriters(res.data.data))
      .catch(console.error);
  }, [searchQuery, activeCategory, fetchBlogs, fetchTrendingBlogs]);

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    navigate('/', { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* ─── Hero Section ─── */}
      {!searchQuery && (
        <section className="relative mb-16 rounded-3xl overflow-hidden border border-white/[0.06] min-h-[480px] flex items-center">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-[#0c0c0c]">
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% -20%, hsla(220,90%,60%,0.12) 0%, transparent 70%)',
            }} />
            <div className="absolute inset-0" style={{
              background: 'radial-gradient(ellipse 50% 50% at 80% 80%, hsla(280,80%,60%,0.07) 0%, transparent 60%)',
            }} />
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }} />
          </div>

          <div className="relative w-full px-8 md:px-16 py-16">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] text-xs font-semibold text-gray-400 mb-6"
              >
                <Sparkles size={12} className="text-yellow-400" />
                The home of great writing
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.02]"
                style={{ letterSpacing: '-0.04em' }}
              >
                Ideas that<br />
                <span className="text-gradient">expand minds.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 }}
                className="text-lg text-gray-400 mb-10 max-w-xl leading-relaxed"
              >
                Discover thoughtful writing from engineers, designers, founders and thinkers
                who are shaping what comes next.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap gap-3"
              >
                <Link to="/trending" className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
                  Explore Trending <TrendingUp size={15} />
                </Link>
                {!user && (
                  <Link to="/register" className="btn-ghost px-6 py-3 text-sm flex items-center gap-2">
                    Start Writing <ArrowRight size={15} />
                  </Link>
                )}
              </motion.div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-14 pt-10 border-t border-white/[0.06]">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/[0.05] border border-white/[0.07]">
                    <Icon size={15} className="text-gray-400" />
                  </div>
                  <div>
                    <div className="text-base font-black text-white">{value}</div>
                    <div className="text-[11px] text-gray-600 font-medium">{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ─── Main Feed ─── */}
        <div className="flex-1 min-w-0">
          {/* Search result notice */}
          {searchQuery && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>
                  Results for "{searchQuery}"
                </h2>
                <p className="text-sm text-gray-500 mt-1">{blogs.length} stories found</p>
              </div>
              <Link to="/" className="text-xs text-gray-500 hover:text-white transition-colors">
                ← Clear search
              </Link>
            </div>
          )}

          {/* ─── Category Tabs ─── */}
          {!searchQuery && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className={`tag-pill flex-shrink-0 ${activeCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* ─── For You / Trending tabs (logged in) ─── */}
          {user && !searchQuery && (
            <div className="flex items-center gap-6 mb-6 border-b border-white/[0.06] pb-4">
              <div className="flex items-center gap-2 text-white font-semibold text-sm border-b-2 border-white pb-4 -mb-4">
                <Sparkles size={14} /> For You
              </div>
              <Link to="/trending" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors font-semibold text-sm">
                <Flame size={14} /> Trending
              </Link>
            </div>
          )}

          {/* ─── Blog Grid ─── */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <BlogCardSkeleton key={i} />)}
            </div>
          ) : blogs.length === 0 ? (
            <div className="py-24 text-center surface rounded-2xl">
              <BookOpen size={48} className="mx-auto mb-4 text-white/10" />
              <p className="text-gray-500 font-semibold text-sm">
                {searchQuery ? 'No results found' : 'No stories yet'}
              </p>
              {!searchQuery && (
                <Link to="/create-blog" className="mt-6 btn-primary px-6 py-2.5 text-sm inline-flex">
                  Write the first story
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {blogs.map((blog, idx) => (
                <BlogCard key={blog._id} blog={blog} index={idx} />
              ))}
            </div>
          )}
        </div>

        {/* ─── Sidebar ─── */}
        <aside className="hidden lg:block w-80 flex-shrink-0 space-y-6">
          {/* Trending Now */}
          {trendingBlogs.length > 0 && (
            <div className="surface rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame size={15} className="text-orange-400" /> Trending
                </h3>
                <Link to="/trending" className="text-[11px] text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                  See all <ChevronRight size={12} />
                </Link>
              </div>
              <div className="space-y-1">
                {trendingBlogs.slice(0, 4).map((blog, idx) => (
                  <Link key={blog._id} to={`/blog/${blog.slug}`} className="flex items-start gap-3 group py-2.5 hover:opacity-75 transition-opacity">
                    <span className="text-xs font-black text-gray-700 mt-0.5 w-5 flex-shrink-0">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-white line-clamp-2 leading-snug group-hover:text-gray-300 transition-colors">
                        {blog.title}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-1 flex items-center gap-1.5">
                        {blog.author?.fullName}
                        <span>·</span>
                        {blog.readTime} min
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          <div className="surface rounded-2xl p-5">
            <h3 className="text-sm font-bold text-white mb-4">Explore Topics</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.filter(c => c !== 'All').map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(cat)}
                  className="tag-pill text-[11px]"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Top Writers */}
          {topWriters.length > 0 && (
            <div className="surface rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Award size={15} className="text-blue-400" /> Top Writers
              </h3>
              <div className="space-y-4">
                {topWriters.map((writer) => (
                  <Link key={writer._id} to={`/profile/${writer.username}`} className="flex items-center gap-3 group">
                    <img 
                      src={writer.avatar || `https://ui-avatars.com/api/?name=${writer.fullName}&background=222&color=fff`} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-white/20 transition-all" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-bold text-white group-hover:underline truncate">{writer.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{writer.followersCount} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA for non-logged users */}
          {!user && (
            <div className="surface rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse at 80% 0%, hsla(220,90%,60%,0.1) 0%, transparent 70%)',
              }} />
              <div className="relative">
                <h3 className="text-sm font-bold text-white mb-1.5">Start writing today</h3>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-4">
                  Share your ideas with thousands of curious readers.
                </p>
                <Link to="/register" className="btn-primary w-full text-center py-2.5 text-[13px] block">
                  Create free account
                </Link>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Home;
