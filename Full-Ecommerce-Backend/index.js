require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
// Generate unique request ID
const generateRequestId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Route imports
const ProductRoute = require("./routes/Product");
const UserRoute = require("./routes/User");
const CartRoute = require("./routes/Cart");
const WishRoute = require("./routes/Wishlist");
const CommentRoute = require("./routes/Comment");
const withoutRoutes = require("./routes/WithoutRegister");
const DeliveryAddressRoute = require("./routes/DeliveryAddress");
const NotificationRoute = require("./routes/Notification");
const CouponRoute = require("./routes/Coupon");
const RequestRoute = require("./routes/Request");

// Controller imports

// Initialize Express app
const app = express();

// Environment variables validation
const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : [];
const JWT_SECRET = process.env.JWTSECRET;

// Validate required environment variables
const requiredEnvVars = {
  MONGODB_URI: MONGODB_URI,
  JWTSECRET: JWT_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("❌ Error: Missing required environment variables:");
  missingVars.forEach(variable => {
    console.error(`   - ${variable}`);
  });
  process.exit(1);
}

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = generateRequestId();
  res.setHeader("X-Request-ID", req.id);
  next();
});

/* ==================== 🔹 1. CORS Configuration ==================== */
// CORS middleware - MUST be first
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Validate origin against allowed origins if specified
  if (ALLOWED_ORIGINS.length > 0) {
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else if (NODE_ENV === "development") {
      // In development, allow any origin
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
  } else {
    // If no allowed origins specified, allow requesting origin (backward compatible)
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, X-Request-ID');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization, X-Request-ID');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

/* ==================== 🔹 2. Security Middleware ==================== */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// Trust proxy for accurate IP addresses (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting - General API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === "production" ? 100 : 1000, // More lenient in development
  message: {
    status: "error",
    message: "Too many requests from this IP, please try again later.",
    retryAfter: "15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/health" || req.path === "/api/info";
  },
});

