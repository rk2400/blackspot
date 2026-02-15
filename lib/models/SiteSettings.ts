import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  manifestMaxVideos: number;
  updatedAt: Date;
  createdAt: Date;
}

const SiteSettingsSchema: Schema = new Schema(
  {
    manifestMaxVideos: {
      type: Number,
      default: 3,
      min: 1,
      max: 50,
    },
  },
  {
    timestamps: true,
  }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
