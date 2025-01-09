import mongoose, { Schema, Document, ObjectId } from 'mongoose';

export interface ILike extends Document {
  user: ObjectId;
  pet: ObjectId;
}

const LikeSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
}, {
  timestamps: true
});

export const Like = mongoose.model<ILike>('Like', LikeSchema);
