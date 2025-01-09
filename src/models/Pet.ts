import mongoose, { Schema, model, Document, ObjectId } from 'mongoose';





export interface IPet extends Document {
  name: string;
  species: string;
  gender: string;
  age: number;
  breed: string;
  isNeutered: boolean;
  size: string;
  weight: number;
  personalityTraits: string;
  vaccinationStatus: string;
  vaccinationDescription: string;
  AdoptionDescription: string;
  AdoptionLocation: string;
  lostDescription: string;
  lostLocation: string;
  healthStatus: string;
  microchipInfo: string;
  vetInfo: string;
  photos: string[];
  isLost: boolean;
  isForAdoption: boolean;
  isForBreeding: boolean;
  likes: mongoose.Types.ObjectId[];
  comments: ObjectId[];
  user: ObjectId;
}

const PetSchema: Schema = new Schema({
  name: { type: String, required: true },
  species: { type: String, required: true },
  gender: { type: String, required: true },
  breed: { type: String, required: true },
  age: { type: Number, required: true },
  isNeutered: { type: Boolean, required: true },
  size: { type: String, required: true },
  weight: { type: Number, required: false },
  personalityTraits: { type: String, required: false },
  vaccinationStatus: { type: String, required: false },
  vaccinationDescription: { type: String, required: false },
  healthStatus: { type: String, required: false },
  microchipInfo: { type: String, required: false },
  vetInfo: { type: String, required: false },
  photos: { type: [String], required: false },
  isLost: { type: Boolean, default: false },
  lostDescription: { type: String, required: false },
  lostLocation: { type: String, required: false },
  AdoptionDescription: { type: String, required: false },
  AdoptionLocation: { type: String, required: false },
  isForAdoption: { type: Boolean, default: false },
  isForBreeding: { type: Boolean, default: false },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true,
});

export const Pet = model<IPet>('Pet', PetSchema);
