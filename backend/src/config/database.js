import mongoose from 'mongoose';

// MongoDB connection options tailored for high-availability production environments
const mongoOptions = {
  // Pool Tuning: Limits concurrent socket connections to avoid database thread exhaustion
  maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE) || 50,
  minPoolSize: Number(process.env.MONGO_MIN_POOL_SIZE) || 5,

  // Timeout Enforcement: Fail fast to prevent request threads from hanging
  socketTimeoutMS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
  connectTimeoutMS: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 30000,
  serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 15000,
  
  // Health check: Periodically check socket status
  heartbeatFrequencyMS: Number(process.env.MONGO_HEARTBEAT_FREQUENCY_MS) || 10000,
};

/**
 * Establishes a connection to MongoDB with exponential backoff retries.
 * Useful in containerized environments (Docker/K8s) where MongoDB might start late.
 */
export async function connectDatabase(uri, retries = 5, delay = 2000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, mongoOptions);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) {
        throw new Error(`Database connection exhausted: failed after ${retries} attempts.`);
      }
      const backoffDelay = delay * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${backoffDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
    }
  }
}

/**
 * Hooks listeners for Mongoose connection states and registers graceful SIGINT/SIGTERM handlers.
 */
export function setupDatabaseListeners() {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connection active.');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB connection lost. Re-establishing link in background...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB connection restored.');
  });

  const shutdown = async (signal) => {
    if (mongoose.connection.readyState === 0) {
      console.log(`No active MongoDB connection, exiting cleanly via ${signal}.`);
      process.exit(0);
    }
    try {
      console.log(`Closing MongoDB connection pool cleanly via ${signal}...`);
      await mongoose.connection.close();
      console.log('MongoDB connection pool terminated. Exit success.');
      process.exit(0);
    } catch (err) {
      console.error('Error closing MongoDB connection pool during shutdown:', err.message);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}
