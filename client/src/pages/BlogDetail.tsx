import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlogStore } from '../store/useBlogStore';
import { useAuthStore } from '../store/useAuthStore';
import { useCommentStore } from '../store/useCommentStore';
import axiosInstance from '../lib/axios';
import { motion } from 'framer-motion';
import {
  Heart, MessageCircle, Bookmark, Share2, Clock, Eye,
  ChevronLeft, Send, Trash2, Heart as HeartIcon, Reply, X, Sparkles, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BlogDetailSkeleton } from '../components/Skeletons';
import BlogCard from '../components/BlogCard';


// Reading Progress Bar
const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div
      id="reading-progress"
      style={{ width: `${Math.min(progress, 100)}%` }}
    />
  );
};

// Comment Item
const CommentItem = ({
  comment,
  blogId,
  onReply,
}: {
  comment: any;
  blogId: string;
  onReply: (commentId: string, authorName: string) => void;
}) => {
  const { user } = useAuthStore();
  const { deleteComment, toggleCommentLike } = useCommentStore();
  const isLiked = user ? comment.likes.includes(user._id) : false;
  const isOwnComment = user?._id === comment.author?._id;

  return (
    <div className="py-4">
      <div className="flex gap-3">
        <img
          src={comment.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author?.fullName || 'U')}&background=222&color=fff&size=80`}
          alt=""
          className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <div className="surface-2 rounded-2xl rounded-tl-none px-4 py-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-white">{comment.author?.fullName}</span>
              <span className="text-[11px] text-gray-600">
                {new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{comment.content}</p>
          </div>

          <div className="flex items-center gap-3 mt-2 px-1">
            <button
              onClick={() => user && toggleCommentLike(blogId, comment._id, user._id)}
              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${isLiked ? 'text-red-400' : 'text-gray-600 hover:text-red-400'}`}
            >
              <HeartIcon size={11} className={isLiked ? 'fill-red-400' : ''} />
              {comment.likes.length > 0 && comment.likes.length}
            </button>
            {user && (
              <button
                onClick={() => onReply(comment._id, comment.author?.fullName)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-white transition-colors"
              >
                <Reply size={11} /> Reply
              </button>
            )}
            {isOwnComment && (
              <button
                onClick={() => deleteComment(blogId, comment._id)}
                className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-red-400 transition-colors ml-auto"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>

          {/* Replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-3 pl-4 border-l-2 border-white/[0.06] space-y-3">
              {comment.replies.map((reply: any) => (
                <CommentItem key={reply._id} comment={reply} blogId={blogId} onReply={onReply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Follow Button
const FollowButton = ({ authorId }: { authorId: string }) => {
  const { user } = useAuthStore();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (!user) { toast.error('Login to follow'); return; }
    setLoading(true);
    try {
      const res = await axiosInstance.post(`/users/follow/${authorId}`);
      setIsFollowing(res.data.data.isFollowing);
    } catch { toast.error('Action failed'); }
    finally { setLoading(false); }
  };

  if (!user || user._id === authorId) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
        isFollowing
          ? 'bg-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-white/10'
          : 'bg-white text-black hover:bg-gray-100'
      }`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currentBlog, fetchBlogBySlug, loading, toggleLike, toggleBookmark, blogs, fetchBlogs } = useBlogStore();
  const { user, updateBookmarks } = useAuthStore();
  const { comments, fetchComments, addComment, loading: commentsLoading, submitting } = useCommentStore();

  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (slug) {
      fetchBlogBySlug(slug);
      window.scrollTo(0, 0);
      setAiSummary(null); // Reset summary on new blog
    }
  }, [slug, fetchBlogBySlug]);

  useEffect(() => {
    if (currentBlog) {
      fetchComments(currentBlog._id);
      fetchBlogs({ category: currentBlog.categories?.[0], limit: 3 });
      setIsBookmarked((user?.bookmarks || []).includes(currentBlog._id));
    }
  }, [currentBlog?._id, user]);

  const readingDate = currentBlog ? new Date(currentBlog.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  }) : '';

  const handleGenerateSummary = async () => {
    if (aiSummary) return; // Already generated
    setGeneratingSummary(true);
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAiSummary(`✨ **AI Summary:** ${currentBlog?.excerpt} This article provides an in-depth look at this topic, highlighting key technical insights and practical takeaways for developers and designers.`);
    setGeneratingSummary(false);
  };

  const handleReply = (commentId: string, authorName: string) => {
    setReplyTo({ id: commentId, name: authorName });
    setShowComments(true);
    setTimeout(() => commentInputRef.current?.focus(), 100);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Login to comment'); return; }
    if (!commentText.trim() || !currentBlog) return;
    await addComment(currentBlog._id, commentText.trim(), replyTo?.id);
    setCommentText('');
    setReplyTo(null);
  };

  const handleBookmark = async () => {
    if (!user || !currentBlog) { toast.error('Login to bookmark'); return; }
    const result = await toggleBookmark(currentBlog._id);
    setIsBookmarked(result.isBookmarked);
    updateBookmarks(currentBlog._id, result.isBookmarked);
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: currentBlog?.title, url: window.location.href });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  if (loading && !currentBlog) return <BlogDetailSkeleton />;
  if (!currentBlog) return (
    <div className="text-center py-24 text-gray-500 font-semibold">Blog post not found.</div>
  );

  const isLiked = user ? (currentBlog.likes || []).includes(user._id) : false;

  // Format content with basic markdown-ish rendering
  const renderContent = (content: string) => {
    return content.split('\n\n').map((para, idx) => {
      if (para.startsWith('## ')) {
        return <h2 key={idx}>{para.replace('## ', '')}</h2>;
      }
      if (para.startsWith('### ')) {
        return <h3 key={idx}>{para.replace('### ', '')}</h3>;
      }
      if (para.startsWith('# ')) {
        return <h2 key={idx}>{para.replace('# ', '')}</h2>;
      }
      // Handle bold text (Basic)
      const parts = para.split(/(\*\*.*?\*\*)/g);
      const rendered = parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
      return <p key={idx}>{rendered}</p>;
    });
  };

  return (
    <>
      <ReadingProgress />

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-10 pb-32">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-white transition-colors mb-10 group"
        >
          <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </Link>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* ─── Main Article ─── */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 min-w-0"
          >
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-6">
              {currentBlog.categories?.map(cat => (
                <Link
                  key={cat}
                  to={`/?category=${cat}`}
                  className="tag-pill"
                >
                  {cat}
                </Link>
              ))}
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-5xl font-black text-white mb-8 leading-[1.1]"
              style={{ letterSpacing: '-0.03em' }}
            >
              {currentBlog.title}
            </h1>

            {/* Author row */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-white/[0.06]">
              <div className="flex items-center gap-4">
                <Link to={`/profile/${currentBlog.author?.username}`}>
                  <img
                    src={currentBlog.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentBlog.author?.fullName || 'U')}&background=222&color=fff&size=100`}
                    alt={currentBlog.author?.username}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10"
                  />
                </Link>
                <div>
                  <div className="flex items-center gap-2.5 mb-1">
                    <Link to={`/profile/${currentBlog.author?.username}`} className="text-sm font-bold text-white hover:underline underline-offset-2">
                      {currentBlog.author?.fullName}
                    </Link>
                    <FollowButton authorId={currentBlog.author?._id} />
                  </div>
                  <div className="flex items-center gap-3 text-[12px] text-gray-600 font-medium">
                    <span className="flex items-center gap-1"><Clock size={11} /> {currentBlog.readTime} min read</span>
                    <span className="flex items-center gap-1"><Eye size={11} /> {currentBlog.views.toLocaleString()} views</span>
                    <span>{readingDate}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleShare}
                className="btn-ghost px-4 py-2 text-[13px] flex items-center gap-2"
              >
                <Share2 size={14} /> Share
              </button>
            </div>

            {/* Featured Image */}
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-white/[0.06] mb-10 shadow-2xl">
              <img
                src={currentBlog.featuredImage || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1600&h=900&fit=crop'}
                alt={currentBlog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* AI Summary Block */}
            <div className="mb-10">
              {!aiSummary ? (
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="w-full py-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-center gap-3 group text-sm font-semibold text-gray-300"
                >
                  {generatingSummary ? (
                    <Loader2 size={18} className="animate-spin text-purple-400" />
                  ) : (
                    <Sparkles size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
                  )}
                  {generatingSummary ? 'Generating AI Summary...' : 'Generate AI Summary'}
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20 shadow-lg shadow-purple-500/5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="flex items-center gap-2 text-purple-400 font-bold text-sm tracking-wide uppercase"><Sparkles size={15} /> AI Summary</h3>
                    <button onClick={() => setAiSummary(null)} className="text-gray-500 hover:text-white transition-colors"><X size={15} /></button>
                  </div>
                  <div className="text-sm text-gray-300 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: aiSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </motion.div>
              )}
            </div>

            {/* Excerpt / Pull quote */}
            <blockquote className="border-l-[3px] border-white/20 pl-6 mb-10">
              <p className="text-lg text-gray-400 font-medium italic leading-relaxed">
                {currentBlog.excerpt}
              </p>
            </blockquote>

            {/* Content */}
            <div className="blog-content">
              {renderContent(currentBlog.content)}
            </div>

            {/* Tags */}
            {currentBlog.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/[0.06]">
                {currentBlog.tags.map(tag => (
                  <Link key={tag} to={`/?search=${tag}`} className="tag-pill">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* ─── Comments Section ─── */}
            <section className="mt-16 pt-8 border-t border-white/[0.06]">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2.5 text-base font-bold text-white mb-6 hover:opacity-75 transition-opacity"
              >
                <MessageCircle size={18} />
                Responses ({comments.length})
                <span className="text-gray-600 font-normal text-sm ml-1">{showComments ? '↑ hide' : '↓ show'}</span>
              </button>

              {showComments && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Comment Input */}
                  {user ? (
                    <form onSubmit={handleSubmitComment} className="mb-8">
                      {replyTo && (
                        <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 bg-white/[0.04] rounded-xl px-3 py-2">
                          <Reply size={12} /> Replying to <strong>{replyTo.name}</strong>
                          <button type="button" onClick={() => setReplyTo(null)} className="ml-auto hover:text-white">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=222&color=fff&size=80`}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-1"
                        />
                        <div className="flex-1">
                          <textarea
                            ref={commentInputRef}
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            placeholder="Share your thoughts..."
                            rows={3}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-white/20 resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              type="submit"
                              disabled={!commentText.trim() || submitting}
                              className="btn-primary px-5 py-2 text-[13px] flex items-center gap-2 disabled:opacity-40"
                            >
                              {submitting ? 'Posting...' : <><Send size={13} /> Post</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="surface rounded-2xl p-4 mb-6 text-center">
                      <p className="text-sm text-gray-500">
                        <Link to="/login" className="text-white font-semibold hover:underline">Sign in</Link> to leave a response
                      </p>
                    </div>
                  )}

                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-center py-8 text-sm text-gray-600">No responses yet. Be the first!</p>
                  ) : (
                    <div className="divide-y divide-white/[0.04]">
                      {comments.map(comment => (
                        <CommentItem key={comment._id} comment={comment} blogId={currentBlog._id} onReply={handleReply} />
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </section>
          </motion.article>

          {/* ─── Article Sidebar ─── */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Author bio card */}
              <div className="surface rounded-2xl p-5">
                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">Written by</h4>
                <div className="flex items-start gap-3">
                  <Link to={`/profile/${currentBlog.author?.username}`}>
                    <img
                      src={currentBlog.author?.avatar || `https://ui-avatars.com/api/?name=U&background=222&color=fff&size=80`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${currentBlog.author?.username}`} className="text-sm font-bold text-white hover:underline block">
                      {currentBlog.author?.fullName}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5 mb-2">{currentBlog.author?.followers?.length || 0} followers</p>
                    {currentBlog.author?.bio && (
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {currentBlog.author.bio}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <FollowButton authorId={currentBlog.author?._id} />
                </div>
              </div>

              {/* More stories */}
              {blogs.filter(b => b._id !== currentBlog._id).length > 0 && (
                <div className="surface rounded-2xl p-5">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-4">More Stories</h4>
                  {blogs.filter(b => b._id !== currentBlog._id).slice(0, 3).map(blog => (
                    <BlogCard key={blog._id} blog={blog} compact />
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ─── Fixed Floating Action Bar ─── */}
      <div className="fab-enter fixed bottom-8 left-1/2 -translate-x-1/2 glass-dark rounded-full px-6 py-3 flex items-center gap-4 shadow-2xl z-40 border border-white/[0.1]">
        <button
          onClick={() => user ? toggleLike(currentBlog._id, user._id) : toast.error('Login to like')}
          className={`flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-semibold transition-all ${
            isLiked ? 'text-red-400 bg-red-500/10' : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
          }`}
        >
          <Heart size={16} className={isLiked ? 'fill-red-400' : ''} />
          {currentBlog.likes.length}
        </button>

        <div className="w-px h-5 bg-white/10" />

        <button
          onClick={() => { setShowComments(true); setTimeout(() => commentInputRef.current?.focus(), 300); }}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-[13px] font-semibold text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <MessageCircle size={16} />
          {comments.length}
        </button>

        <div className="w-px h-5 bg-white/10" />

        <button
          onClick={handleBookmark}
          className={`p-2 rounded-full text-[13px] transition-all ${
            isBookmarked ? 'text-yellow-400 bg-yellow-500/10' : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10'
          }`}
        >
          <Bookmark size={16} className={isBookmarked ? 'fill-yellow-400' : ''} />
        </button>

        <button
          onClick={handleShare}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
        >
          <Share2 size={16} />
        </button>
      </div>
    </>
  );
};

export default BlogDetail;
