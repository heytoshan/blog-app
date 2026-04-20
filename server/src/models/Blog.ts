import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: mongoose.Types.ObjectId;
  categories: string[];
  tags: string[];
  isPublished: boolean;
  views: number;
  likes: mongoose.Types.ObjectId[];
  readTime: number;
}

const blogSchema: Schema<IBlog> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      maxlength: [250, 'Excerpt cannot exceed 250 characters'],
    },
    featuredImage: {
      type: String, // cloudinary url
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    categories: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    readTime: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }

  // Basic read time estimation (roughly 200 words per minute)
  const words = this.content.split(/\s+/).length;
  this.readTime = Math.ceil(words / 200);

  next();
});

export const Blog = mongoose.model<IBlog>('Blog', blogSchema);
