import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import connectDB from './config/db.js';
import { seedDatabase } from './utils/seeder.js';
import { errorHandler, notFound } from './middlewares/error.js';
import { initSocket } from './socket/socketHandler.js';
import { startInventoryCron } from './cron/inventoryCron.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import pizzaRoutes from './routes/pizzaRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  // Run Database Seeder after connection
  seedDatabase();
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Automated Crons
startInventoryCron();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        process.env.FRONTEND_URL,
        process.env.CLIENT_URL,
        'https://pizza-hut-app.vercel.app'
      ].filter(Boolean);
      
      const cleanedOrigins = allowedOrigins.map(o => o.endsWith('/') ? o.slice(0, -1) : o);
      const cleanedOrigin = origin && origin.endsWith('/') ? origin.slice(0, -1) : origin;

      if (!origin || cleanedOrigins.includes(cleanedOrigin) || cleanedOrigin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

// Logging Middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
  app.use(morgan('dev'));
}

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 150, // Limit each IP to 150 requests per minute
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication requests per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply general API rate limiter
app.use('/api', apiLimiter);

// Bind API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/notifications', notificationRoutes);

// Base route checks
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PizzaGo Delivery & Inventory API is running.',
    timestamp: new Date()
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server executing in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
