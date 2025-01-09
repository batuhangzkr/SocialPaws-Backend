import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface IMessage extends Document {
  conversation: ObjectId;
  sender: ObjectId;
  content: string;
  isFirstMessage: boolean;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  isFirstMessage: { type: Boolean, default: false },
  isRead: { type: Boolean, default: false },

}, {
  timestamps: true
});

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