app.use("/api/", limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth endpoints to 5 requests per 15 minutes
  message: {
    status: "error",
    message: "Too many authentication attempts, please try again later.",
    retryAfter: "15 minutes",
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/user/login", authLimiter);
app.use("/api/user/register", authLimiter);

// Rate limiting for product creation/updates (admin endpoints)
const adminActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    status: "error",
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ==================== 🔹 3. Body Parsers & Static Files ==================== */
// Configure body parsers with appropriate limits
const JSON_LIMIT = process.env.JSON_LIMIT || "50mb";
const URL_ENCODED_LIMIT = process.env.URL_ENCODED_LIMIT || "50mb";

app.use(express.json({ 
  limit: JSON_LIMIT,
  verify: (req, res, buf) => {
    // Store raw body for potential signature verification
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: URL_ENCODED_LIMIT,
  parameterLimit: 10000,
}));
app.use(cookieParser());

// Serve static files
app.use("/images", express.static(path.join(__dirname, "/images"), {
  maxAge: NODE_ENV === "production" ? "1y" : "0", // Cache in production
  etag: true,
  lastModified: true,
}));

/* ==================== 🔹 4. Logging ==================== */
// Custom morgan token for request ID
morgan.token("id", (req) => req.id);
morgan.token("response-time-ms", (req, res) => {
  return `${res["response-time"]}ms`;
});

// Enhanced logging format
const logFormat = NODE_ENV === "development"
  ? ":method :url :status :response-time-ms - :id"
  : ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :id';

app.use(morgan(logFormat, {
  skip: (req) => {
    // Skip logging for health checks in production
    return NODE_ENV === "production" && (req.path === "/health" || req.path === "/api/info");
  },
}));

/* ==================== 🔹 5. Scheduled Tasks (Cron) ==================== */
// Cron jobs can be added here if needed

/* ==================== 🔹 6. Health Check & API Info Endpoints ==================== */
// Helper function to format uptime
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

// Health check endpoint
app.get("/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const healthStatus = {
    status: dbState === 1 ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    uptimeFormatted: formatUptime(process.uptime()),
    environment: NODE_ENV,
    database: {
      status: dbStates[dbState] || "unknown",
      readyState: dbState,
    },
    memory: {
      used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      unit: "MB",
    },
    version: process.version,
  };

  const statusCode = dbState === 1 ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

// API information endpoint
app.get("/api/info", (req, res) => {
  res.status(200).json({
    name: "Perfume E-commerce API",
    version: "1.0.0",
    environment: NODE_ENV,
    endpoints: {
      products: "/api/product",
      offers: "/api/offer",
      users: "/api/user",
      cart: "/api/cart",
      wishlist: "/api/wish",
      comments: "/api/comment",
      deliveryAddresses: "/api/delivery-address",
      notifications: "/api/notification",
      requests: "/api/request",
    },
    documentation: "See API documentation for details",
  });
});

/* ==================== 🔹 7. API Routes ==================== */
app.use("/api/product", ProductRoute);
app.use("/api/offer", require("./routes/Offer"));
app.use("/api/coupon", CouponRoute);
app.use("/api/user", UserRoute);
app.use("/api/cart", CartRoute);
app.use("/api/wish", WishRoute);
app.use("/api/comment", CommentRoute);
app.use("/api/without", withoutRoutes);
app.use("/api/delivery-address", DeliveryAddressRoute);
app.use("/api/notification", NotificationRoute);
app.use("/api/request", RequestRoute);

/* ==================== 🔹 8. Database Index Cleanup Helper ==================== */
const cleanupCartIndexes = async () => {
  try {
    const Cart = require("./models/Cart");
    const indexes = await Cart.collection.getIndexes();
    
    console.log('📋 Current Cart indexes:', Object.keys(indexes));
    
    const indexesToAlwaysDrop = [
      'user_product_unique_sparse',
      'user_1_product_1',
      'user_1_guest_1_product_1_featuredproduct_1',
      'user_1_guest_1_product_1'
    ];
    
    // Drop known problematic indexes
    for (const indexName of indexesToAlwaysDrop) {
      if (indexes[indexName]) {
        console.log(`⚠️ Dropping problematic index: ${indexName}`);
        try {
          await Cart.collection.dropIndex(indexName);
          console.log(`✅ Dropped index: ${indexName}`);
        } catch (dropErr) {
          if (dropErr.code !== 27) { // 27 = IndexNotFound
            console.log(`⚠️ Error dropping ${indexName}:`, dropErr.message);
            try {
              const indexSpec = indexes[indexName].key;
              await Cart.collection.dropIndex(indexSpec);
              console.log(`✅ Dropped ${indexName} using specification`);
            } catch (altErr) {
              console.log(`❌ Could not drop ${indexName}`);
            }
          }
        }
      }
    }
    
    // Drop any other indexes that include product-related fields
    for (const [indexName, indexInfo] of Object.entries(indexes)) {
      if (indexName === '_id_' || 
          indexName.includes('orderNumber') || 
          indexesToAlwaysDrop.includes(indexName)) {
        continue;
      }
      
      const indexKeys = Object.keys(indexInfo.key || {});
      const hasProductFields = indexKeys.some(key => 
        ['product', 
         'guest', 'user', 'isguest', 'isGuest'].includes(key.toLowerCase())
      );
      
      if (hasProductFields) {
        console.log(`⚠️ Dropping index with product fields: ${indexName}`);
        try {
          await Cart.collection.dropIndex(indexName);
          console.log(`✅ Dropped index: ${indexName}`);
        } catch (dropErr) {
          if (dropErr.code !== 27) {
            console.log(`Note: Could not drop ${indexName}:`, dropErr.message);
          }
        }
      }
    }
    
    // Ensure only the orderNumber index is created
    await Cart.ensureIndexes();
    
    // Final check for user_product_unique_sparse
    const finalIndexes = await Cart.collection.getIndexes();
    if (finalIndexes['user_product_unique_sparse']) {
      console.log('⚠️ user_product_unique_sparse still exists, attempting final drop...');
      try {
        await Cart.collection.dropIndex('user_product_unique_sparse');
        console.log('✅ Successfully dropped user_product_unique_sparse on second attempt');
      } catch (finalErr) {
        console.log('❌ Could not drop user_product_unique_sparse:', finalErr.message);
        console.log('⚠️ You may need to manually drop this index from MongoDB:');
        console.log('   db.carts.dropIndex("user_product_unique_sparse")');
      }
    }
    
    const veryFinalIndexes = await Cart.collection.getIndexes();
    console.log('📋 Final Cart indexes:', Object.keys(veryFinalIndexes));
    console.log('✅ Index cleanup complete - duplicate prevention now handled in application logic');
  } catch (err) {
    console.error('❌ Error during Cart index cleanup:', err.message);
  }
};

/* ==================== 🔹 9. Database Connection ==================== */
mongoose.set('strictQuery', true);

// MongoDB connection options
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  maxPoolSize: 10, // Maintain up to 10 socket connections
  minPoolSize: 5, // Maintain at least 5 socket connections
  retryWrites: true,
  w: 'majority',
};

// Connect to MongoDB with retry logic
const connectWithRetry = async (retries = 5, delay = 5000) => {
  try {
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log("✅ Connected to MongoDB successfully!");
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Cleanup indexes after a short delay to ensure models are loaded
    setTimeout(() => {
      cleanupCartIndexes();
    }, 2000);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB (${retries} retries left):`, error.message);
    
    if (retries > 0) {
      console.log(`⏳ Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(() => {
        connectWithRetry(retries - 1, delay);
      }, delay);
    } else {
      console.error("❌ Failed to connect to MongoDB after all retries. Exiting...");
      process.exit(1);
    }
  }
};

// Start connection
connectWithRetry();

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connection established');
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
  // Auto-reconnect is handled by mongoose, but we log it
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

/* ==================== 🔹 10. 404 Handler ==================== */
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
    path: req.originalUrl,
  });
});

