import { create } from 'zustand';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  role: string;
  followers: any[];
  following: any[];
  bookmarks: string[];
}

interface AuthState {
  user: User | null;
  loading: boolean;
  checkingAuth: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
  updateBookmarks: (blogId: string, isBookmarked: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axios.get('/auth/current-user');
      set({ user: res.data.data });
    } catch {
      set({ user: null });
    } finally {
      setTimeout(() => set({ checkingAuth: false }), 50);
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      await axios.post('/auth/register', data);
      toast.success('Account created! Please log in.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      set({ loading: false });
    }
  },

  login: async (data) => {
    set({ loading: true });
    try {
      const res = await axios.post('/auth/login', data);
      set({ user: res.data.data.user });
      toast.success(`Welcome back, ${res.data.data.user.fullName.split(' ')[0]}! 👋`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    try {
      await axios.post('/auth/logout');
    } catch {
      // Ignore server errors on logout
    } finally {
      // Always clear local state regardless of server response
      set({ user: null });
      localStorage.removeItem('user');
      sessionStorage.clear();
      toast.success('Logged out successfully');
    }
  },

  updateProfile: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.patch('/users/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      set({ user: res.data.data });
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      set({ loading: false });
    }
  },

  updateBookmarks: (blogId, isBookmarked) => {
    const user = get().user;
    if (!user) return;
    const currentBookmarks = user.bookmarks || [];
    const bookmarks = isBookmarked
      ? [...currentBookmarks, blogId]
      : currentBookmarks.filter(id => id !== blogId);
    set({ user: { ...user, bookmarks } });
  },
}));
