import mongoose, { Schema, Document, Model } from 'mongoose';

export type EmailTemplateType =
  | 'ACCOUNT_WELCOME'
  | 'LOGIN_OTP'
  | 'NEWSLETTER_UPDATE'
  | 'GENERIC_NOTIFICATION'
  | 'CONTACT_CONFIRMATION'
  | 'CONTACT_NOTIFICATION'
  | 'MANIFEST_UNLOCK';

export interface IEmailTemplate extends Document {
  type: EmailTemplateType;
  subject: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const EmailTemplateSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ['ACCOUNT_WELCOME', 'LOGIN_OTP', 'NEWSLETTER_UPDATE', 'GENERIC_NOTIFICATION', 'CONTACT_CONFIRMATION', 'CONTACT_NOTIFICATION', 'MANIFEST_UNLOCK'],
      required: true,
      unique: true,
    },
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

let EmailTemplate: Model<IEmailTemplate>;
const existing = mongoose.models.EmailTemplate as Model<IEmailTemplate> | undefined;
if (existing) {
  const typePath: any = existing.schema.path('type');
  const enums: string[] | undefined = typePath?.options?.enum;
  if (!enums || !enums.includes('MANIFEST_UNLOCK')) {
    delete (mongoose.models as any).EmailTemplate;
    EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
  } else {
    EmailTemplate = existing;
  }
} else {
  EmailTemplate = mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);
}

export default EmailTemplate;
