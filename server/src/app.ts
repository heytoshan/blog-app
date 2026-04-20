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

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      // Allow all localhost origins during development
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);

      // Allow the configured client URL in production
      if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
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
