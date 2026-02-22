import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  verified: boolean;
  locked?: boolean;
  manifestMaxVideos?: number;
  interests?: string[];
  bio?: string;
  lastSeen?: Date;
  address?: {
    full?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      full: {
        type: String,
        trim: true,
        default: '',
      },
      street: {
        type: String,
        trim: true,
        default: '',
      },
      city: {
        type: String,
        trim: true,
        default: '',
      },
      state: {
        type: String,
        trim: true,
        default: '',
      },
      pincode: {
        type: String,
        trim: true,
        default: '',
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    locked: {
      type: Boolean,
      default: false,
      index: true,
    },
    manifestMaxVideos: {
      type: Number,
      default: 3,
      min: 1,
    },
    interests: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    lastSeen: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
  },
  {
    timestamps: true,
  }
);


// Ensure virtuals are included when converting to JSON/Object
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

// Ensure a unique index exists on email only. Phone is NOT unique.
// Note: This is explicit so duplicate-key errors are only for email.
UserSchema.index({ email: 1 }, { unique: true });

if (mongoose.models.User) {
  mongoose.deleteModel('User');
}
const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default User;
