const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');

// Load environment variables from .env.local for local development
// In production, use AWS Lambda environment variables
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config({ path: '.env.local' });
  } catch (err) {
    console.log('dotenv not available - using environment variables');
  }
}

const config = require('./config');
const jwtVerify = require('./middlewares/jwtverify');
const rbac = require('./middlewares/rbac');
const tenantGuard = require('./middlewares/tenantGaurd');
const apikeyAuth = require('./middlewares/apikeyAuth');
const { sendError } = require('./utils/response');

// Import routes
const authRoutes = require('./routes/v1/auth-route');
const userRoutes = require('./routes/v1/user-route');
const apikeyRoutes = require('./routes/v1/apikey-route');
const projectRoutes = require('./routes/v1/project-route');
const auditRoutes = require('./routes/v1/audit-route');


const app = express();

// ============ Express Configuration ============

// Trust proxy - Important for Lambda/API Gateway behind proxy
app.set('trust proxy', 1);

// ============ Security Middlewares ============

// Helmet - Set HTTP security headers
app.use(helmet());

// CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

// Rate Limiting - Global rate limit
const globalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Rate limiting for auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: false,
});

// ============ Body Parser Middlewares ============
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// ============ Request Logging Middleware ============
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ Routes ============

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// API v1 routes
const apiV1Router = express.Router();

// Public routes (no authentication required)
apiV1Router.use('/auth', authLimiter, authRoutes);

// Protected routes (JWT required)
apiV1Router.use('/users', jwtVerify, tenantGuard, userRoutes);
apiV1Router.use('/api-keys', jwtVerify, tenantGuard, apikeyRoutes);
apiV1Router.use('/projects', jwtVerify, tenantGuard, projectRoutes);
apiV1Router.use('/audit', jwtVerify, tenantGuard, auditRoutes);

app.use('/api/v1', apiV1Router);

// ============ Error Handling Middleware ============

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  sendError(res, err);
});

module.exports = app;

