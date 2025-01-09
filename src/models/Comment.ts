import { Schema, model, Document, ObjectId } from 'mongoose';

export interface IComment extends Document {
  user: ObjectId;
  text: string;
  pet: ObjectId;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Comment = model<IComment>('Comment', CommentSchema);
