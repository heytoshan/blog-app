import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, User, AtSign, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', username: '', email: '', password: '' });
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-220px)] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link to="/" className="text-3xl font-black tracking-tighter text-white" style={{ letterSpacing: '-0.04em' }}>
            BLOGY<span className="text-white/30">.</span>
          </Link>
          <h1 className="text-xl font-bold text-white mt-6 mb-1" style={{ letterSpacing: '-0.02em' }}>
            Create your account
          </h1>
          <p className="text-sm text-gray-500">Start sharing your ideas with the world</p>
        </div>

        <div className="surface rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  id="register-fullname"
                  type="text"
                  required
                  placeholder="Alex Thompson"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Username</label>
              <div className="relative">
                <AtSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  id="register-username"
                  type="text"
                  required
                  placeholder="alex_writes"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '_') })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  id="register-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" />
                <input
                  id="register-password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>Create account <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/[0.06] text-center">
            <p className="text-[13px] text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-white hover:underline underline-offset-3">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
