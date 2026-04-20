import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useBlogStore } from '../store/useBlogStore';
import axios from '../lib/axios';
import { motion } from 'framer-motion';
import {
  Camera, Loader2, Edit3, Check, LogOut,
  ChevronRight, PlusCircle, Bookmark, Trash2, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import { ProfileSkeleton } from '../components/Skeletons';

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile, loading: authLoading, logout } = useAuthStore();
  const { blogs, fetchBlogs, deleteBlog } = useBlogStore();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ fullName: '', bio: '' });
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/users/profile/${username}`);
        setProfileUser(res.data.data);
        setEditData({ fullName: res.data.data.fullName, bio: res.data.data.bio || '' });
        await fetchBlogs({ author: res.data.data._id });

        // Check if current user follows this profile
        if (currentUser) {
          setIsFollowing(currentUser.following?.some((id: any) => id === res.data.data._id || id._id === res.data.data._id));
        }
      } catch {
        toast.error('User not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    if (username) fetchProfile();
  }, [username, currentUser?._id]);

  useEffect(() => {
    if (activeTab === 'bookmarks' && isOwnProfile) {
      axios.get('/users/bookmarks').then(res => setBookmarkedBlogs(res.data.data || [])).catch(() => {});
    }
  }, [activeTab, isOwnProfile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const formData = new FormData();
      formData.append('avatar', e.target.files[0]);
      await updateProfile(formData);
      const freshUser = useAuthStore.getState().user;
      if (freshUser) setProfileUser((prev: any) => ({ ...prev, avatar: freshUser.avatar }));
    }
  };

  const handleUpdateProfile = async () => {
    const formData = new FormData();
    formData.append('fullName', editData.fullName);
    formData.append('bio', editData.bio);
    await updateProfile(formData);
    setProfileUser((prev: any) => ({ ...prev, ...editData }));
    setIsEditing(false);
  };

  const handleFollow = async () => {
    if (!currentUser) { toast.error('Login to follow'); return; }
    setFollowLoading(true);
    try {
      const res = await axios.post(`/users/follow/${profileUser._id}`);
      setIsFollowing(res.data.data.isFollowing);
      setProfileUser((prev: any) => ({
        ...prev,
        followers: res.data.data.isFollowing
          ? [...(prev.followers || []), currentUser._id]
          : (prev.followers || []).filter((id: any) => id !== currentUser._id),
      }));
    } catch { toast.error('Action failed'); }
    finally { setFollowLoading(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <ProfileSkeleton />;
  if (!profileUser) return null;

  const followerCount = profileUser.followers?.length || 0;
  const followingCount = profileUser.following?.length || 0;
  const joinDate = new Date(profileUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* ─── Profile Header ─── */}
      <div className="surface rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden">
        {/* Subtle gradient bg */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 40% at 100% 0%, hsla(220,90%,60%,0.05) 0%, transparent 60%)',
        }} />

        <div className="relative flex flex-col md:flex-row gap-8 items-start">
          {/* Avatar */}
          <div className="relative group flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden ring-2 ring-white/10">
              <img
                src={profileUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileUser.fullName)}&background=222&color=fff&size=200`}
                alt={profileUser.username}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            {isOwnProfile && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-2 bg-white text-black rounded-xl shadow-xl hover:scale-110 transition-transform"
              >
                {authLoading ? <Loader2 className="animate-spin" size={15} /> : <Camera size={15} />}
              </button>
            )}
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleAvatarChange} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    className="bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2 text-xl font-black text-white outline-none focus:border-white/25 mb-2 block"
                    value={editData.fullName}
                    onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                  />
                ) : (
                  <h1 className="text-2xl md:text-3xl font-black text-white mb-0.5" style={{ letterSpacing: '-0.03em' }}>
                    {profileUser.fullName}
                  </h1>
                )}
                <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
                  @{profileUser.username}
                  {profileUser.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-[10px] font-bold uppercase tracking-wider border border-yellow-500/20">
                      Admin
                    </span>
                  )}
                  <span className="text-gray-700">·</span>
                  <span className="text-gray-700 text-xs">Joined {joinDate}</span>
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {isOwnProfile ? (
                  <>
                    {isEditing ? (
                      <>
                        <button onClick={handleUpdateProfile} className="btn-primary px-4 py-2 text-xs flex items-center gap-1.5">
                          <Check size={13} /> Save
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn-ghost px-4 py-2 text-xs">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setIsEditing(true)} className="btn-ghost px-4 py-2 text-xs flex items-center gap-1.5">
                          <Edit3 size={13} /> Edit Profile
                        </button>
                        {currentUser?.role === 'admin' && (
                          <Link to="/admin" className="btn-ghost px-4 py-2 text-xs flex items-center gap-1.5">
                            <Settings size={13} /> Admin
                          </Link>
                        )}
                        <button onClick={handleLogout} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-white/[0.06] transition-all">
                          <LogOut size={13} /> Sign Out
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                      isFollowing
                        ? 'bg-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 border border-white/10'
                        : 'btn-primary'
                    }`}
                  >
                    {followLoading ? <Loader2 className="animate-spin" size={13} /> : isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-6">
              {isEditing ? (
                <textarea
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl p-3 text-sm text-gray-300 placeholder:text-gray-700 focus:outline-none focus:border-white/20 resize-none"
                  rows={3}
                  maxLength={160}
                  placeholder="Tell the world about yourself..."
                  value={editData.bio}
                  onChange={e => setEditData({ ...editData, bio: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
                  {profileUser.bio || (isOwnProfile ? 'No bio yet. Click "Edit Profile" to add one.' : 'No bio provided.')}
                </p>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/[0.06]">
              {[
                { label: 'Stories', value: blogs.length },
                { label: 'Followers', value: followerCount },
                { label: 'Following', value: followingCount },
              ].map(({ label, value }) => (
                <div key={label}>
                  <span className="block text-xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
                    {value.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-600 font-medium uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex items-center gap-1 mb-8 p-1 surface rounded-2xl w-fit">
        {[
          { key: 'posts', label: 'Stories', icon: <ChevronRight size={13} /> },
          ...(isOwnProfile ? [{ key: 'bookmarks', label: 'Saved', icon: <Bookmark size={13} /> }] : []),
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-black'
                : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Content ─── */}
      {activeTab === 'posts' ? (
        <div>
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog, idx) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  className="relative"
                >
                  <BlogCard blog={blog} index={idx} />
                  {isOwnProfile && (
                    <button
                      onClick={() => deleteBlog(blog._id)}
                      className="absolute top-3 right-3 p-1.5 bg-black/60 backdrop-blur-sm rounded-lg text-gray-400 hover:text-red-400 transition-colors z-10"
                      title="Delete story"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center surface rounded-2xl">
              <PlusCircle size={40} className="mx-auto mb-4 text-white/10" />
              <p className="text-sm text-gray-600 mb-6">
                {isOwnProfile ? "You haven't published any stories yet." : `${profileUser.fullName} hasn't published any stories yet.`}
              </p>
              {isOwnProfile && (
                <Link to="/create-blog" className="btn-primary px-6 py-2.5 text-sm">
                  Write your first story
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          {bookmarkedBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bookmarkedBlogs.map((blog, idx) => (
                <BlogCard key={blog._id} blog={blog} index={idx} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center surface rounded-2xl">
              <Bookmark size={40} className="mx-auto mb-4 text-white/10" />
              <p className="text-sm text-gray-600 mb-6">No saved stories yet.</p>
              <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Discover stories</Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
