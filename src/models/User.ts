import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  profilePhoto?: string;
  pets: Types.ObjectId[];
  email: string;
  password: string;
  isVerified: boolean;
  verificationToken: string | null;
  country?: string;
  city?: string;
  district: string;
  localArea?: string;
  phoneNumber?: string;
  blockedUsers: Types.ObjectId[];
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  profilePhoto: { type: String, required: false },
  pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }],
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: { type: String, required: false },
  city: { type: String, required: false },
  district: { type: String, required: false },
  localArea: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null }
}, {
  timestamps: true
});

export const User = model<IUser>('User', UserSchema);
