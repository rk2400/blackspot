import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICommunityComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityCommentSchema: Schema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'CommunityPost', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

CommunityCommentSchema.set('toObject', { virtuals: true });
CommunityCommentSchema.set('toJSON', { virtuals: true });
CommunityCommentSchema.index({ post: 1, createdAt: 1 });

const CommunityComment: Model<ICommunityComment> =
  mongoose.models.CommunityComment || mongoose.model<ICommunityComment>('CommunityComment', CommunityCommentSchema);

export default CommunityComment;

