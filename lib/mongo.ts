import mongoose from 'mongoose';
import logger from '@/lib/logger';

const MONGODB_URI = process.env.MONGODB_URI;

const cached = globalThis as unknown as { mongoose?: typeof mongoose };

if (!cached.mongoose) {
  cached.mongoose = mongoose;
  mongoose.set('strictQuery', true);
}

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    logger.warn('MONGODB_URI is not set. Skipping database connection.');
    throw new Error('MONGODB_URI is not configured');
  }

  if (!cached.mongoose) {
    cached.mongoose = mongoose;
  }

  if (cached.mongoose.connection?.readyState === 1) {
    return cached.mongoose;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('MongoDB connected successfully');
    return cached.mongoose;
  } catch (error: any) {
    logger.error('MongoDB connection failed:', error.message);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}
