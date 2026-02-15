import mongoose, { Schema, Document, Model } from 'mongoose';
 
 export interface IJournal extends Document {
   owner: string;
   title: string;
   content: string;
  imageUrl?: string;
   createdAt: Date;
   updatedAt: Date;
 }
 
 const JournalSchema: Schema = new Schema(
   {
     owner: {
       type: String,
       required: true,
       index: true,
       lowercase: true,
       trim: true,
     },
     title: {
       type: String,
       trim: true,
       default: '',
     },
     content: {
       type: String,
       required: true,
       trim: true,
     },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
   },
   {
     timestamps: true,
   }
 );
 
 JournalSchema.index({ owner: 1, createdAt: -1 });
 
if (mongoose.models.Journal) {
  mongoose.deleteModel('Journal');
}
const Journal: Model<IJournal> = mongoose.model<IJournal>('Journal', JournalSchema);
 
 export default Journal;
