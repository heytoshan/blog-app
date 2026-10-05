import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { ApiError } from './utils/ApiError';
import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';
import blogRouter from './routes/blog.routes';
import commentRouter from './routes/comment.routes';
import newsletterRouter from './routes/newsletter.routes';

import connectDB from './config/db';

const app = express();

// Ensure DB connection for incoming requests (vital for Vercel serverless functions)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

// Helper to normalize origins (strip trailing slashes)
const normalizeOrigin = (url: string) => url.trim().replace(/\/$/, '');

const configuredOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => normalizeOrigin(url))
  .filter(Boolean);

const defaultAllowedOrigins = [
  'https://bloggyapp.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
];

const allowedOrigins = Array.from(
  new Set([...configuredOrigins, ...defaultAllowedOrigins])
);

// Middlewares
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
      if (!origin) return callback(null, true);

      const cleanOrigin = normalizeOrigin(origin);

      // Allow all localhost origins during development
      if (/^http:\/\/localhost:\d+$/.test(cleanOrigin)) {
        return callback(null, true);
      }

      // Allow explicitly defined origins or any Vercel deployment domain (*.vercel.app)
      if (
        allowedOrigins.includes(cleanOrigin) ||
        /\.vercel\.app$/.test(cleanOrigin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));

// Rate limiting (200 requests per 15 minutes in dev)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'BLOGY API is running 🚀' });
});

// Basic health check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/blogs/:blogId/comments', commentRouter);
app.use('/api/v1/newsletter', newsletterRouter);

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // Handle other types of errors (generic)
  return res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export { app };
