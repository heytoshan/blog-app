import { Response } from 'express';
import { Comment } from '../models/Comment';
import { Blog } from '../models/Blog';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
  parentId: z.string().optional(),
});

export const addComment = asyncHandler(async (req: any, res: Response) => {
  const { blogId } = req.params;
  const validation = commentSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ApiError(400, 'Validation failed');
  }
  const { content, parentId } = validation.data;

  const blog = await Blog.findById(blogId);
  if (!blog) throw new ApiError(404, 'Blog not found');

  const comment = await Comment.create({
    content,
    author: req.user._id,
    blog: blogId,
    parent: parentId || null,
  });

  const populated = await Comment.findById(comment._id).populate('author', 'username fullName avatar');
  return res.status(201).json(new ApiResponse(201, populated, 'Comment added'));
});

export const getComments = asyncHandler(async (req: any, res: Response) => {
  const { blogId } = req.params;

  // Get top-level comments with their replies
  const comments = await Comment.find({ blog: blogId, parent: null, isDeleted: false })
    .populate('author', 'username fullName avatar')
    .sort({ createdAt: -1 });

  // Get replies for each comment
  const commentsWithReplies = await Promise.all(
    comments.map(async (comment) => {
      const replies = await Comment.find({ blog: blogId, parent: comment._id, isDeleted: false })
        .populate('author', 'username fullName avatar')
        .sort({ createdAt: 1 });
      return { ...comment.toObject(), replies };
    })
  );

  return res.status(200).json(new ApiResponse(200, commentsWithReplies, 'Comments fetched'));
});

export const deleteComment = asyncHandler(async (req: any, res: Response) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to delete this comment');
  }

  comment.isDeleted = true;
  await comment.save();

  return res.status(200).json(new ApiResponse(200, {}, 'Comment deleted'));
});

export const toggleCommentLike = asyncHandler(async (req: any, res: Response) => {
  const { commentId } = req.params;
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, 'Comment not found');

  const isLiked = comment.likes.includes(req.user._id);
  if (isLiked) {
    comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
  } else {
    comment.likes.push(req.user._id);
  }
  await comment.save();

  return res.status(200).json(new ApiResponse(200, { isLiked: !isLiked, likes: comment.likes.length }, isLiked ? 'Unliked' : 'Liked'));
});
