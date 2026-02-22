import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommunityPost extends Document {
  topic: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  likes: mongoose.Types.ObjectId[];
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityPostSchema: Schema = new Schema(
  {
    topic: { type: Schema.Types.ObjectId, ref: 'CommunityTopic', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '', trim: true },
    imageAlt: { type: String, default: '', trim: true },
    imageCaption: { type: String, default: '', trim: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    locked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommunityPostSchema.set('toObject', { virtuals: true });
CommunityPostSchema.set('toJSON', { virtuals: true });
CommunityPostSchema.index({ topic: 1, createdAt: -1 });

if (mongoose.models.CommunityPost) {
  mongoose.deleteModel('CommunityPost');
}
const CommunityPost: Model<ICommunityPost> = mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);

export default CommunityPost;
