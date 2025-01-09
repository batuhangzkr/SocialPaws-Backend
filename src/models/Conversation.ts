import mongoose, { Schema, Document, ObjectId, Types } from 'mongoose';

export interface IConversation extends Document {
  participants: ObjectId[];
  isApproved: boolean;
  blockedBy: ObjectId[];
  contextType: 'breeding' | 'adoption' | 'lost' | 'general';
  lastMessage: string;
  lastMessageTime: Date;
  lastMessageSender: Types.ObjectId;
  deletedFor: ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  isApproved: { type: Boolean, default: false },
  blockedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  contextType: { type: String, enum: ['breeding', 'adoption', 'lost', 'general'], default: 'general' },
  lastMessage: { type: String, default: '' },
  lastMessageTime: { type: Date, default: Date.now },
  lastMessageSender: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true
});

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);