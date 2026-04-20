import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'author' | 'admin';
  lastLogin?: Date;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  bookmarks: mongoose.Types.ObjectId[];
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

const userSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
    },
    bio: {
      type: String,
      maxlength: [160, 'Bio cannot exceed 160 characters'],
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ['user', 'author', 'admin'],
      default: 'user',
    },
    lastLogin: {
      type: Date,
    },
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Blog',
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password as string, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id.toString(),
      email: this.email,
      username: this.username,
      role: this.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: (process.env.JWT_EXPIRES_IN || '30d') as any,
    }
  );
};

// Simplified for now, can separate access and refreshtoken later if needed.
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id.toString(),
    },
    process.env.JWT_SECRET as string, // Should use a separate secret in production
    {
      expiresIn: '90d' as any,
    }
  );
};

export const User = mongoose.model<IUser>('User', userSchema);
