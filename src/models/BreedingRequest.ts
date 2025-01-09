import mongoose, { Schema, Document } from 'mongoose';

export interface IBreedingRequest extends Document {
  requester: mongoose.Schema.Types.ObjectId;
  requesterPet: mongoose.Schema.Types.ObjectId;
  recipient: mongoose.Schema.Types.ObjectId;
  recipientPet: mongoose.Schema.Types.ObjectId;
  status: string;
}

const BreedingRequestSchema: Schema = new Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requesterPet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipientPet: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

export const BreedingRequest = mongoose.model<IBreedingRequest>('BreedingRequest', BreedingRequestSchema);
