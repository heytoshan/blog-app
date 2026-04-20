import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

interface JwtPayload {
  _id: string;
  role: string;
}

export const verifyJWT = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header('Authorization')?.replace('Bearer ', '');

      if (!token) {
        throw new ApiError(401, 'Unauthorized request');
      }

      const decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;

      const user = await User.findById(decodedToken?._id).select('-password');

      if (!user) {
        throw new ApiError(401, 'Invalid Access Token');
      }

      req.user = user;
      next();
    } catch (error: any) {
      console.error("JWT Verification Error:", error.message);
      throw new ApiError(401, error?.message || 'Invalid Access Token');
    }
  }
);

export const authorizeRole = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(
        403,
        `Role: ${req.user?.role} is not allowed to access this resource`
      );
    }
    next();
  };
};
