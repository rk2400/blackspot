import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommunityTopic extends Document {
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityTopicSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '', trim: true },
    imageUrl: { type: String, default: '', trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

CommunityTopicSchema.set('toObject', { virtuals: true });
CommunityTopicSchema.set('toJSON', { virtuals: true });
CommunityTopicSchema.index({ slug: 1 }, { unique: true });

if (mongoose.models.CommunityTopic) {
  mongoose.deleteModel('CommunityTopic');
}
const CommunityTopic: Model<ICommunityTopic> = mongoose.model<ICommunityTopic>('CommunityTopic', CommunityTopicSchema);

export default CommunityTopic;
