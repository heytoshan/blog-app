import { Request, Response } from 'express';
import { Blog } from '../models/Blog';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { uploadOnCloudinary } from '../utils/cloudinary';
import { z } from 'zod';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(20, 'Content must be at least 20 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(250),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export const createBlog = asyncHandler(async (req: any, res: Response) => {
  const jsonBody = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
  const validation = blogSchema.safeParse(jsonBody);
  
  if (!validation.success) {
    throw new ApiError(400, 'Validation failed', validation.error.errors.map(e => e.message) as any);
  }

  const { title, content, excerpt, categories, tags, isPublished } = validation.data;

  let featuredImage;
  if (req.file) {
    const uploadResult = await uploadOnCloudinary(req.file.path);
    featuredImage = uploadResult?.secure_url;
  }

  const blog = await Blog.create({
    title,
    content,
    excerpt,
    categories,
    tags,
    isPublished,
    featuredImage,
    author: req.user?._id,
  });

  const populated = await Blog.findById(blog._id).populate('author', 'username fullName avatar');
  return res.status(201).json(new ApiResponse(201, populated, 'Blog created successfully'));
});

export const getBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search, tag, category, author } = req.query;

  const query: any = { isPublished: true };

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { excerpt: { $regex: search, $options: 'i' } },
      { tags: { $regex: search, $options: 'i' } },
    ];
  }

  if (tag) query.tags = tag;
  if (category) query.categories = category;
  if (author) query.author = author;

  const blogs = await Blog.find(query)
    .populate('author', 'username fullName avatar bio')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .skip((Number(page) - 1) * Number(limit));

  const total = await Blog.countDocuments(query);

  return res.status(200).json(new ApiResponse(200, { blogs, total, page: Number(page), limit: Number(limit) }, 'Blogs fetched successfully'));
});

export const getTrendingBlogs = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;

  // Trending = most views + likes in the past 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const blogs = await Blog.aggregate([
    { $match: { isPublished: true, createdAt: { $gte: thirtyDaysAgo } } },
    {
      $addFields: {
        score: {
          $add: [
            '$views',
            { $multiply: [{ $size: '$likes' }, 5] }, // likes weighted more
          ],
        },
      },
    },
    { $sort: { score: -1 } },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
        pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
      },
    },
    { $unwind: '$author' },
  ]);

  // If not enough recent, fall back to all-time top
  if (blogs.length < 4) {
    const allTime = await Blog.find({ isPublished: true })
      .populate('author', 'username fullName avatar')
      .sort({ views: -1, createdAt: -1 })
      .limit(Number(limit));
    return res.status(200).json(new ApiResponse(200, allTime, 'Trending blogs fetched'));
  }

  return res.status(200).json(new ApiResponse(200, blogs, 'Trending blogs fetched'));
});

export const getBlogBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, isPublished: true }).populate('author', 'username fullName avatar bio followers');

  if (!blog) {
    throw new ApiError(404, 'Blog not found');
  }

  blog.views += 1;
  await blog.save();

  return res.status(200).json(new ApiResponse(200, blog, 'Blog fetched successfully'));
});

export const getBlogById = asyncHandler(async (req: Request, res: Response) => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId).populate('author', 'username fullName avatar bio followers');
  if (!blog) throw new ApiError(404, 'Blog not found');
  return res.status(200).json(new ApiResponse(200, blog, 'Blog fetched successfully'));
});

export const toggleLike = asyncHandler(async (req: any, res: Response) => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId);

  if (!blog) throw new ApiError(404, 'Blog not found');

  const userId = req.user?._id;
  const isLiked = blog.likes.some(id => id.toString() === userId.toString());

  if (isLiked) {
    blog.likes = blog.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    blog.likes.push(userId);
  }

  await blog.save();

  return res.status(200).json(new ApiResponse(200, { isLiked: !isLiked, likesCount: blog.likes.length }, isLiked ? 'Unliked' : 'Liked'));
});

export const toggleBookmark = asyncHandler(async (req: any, res: Response) => {
  const { blogId } = req.params;
  const user = await User.findById(req.user?._id);

  if (!user) throw new ApiError(404, 'User not found');

  const isBookmarked = user.bookmarks.some(id => id.toString() === blogId);

  if (isBookmarked) {
    user.bookmarks = user.bookmarks.filter((id) => id.toString() !== blogId);
  } else {
    user.bookmarks.push(blogId as any);
  }

  await user.save();

  return res.status(200).json(new ApiResponse(200, { isBookmarked: !isBookmarked }, isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks'));
});

export const deleteBlog = asyncHandler(async (req: any, res: Response) => {
  const { blogId } = req.params;
  const blog = await Blog.findById(blogId);
  if (!blog) throw new ApiError(404, 'Blog not found');

  if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }

  await blog.deleteOne();
  return res.status(200).json(new ApiResponse(200, {}, 'Blog deleted'));
});
