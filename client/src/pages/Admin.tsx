import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useBlogStore } from '../store/useBlogStore';
import { Navigate, Link } from 'react-router-dom';
import axios from '../lib/axios';
import toast from 'react-hot-toast';
import { Users, FileText, Trash2, Loader2, Search, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Admin = () => {
  const { user } = useAuthStore();
  const { blogs, fetchBlogs, deleteBlog } = useBlogStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [activeTab, setActiveTab] = useState<'blogs' | 'users'>('blogs');
  const [search, setSearch] = useState('');

  // Protect route
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchBlogs({ limit: 100 });
  }, [fetchBlogs]);

  useEffect(() => {
    if (activeTab === 'users') {
      const fetchAllUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await axios.get('/users');
          setUsers(res.data.data);
        } catch {
          toast.error('Failed to load users');
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchAllUsers();
    }
  }, [activeTab]);

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure? This will delete the user and all their blogs permanently.')) return;
    try {
      await axios.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      fetchBlogs({ limit: 100 }); // Refresh blogs
      toast.success('User deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleAdminDeleteBlog = async (blogId: string) => {
    if (!window.confirm('Delete this blog post?')) return;
    await deleteBlog(blogId);
  };

  const filteredBlogs = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author?.username.includes(search.toLowerCase()));
  const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.03em' }}>Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage content and users across the platform.</p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-700 focus:outline-none focus:border-white/20 transition-all"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="surface rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Total Stories</p>
            <p className="text-3xl font-black text-white">{blogs.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FileText size={20} className="text-blue-400" />
          </div>
        </div>
        <div className="surface rounded-2xl p-6 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">Total Users</p>
            <p className="text-3xl font-black text-white">{activeTab === 'users' ? users.length : '—'}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Users size={20} className="text-purple-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 p-1 surface rounded-xl w-fit">
        <button
          onClick={() => { setActiveTab('blogs'); setSearch(''); }}
          className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
            activeTab === 'blogs' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
          }`}
        >
          Blogs Management
        </button>
        <button
          onClick={() => { setActiveTab('users'); setSearch(''); }}
          className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
            activeTab === 'users' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
          }`}
        >
          Users Management
        </button>
      </div>

      {/* Content */}
      <div className="surface rounded-2xl overflow-hidden">
        {activeTab === 'blogs' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/[0.02] border-b border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Author</th>
                  <th className="px-6 py-4">Stats</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredBlogs.map(blog => (
                  <motion.tr key={blog._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 max-w-sm">
                        <img src={blog.featuredImage || 'https://via.placeholder.com/150'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <Link to={`/blog/${blog.slug}`} className="font-semibold text-white truncate hover:underline">{blog.title}</Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/profile/${blog.author?.username}`} className="flex items-center gap-2 group">
                        <img src={blog.author?.avatar || `https://ui-avatars.com/api/?name=${blog.author?.username}&background=222&color=fff`} alt="" className="w-6 h-6 rounded-full" />
                        <span className="text-gray-400 group-hover:text-white transition-colors">{blog.author?.username}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-[12px]">
                      {blog.views} views · {blog.likes.length} likes
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-[12px]">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleAdminDeleteBlog(blog._id)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete Blog">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
                {filteredBlogs.length === 0 && (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No blogs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="flex justify-center p-10"><Loader2 className="animate-spin text-gray-500" /></div>
            ) : (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/[0.02] border-b border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Activity Log</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredUsers.map(u => (
                    <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.fullName}&background=222&color=fff`} alt="" className="w-8 h-8 rounded-full" />
                          <div>
                            <p className="font-semibold text-white">{u.fullName}</p>
                            <p className="text-[11px] text-gray-500">@{u.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${u.role === 'admin' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-white/5 text-gray-400 border-white/10'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-[12px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-[12px] min-w-[140px]">
                        {u.lastLogin ? (
                          <div className="flex flex-col">
                            <span className="text-gray-300">Last login: {new Date(u.lastLogin).toLocaleDateString()}</span>
                            <span className="text-[10px]">{new Date(u.lastLogin).toLocaleTimeString()}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600">No activity yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/profile/${u.username}`} className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all" title="View Profile">
                            <ArrowUpRight size={16} />
                          </Link>
                          {u.role !== 'admin' && (
                            <button onClick={() => handleDeleteUser(u._id)} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete User">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500 text-sm">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
