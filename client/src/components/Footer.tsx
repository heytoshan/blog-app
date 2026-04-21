import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Rss, Globe, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';
import axios from '../lib/axios';

const Footer = () => {
  const { user } = useAuthStore();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please login first to subscribe');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      const res = await axios.post('/newsletter/subscribe', { email });
      toast.success('Thanks for subscribing to our newsletter!');
      
      // If there is an ethereal test URL provided in dev...
      if (res.data?.data?.previewUrl) {
        console.log("Email Preview URL:", res.data.data.previewUrl);
        toast.success(
          <span>Developer Preview: <a href={res.data.data.previewUrl} target="_blank" rel="noreferrer" className="underline">View Email</a></span>, 
          { duration: 6000 }
        );
      }
      
      setEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const columns = [
    {
      title: 'Explore',
      links: [
        { label: 'Discover', href: '/' },
        { label: 'Trending', href: '/trending' },
        { label: 'Saved Stories', href: '/bookmarks' },
        { label: 'Write a story', href: '/create-blog' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
  ];

  return (
    <footer className="border-t border-white/[0.06] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="text-xl font-black text-white" style={{ letterSpacing: '-0.04em' }}>
              BLOGY<span className="text-white/30">.</span>
            </Link>
            <p className="mt-4 text-[13px] text-gray-500 leading-relaxed max-w-xs">
              A platform for thoughtful writing. From engineers to designers, founders to thinkers — share ideas that matter.
            </p>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-2">
                Weekly newsletter
              </p>
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-[13px] text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all min-w-0"
                />
                <button 
                  type="submit" 
                  disabled={isSubscribing}
                  className="btn-primary px-4 py-2 text-[13px] flex-shrink-0 disabled:opacity-50"
                >
                  <Rss size={14} className={isSubscribing ? 'animate-pulse' : ''} />
                </button>
              </form>
            </div>
          </div>

          {/* Links */}
          {columns.map(col => (
            <div key={col.title}>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-4">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-[13px] text-gray-500 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-gray-700">
            © {year} BLOGY. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-[12px] text-gray-700 flex items-center gap-1.5">
              Made with <Heart size={11} className="text-red-500 fill-red-500" /> by{' '}
              <a href="#" className="text-gray-500 hover:text-white transition-colors">Toshan</a>
            </p>
            <div className="flex items-center gap-2">
              <a href="#" className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                <Globe size={15} />
              </a>
              <a href="#" className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/[0.05] transition-all">
                <Mail size={15} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
