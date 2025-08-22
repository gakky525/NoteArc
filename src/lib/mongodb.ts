import mongoose from 'mongoose';

const DEFAULT_LOCAL_URI = 'mongodb://mongo:27017/notearc-dev';
const MONGODB_URI = process.env.MONGODB_URI ?? DEFAULT_LOCAL_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// mongoose.set('strictQuery', false); // Zodなどと合わせる場合

declare global {
  // dev 環境での HMR による再読み込み時の接続多重化を防ぐ
  var __mongoose__:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

let cached = global.__mongoose__ ?? { conn: null, promise: null };

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      // Mongoose のオプション（必要に応じて追加）
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  global.__mongoose__ = cached;
  return cached.conn;
}

export async function dbDisconnect() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached = { conn: null, promise: null };
    global.__mongoose__ = cached;
  }
}

export default connectToDatabase;
