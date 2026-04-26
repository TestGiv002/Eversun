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
    return cached.mongoose!;
  }

  if (!cached.mongoose) {
    cached.mongoose = mongoose;
  }

  if (cached.mongoose.connection?.readyState) {
    return cached.mongoose;
  }

  await mongoose.connect(MONGODB_URI);
  return cached.mongoose;
}
