import mongoose, { Document, Schema } from "mongoose";


interface IToken extends Document {
    token: string;
    expiryDate: Date;
}


const tokenSchema: Schema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

export const Token = mongoose.model<IToken>('Token', tokenSchema);