/* ==================== 🔹 11. Global Error Handler ==================== */
app.use((err, req, res, next) => {
  // Log error with request ID
  console.error(`❌ [${req.id}] Error:`, {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  
  // Handle specific error types
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  
  // Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(", ");
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate entry. This record already exists.";
  }
  
  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }
  
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }
  
  // Send error response
  const errorResponse = {
    status: "error",
    message: message,
    requestId: req.id,
    timestamp: new Date().toISOString(),
  };
  
  // Include stack trace in development
  if (NODE_ENV === "development") {
    errorResponse.stack = err.stack;
    errorResponse.error = {
      name: err.name,
      code: err.code,
    };
  }
  
  res.status(statusCode).json(errorResponse);
});

/* ==================== 🔹 12. Server Startup ==================== */
const server = app.listen(PORT, () => {
  console.log("\n" + "=".repeat(50));
  console.log("🚀 Server Started Successfully!");
  console.log("=".repeat(50));
  console.log(`📦 Environment: ${NODE_ENV}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📚 API Info: http://localhost:${PORT}/api/info`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log(`🆔 Process ID: ${process.pid}`);
  console.log("=".repeat(50) + "\n");
});

/* ==================== 🔹 13. Graceful Shutdown ==================== */
let isShuttingDown = false;

const gracefulShutdown = (signal) => {
  if (isShuttingDown) {
    console.log("⚠️ Shutdown already in progress...");
    return;
  }
  
  isShuttingDown = true;
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  console.log("⏳ Waiting for active connections to close...");
  
  // Stop accepting new connections
  server.close(() => {
    console.log("✅ HTTP server closed");
    
    // Close MongoDB connection
    mongoose.connection.close(false, () => {
      console.log("✅ MongoDB connection closed");
      console.log("👋 Shutdown complete. Goodbye!");
      process.exit(0);
    });
  });
  
  // Force close after timeout
  const shutdownTimeout = setTimeout(() => {
    console.error("❌ Forcing shutdown after timeout");
    mongoose.connection.close(false);
    process.exit(1);
  }, 10000);
  
  // Clear timeout if shutdown completes
  process.once("exit", () => {
    clearTimeout(shutdownTimeout);
  });
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Promise Rejection:", {
    reason: reason?.message || reason,
    stack: reason?.stack,
    promise: promise,
  });
  
  // In production, log and continue; in development, shutdown
  if (NODE_ENV === "production") {
    // Log to error tracking service in production
    console.error("⚠️ Application continuing despite unhandled rejection");
  } else {
    gracefulShutdown("unhandledRejection");
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", {
    message: err.message,
    stack: err.stack,
  });
  
  // Uncaught exceptions are serious - always exit
  gracefulShutdown("uncaughtException");
});

// Handle warnings
process.on("warning", (warning) => {
  console.warn("⚠️ Process Warning:", warning.message);
  if (NODE_ENV === "development") {
    console.warn("Stack:", warning.stack);
  }
});