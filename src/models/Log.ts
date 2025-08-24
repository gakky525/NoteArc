import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILog extends Document {
  title: string;
  content: string;
  date: Date;
  tags: string[];
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  guestTempId?: string;
}

const LogSchema = new Schema<ILog>(
  {
    title: { type: String, required: true, maxLength: 200 },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now },
    tags: [{ type: String }],
    userId: { type: String, required: true, index: true },
    guestTempId: { type: String, required: false, index: true },
  },
  { timestamps: true }
);

const Log: Model<ILog> =
  (mongoose.models.Log as Model<ILog>) || mongoose.model<ILog>('Log', LogSchema);

export { Log };
