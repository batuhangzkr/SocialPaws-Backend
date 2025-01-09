import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface INotification extends Document {
  user: ObjectId;
  type: 'like' | 'comment' | 'breeding' | 'message';
  content: string;
  isRead: boolean;
  relatedItemId?: ObjectId;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'breeding', 'message'], required: true },
  content: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  relatedItemId: { type: Schema.Types.ObjectId, required: false },
  createdAt: { type: Date, default: Date.now },
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
