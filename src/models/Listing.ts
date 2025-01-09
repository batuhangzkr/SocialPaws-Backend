// import { Schema, model, Document, Types } from 'mongoose';
// import { ObjectId } from 'mongodb';

// export interface IComment extends Document {
//   user: ObjectId;
//   text: string;
//   createdAt: Date;
// }

// export interface IListing extends Document {
//   pet: ObjectId;
//   user: ObjectId;
//   type: string;
//   comments: IComment[];
//   likes: ObjectId[];
// }

// const CommentSchema = new Schema({
//   user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   text: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now }
// });

// const ListingSchema = new Schema({
//   pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
//   user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//   type: {
//     type: String,
//     required: true,
//     enum: ['sahiplendirme', 'çiftleştirme', 'kayıp'],
//   },
//   comments: [CommentSchema],
//   likes: [{
//     type: Schema.Types.ObjectId,
//     ref: 'User'
//   }],
// }, {
//   timestamps: true,
// });


// ListingSchema.pre('save', function (next) {
//   if (this.type === 'kayıp' && this.likes.length > 0) {
//     return next(new Error("Kayıp ilanlarına beğeni eklenemez."));
//   }
//   next();
// });

// export const Listing = model<IListing>('Listing', ListingSchema);
