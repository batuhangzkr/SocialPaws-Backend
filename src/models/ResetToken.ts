import mongoose, { Document, Schema } from 'mongoose';


interface IResetToken extends Document {
    userId: string;
    token: string;
    expiryDate: Date;
}


const resetTokenSchema: Schema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

export const ResetToken = mongoose.model<IResetToken>('ResetToken', resetTokenSchema);