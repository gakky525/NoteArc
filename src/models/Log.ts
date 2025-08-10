import mongoose, { Schema, Document, Model } from 'mongoose';

// TypeScriptの型定義
export interface ILog extends Document {
  title: string;
  content: string;
  date: Date;
  tags: string[];
}

const LogSchema = new Schema<ILog>(
  {
    title: { type: String, required: true, maxlength: 100 },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

// モデルの再利用（ホットリロード対策）
export const Log: Model<ILog> =
  mongoose.models.Log || mongoose.model<ILog>('Log', LogSchema);
