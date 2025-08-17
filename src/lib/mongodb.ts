import mongoose from 'mongoose';

const uri = process.env.MONGODB_URI || '';

type Cached = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var __mongoose_cached__: Cached | undefined;
}

const cached: Cached =
  global.__mongoose_cached__ ?? (global.__mongoose_cached__ = { conn: null, promise: null });

export async function connectToDatabase() {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).then(mongoose => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
