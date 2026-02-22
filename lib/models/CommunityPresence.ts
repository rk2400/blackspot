import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommunityPresence extends Document {
  topic: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  typing: boolean;
  updatedAt: Date;
}

const CommunityPresenceSchema: Schema = new Schema(
  {
    topic: { type: Schema.Types.ObjectId, ref: 'CommunityTopic', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    typing: { type: Boolean, default: false },
    updatedAt: { type: Date, default: () => new Date(), expires: 120 },
  },
  { timestamps: true }
);

CommunityPresenceSchema.set('toObject', { virtuals: true });
CommunityPresenceSchema.set('toJSON', { virtuals: true });
CommunityPresenceSchema.index({ topic: 1, user: 1 }, { unique: true });

if (mongoose.models.CommunityPresence) {
  mongoose.deleteModel('CommunityPresence');
}
const CommunityPresence: Model<ICommunityPresence> = mongoose.model<ICommunityPresence>('CommunityPresence', CommunityPresenceSchema);

export default CommunityPresence;
