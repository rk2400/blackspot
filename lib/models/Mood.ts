 import mongoose, { Schema, Document, Model } from 'mongoose';
 
 export interface IMood extends Document {
   owner: string;
   score: number;
   note?: string;
   createdAt: Date;
   updatedAt: Date;
 }
 
 const MoodSchema: Schema = new Schema(
   {
     owner: {
       type: String,
       required: true,
       index: true,
       lowercase: true,
       trim: true,
     },
     score: {
       type: Number,
       required: true,
       min: 1,
       max: 5,
       index: true,
     },
     note: {
       type: String,
       trim: true,
       default: '',
     },
   },
   {
     timestamps: true,
   }
 );
 
 MoodSchema.index({ owner: 1, createdAt: -1 });
 
 const Mood: Model<IMood> = mongoose.models.Mood || mongoose.model<IMood>('Mood', MoodSchema);
 
 export default Mood;
