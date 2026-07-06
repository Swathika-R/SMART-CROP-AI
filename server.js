require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');

// Initialize Express App
const app = express();

// Security Headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: false // Allows client to fetch uploaded crop images statically
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy block'), false);
  },
  credentials: true
}));

// Express Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create public directory structure if missing
const publicDir = path.join(__dirname, 'public');
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Static Folders
app.use('/uploads', express.static(uploadsDir));

// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// Database Connection Hook
connectDB();

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    database: global.dbConnected ? 'MongoDB' : 'Local JSON Fallback',
    timestamp: new Date().toISOString()
  });
});

// Routes Mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/images', require('./routes/images'));
app.use('/api/market', require('./routes/market'));
app.use('/api/nlp', require('./routes/nlp'));
app.use('/api/users', require('./routes/users'));
app.use('/api/feedback', require('./routes/feedback'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Port configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CropAI Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
