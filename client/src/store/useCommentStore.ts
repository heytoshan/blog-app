import { create } from 'zustand';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  blog: string;
  parent: string | null;
  likes: string[];
  isDeleted: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface CommentState {
  comments: Comment[];
  loading: boolean;
  submitting: boolean;

  fetchComments: (blogId: string) => Promise<void>;
  addComment: (blogId: string, content: string, parentId?: string) => Promise<void>;
  deleteComment: (blogId: string, commentId: string) => Promise<void>;
  toggleCommentLike: (blogId: string, commentId: string, userId: string) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  loading: false,
  submitting: false,

  fetchComments: async (blogId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`/blogs/${blogId}/comments`);
      set({ comments: res.data.data });
    } catch {
      // Silently fail
    } finally {
      set({ loading: false });
    }
  },

  addComment: async (blogId, content, parentId) => {
    set({ submitting: true });
    try {
      const res = await axios.post(`/blogs/${blogId}/comments`, { content, parentId });
      const newComment: Comment = { ...res.data.data, replies: [] };

      if (parentId) {
        // Add to the parent's replies
        set(state => ({
          comments: state.comments.map(c =>
            c._id === parentId
              ? { ...c, replies: [...(c.replies || []), newComment] }
              : c
          ),
        }));
      } else {
        // Add as top-level comment
        set(state => ({ comments: [newComment, ...state.comments] }));
      }

      toast.success('Comment posted!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      set({ submitting: false });
    }
  },

  deleteComment: async (blogId, commentId) => {
    try {
      await axios.delete(`/blogs/${blogId}/comments/${commentId}`);
      // Remove from top-level or replies
      set(state => ({
        comments: state.comments
          .filter(c => c._id !== commentId)
          .map(c => ({
            ...c,
            replies: (c.replies || []).filter(r => r._id !== commentId),
          })),
      }));
      toast.success('Comment deleted');
    } catch {
      toast.error('Delete failed');
    }
  },

  toggleCommentLike: async (blogId, commentId, userId) => {
    // Optimistic update helper
    const toggleLikeInList = (comments: Comment[]): Comment[] =>
      comments.map(c => {
        if (c._id === commentId) {
          const isLiked = c.likes.includes(userId);
          return {
            ...c,
            likes: isLiked ? c.likes.filter(id => id !== userId) : [...c.likes, userId],
          };
        }
        return { ...c, replies: toggleLikeInList(c.replies || []) };
      });

    set(state => ({ comments: toggleLikeInList(state.comments) }));

    try {
      await axios.patch(`/blogs/${blogId}/comments/${commentId}/like`);
    } catch {
      // Revert
      set(state => ({ comments: toggleLikeInList(state.comments) }));
    }
  },
}));
