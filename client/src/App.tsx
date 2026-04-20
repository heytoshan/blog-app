import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateBlog from './pages/CreateBlog';
import BlogDetail from './pages/BlogDetail';
import Profile from './pages/Profile';
import Trending from './pages/Trending';
import Bookmarks from './pages/Bookmarks';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const { user, checkAuth, checkingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#080808]">
        <div className="flex flex-col items-center gap-4">
          <div className="text-2xl font-black text-white" style={{ letterSpacing: '-0.04em' }}>
            BLOGY<span className="text-white/30">.</span>
          </div>
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/bookmarks" element={user ? <Bookmarks /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          <Route path="/create-blog" element={user ? <CreateBlog /> : <Navigate to="/login" replace />} />
          <Route path="/admin" element={user && user.role === 'admin' ? <Admin /> : <Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.8)',
          },
          success: { iconTheme: { primary: '#4ade80', secondary: '#000' } },
          error: { iconTheme: { primary: '#f87171', secondary: '#000' } },
        }}
      />
    </div>
  );
}

export default App;
