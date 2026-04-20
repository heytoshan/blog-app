import { Response } from 'express';
import { User } from '../models/User';
import { Blog } from '../models/Blog';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(160).optional(),
});

export const updateProfile = asyncHandler(async (req: any, res: Response) => {
  const validation = updateProfileSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, 'Validation failed', validation.error.errors.map(e => e.message) as any);
  }

  const { fullName, bio } = validation.data;
  const updateData: any = {};
  if (fullName) updateData.fullName = fullName;
  if (bio !== undefined) updateData.bio = bio;

  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    if (uploadResult) {
      updateData.avatar = uploadResult.secure_url;
    }
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: updateData },
    { new: true }
  ).select('-password');

  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

export const toggleFollow = asyncHandler(async (req: any, res: Response) => {
  const { targetUserId } = req.params;

  if (targetUserId === req.user?._id.toString()) {
    throw new ApiError(400, 'You cannot follow yourself');
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  const currentUser = await User.findById(req.user?._id);
  if (!currentUser) throw new ApiError(404, 'User not found');

  const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);

  if (isFollowing) {
    currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id.toString() !== req.user?._id.toString());
  } else {
    currentUser.following.push(targetUserId as any);
    targetUser.followers.push(req.user?._id);
  }

  await currentUser.save();
  await targetUser.save();

  return res.status(200).json(new ApiResponse(200, { isFollowing: !isFollowing, followersCount: targetUser.followers.length }, isFollowing ? 'Unfollowed' : 'Followed'));
});

export const getUserProfile = asyncHandler(async (req: any, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({ username })
    .select('-password')
    .populate('followers', 'username fullName avatar')
    .populate('following', 'username fullName avatar');

  if (!user) throw new ApiError(404, 'User not found');

  return res.status(200).json(new ApiResponse(200, user, 'User profile fetched successfully'));
});

export const getTopWriters = asyncHandler(async (req: any, res: Response) => {
  const { limit = 5 } = req.query;

  // Writers with most followers and published blogs
  const writers = await User.aggregate([
    {
      $addFields: {
        followersCount: { $size: '$followers' },
      },
    },
    { $sort: { followersCount: -1, createdAt: 1 } },
    { $limit: Number(limit) },
    {
      $project: {
        password: 0,
        googleId: 0,
        bookmarks: 0,
      },
    },
  ]);

  // Attach blog counts
  const writersWithBlogCount = await Promise.all(
    writers.map(async (writer) => {
      const blogCount = await Blog.countDocuments({ author: writer._id, isPublished: true });
      return { ...writer, blogCount };
    })
  );

  return res.status(200).json(new ApiResponse(200, writersWithBlogCount, 'Top writers fetched'));
});

export const getBookmarkedBlogs = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id).populate({
    path: 'bookmarks',
    populate: { path: 'author', select: 'username fullName avatar' },
    options: { sort: { createdAt: -1 } },
  });

  if (!user) throw new ApiError(404, 'User not found');

  return res.status(200).json(new ApiResponse(200, user.bookmarks, 'Bookmarks fetched'));
});

// Admin Controllers
export const getAllUsers = asyncHandler(async (req: any, res: Response) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, users, 'All users fetched'));
});

export const deleteUser = asyncHandler(async (req: any, res: Response) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (user.role === 'admin') {
    throw new ApiError(403, 'Cannot delete admin user');
  }

  // Delete all blogs by this user
  const Blog = (await import('../models/Blog')).Blog;
  await Blog.deleteMany({ author: userId });

  await user.deleteOne();

  return res.status(200).json(new ApiResponse(200, {}, 'User and associated data deleted successfully'));
});
