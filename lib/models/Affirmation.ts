 import mongoose, { Schema, Document, Model } from 'mongoose';
 
 export type AffirmationMode = 'morning' | 'night';
 
 export interface IAffirmation extends Document {
   owner: string;
   mode: AffirmationMode;
   text: string;
   createdAt: Date;
   updatedAt: Date;
 }
 
 const AffirmationSchema: Schema = new Schema(
   {
     owner: {
       type: String,
       required: true,
       index: true,
       lowercase: true,
       trim: true,
     },
     mode: {
       type: String,
       enum: ['morning', 'night'],
       required: true,
       index: true,
     },
     text: {
       type: String,
       required: true,
       trim: true,
     },
   },
   {
     timestamps: true,
   }
 );
 
 AffirmationSchema.index({ owner: 1, mode: 1 });
 
 const Affirmation: Model<IAffirmation> =
   mongoose.models.Affirmation || mongoose.model<IAffirmation>('Affirmation', AffirmationSchema);
 
 export default Affirmation;
