import { create } from 'zustand';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
    bio?: string;
    followers?: any[];
  };
  categories: string[];
  tags: string[];
  isPublished: boolean;
  views: number;
  likes: string[];
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

interface BlogState {
  blogs: Blog[];
  trendingBlogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  trendingLoading: boolean;
  total: number;
  page: number;

  fetchBlogs: (params?: any) => Promise<void>;
  fetchTrendingBlogs: () => Promise<void>;
  fetchBlogBySlug: (slug: string) => Promise<void>;
  toggleLike: (blogId: string, userId: string) => Promise<void>;
  toggleBookmark: (blogId: string) => Promise<{ isBookmarked: boolean }>;
  createBlog: (formData: FormData) => Promise<Blog | null>;
  deleteBlog: (blogId: string) => Promise<void>;
  setCurrentBlog: (blog: Blog | null) => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  blogs: [],
  trendingBlogs: [],
  currentBlog: null,
  loading: false,
  trendingLoading: false,
  total: 0,
  page: 1,

  fetchBlogs: async (params = {}) => {
    set({ loading: true });
    try {
      const res = await axios.get('/blogs', { params });
      set({
        blogs: res.data.data.blogs,
        total: res.data.data.total,
        page: res.data.data.page,
      });
    } catch {
      toast.error('Failed to fetch blogs');
    } finally {
      set({ loading: false });
    }
  },

  fetchTrendingBlogs: async () => {
    set({ trendingLoading: true });
    try {
      const res = await axios.get('/blogs/trending', { params: { limit: 6 } });
      set({ trendingBlogs: res.data.data });
    } catch {
      // Silently fail — not critical
    } finally {
      set({ trendingLoading: false });
    }
  },

  fetchBlogBySlug: async (slug) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/blogs/s/${slug}`);
      set({ currentBlog: res.data.data });
    } catch {
      toast.error('Blog not found');
      set({ currentBlog: null });
    } finally {
      set({ loading: false });
    }
  },

  toggleLike: async (blogId, userId) => {
    // Optimistic update
    const updateBlogLikes = (blog: Blog) => {
      if (blog._id !== blogId) return blog;
      const likes = blog.likes || [];
      const isLiked = likes.some(id => typeof id === 'object' ? (id as any)._id === userId : id === userId);
      return {
        ...blog,
        likes: isLiked
          ? likes.filter(id => typeof id === 'object' ? (id as any)._id !== userId : id !== userId)
          : [...likes, userId],
      };
    };

    set(state => ({
      blogs: state.blogs.map(updateBlogLikes),
      trendingBlogs: state.trendingBlogs.map(updateBlogLikes),
      currentBlog: state.currentBlog ? updateBlogLikes(state.currentBlog) : null,
    }));

    try {
      await axios.patch(`/blogs/like/${blogId}`);
    } catch {
      // Revert on error
      set(state => ({
        blogs: state.blogs.map(updateBlogLikes),
        trendingBlogs: state.trendingBlogs.map(updateBlogLikes),
        currentBlog: state.currentBlog ? updateBlogLikes(state.currentBlog) : null,
      }));
      toast.error('Action failed');
    }
  },

  toggleBookmark: async (blogId) => {
    try {
      const res = await axios.patch(`/blogs/bookmark/${blogId}`);
      const isBookmarked = res.data.data.isBookmarked;
      toast.success(isBookmarked ? 'Saved to bookmarks' : 'Removed from bookmarks');
      return { isBookmarked };
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save bookmark');
      return { isBookmarked: false };
    }
  },

  createBlog: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post('/blogs/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const newBlog = res.data.data;
      set(prev => ({ blogs: [newBlog, ...prev.blogs] }));
      toast.success('Story published! 🎉');
      return newBlog;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Publish failed');
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteBlog: async (blogId) => {
    try {
      await axios.delete(`/blogs/${blogId}`);
      set(state => ({ blogs: state.blogs.filter(b => b._id !== blogId) }));
      toast.success('Blog deleted');
    } catch {
      toast.error('Delete failed');
    }
  },

  setCurrentBlog: (blog) => set({ currentBlog: blog }),
}));
