const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Routes = require("./routes/route.js");

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// --- CORS Configuration ---
// Allow both production Vercel domain and localhost for development
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001"
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies/auth headers
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight requests for 24 hours
};

// 1️⃣ Handle preflight requests for all routes
app.options("*", cors(corsOptions));

// 2️⃣ Apply CORS middleware to all other requests
app.use(cors(corsOptions));
// --- End CORS Configuration ---

// Connect to MongoDB with optimized settings
if (!process.env.MONGO_URL) {
  console.error("❌ ERROR: MONGO_URL is not defined in .env file!");
  console.error("Please create a .env file in the backend folder with:");
  console.error("MONGO_URL=mongodb://127.0.0.1:27017/school/teacher");
  console.error("Or use MongoDB Atlas connection string");
  process.exit(1);
}

// MongoDB connection options to prevent frequent reconnections
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10, // Maximum number of connections in the pool
  minPoolSize: 5, // Minimum number of connections to keep in the pool
  serverSelectionTimeoutMS: 5000, // Timeout for server selection
  socketTimeoutMS: 45000, // Socket timeout
  connectTimeoutMS: 10000, // Connection timeout
  family: 4, // Use IPv4, skip trying IPv6
  heartbeatFrequencyMS: 10000, // How often to check connection status
  retryWrites: true,
  w: 'majority'
};

// Global variable to track connection state
let isConnecting = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

const connectToMongoDB = async () => {
  if (isConnecting) {
    console.log("⚠️ MongoDB connection already in progress...");
    return;
  }

  if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
    console.error("❌ Max connection attempts reached. Please check your MongoDB service.");
    return;
  }

  isConnecting = true;
  connectionAttempts++;

  try {
    console.log(`🔄 Attempting MongoDB connection (attempt ${connectionAttempts})...`);
    
    await mongoose.connect(process.env.MONGO_URL, mongoOptions);
    
    console.log("✅ Connected to MongoDB successfully");
    console.log(`📊 Connection pool: max=${mongoOptions.maxPoolSize}, min=${mongoOptions.minPoolSize}`);
    
    // Reset connection attempts on successful connection
    connectionAttempts = 0;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    
    // Retry logic
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
      console.log(`⏳ Retrying connection in 3 seconds... (${connectionAttempts}/${MAX_CONNECTION_ATTEMPTS})`);
      setTimeout(connectToMongoDB, 3000);
    } else {
      console.error("💥 Failed to connect to MongoDB after multiple attempts");
      console.error("Please check if MongoDB is running:");
      console.error("1. For Docker: docker ps | grep mongo");
      console.error("2. For local: sudo systemctl status mongod");
      console.error("3. Connection URL:", process.env.MONGO_URL);
    }
  } finally {
    isConnecting = false;
  }
};

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
  
  // Attempt to reconnect if disconnected unexpectedly
  if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
    console.log('🔄 Attempting to reconnect...');
    setTimeout(connectToMongoDB, 2000);
  }
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconnected to MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 Mongoose connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Initialize MongoDB connection
connectToMongoDB();

// Middleware to check DB connection before handling requests
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) { // 1 = connected
    console.warn(`⚠️ DB not ready (state: ${mongoose.connection.readyState}) for ${req.method} ${req.url}`);
    
    // You can choose to reject requests or queue them
    if (req.method !== 'GET') {
      return res.status(503).json({ 
        error: 'Database temporarily unavailable',
        message: 'Please try again in a few moments'
      });
    }
  }
  
  // Log incoming requests
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root endpoint with health check
app.get("/", (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const statusMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    message: "Welcome to the School Management API!",
    database: {
      status: statusMap[dbStatus] || 'school',
      readyState: dbStatus,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    database: dbConnected ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Mount your routes
app.use("/", Routes);

// Error handler (catches CORS and other errors)
app.use((err, req, res, next) => {
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ 
      message: "Forbidden: Origin not allowed",
      allowedOrigins: allowedOrigins
    });
  }
  
  console.error(`🔥 Error: ${err.message}`);
  console.error(err.stack);
  
  res.status(500).json({ 
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Export the Express app for Vercel
module.exports = app;

// If run directly (not on Vercel), start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Database: ${process.env.MONGO_URL?.split('@').pop() || 'school'}`);
  });
}