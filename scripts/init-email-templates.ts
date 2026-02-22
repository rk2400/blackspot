/**
 * Initialize Email Templates
 * Run this script to create default email templates
 * 
 * Usage: npx ts-node scripts/init-email-templates.ts
 */

import mongoose from 'mongoose';
import EmailTemplate from '../lib/models/EmailTemplate';
import { dbConfig } from '../lib/config';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const logoUrl = `${baseUrl}/images/blackspot.jpeg`;

const defaultTemplates = [
  {
    type: 'ACCOUNT_WELCOME',
    subject: 'Welcome to {{appName}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${logoUrl}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <h2 style="margin:0 0 8px 0;font-size:24px;line-height:32px;">Hello {{userName}}, welcome</h2>
                  <p style="margin:0;font-size:16px;line-height:24px;">
                    {{appName}} is a gentle space to breathe, affirm, and reflect. We’re grateful you’re here.
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <div style="display:flex;gap:8px;">
                    <div style="flex:1;border:1px solid #ddd;border-radius:12px;padding:16px;">
                      <div style="font-weight:600;margin-bottom:4px;">Breathe</div>
                      <div>Calm your rhythm and settle into ease.</div>
                    </div>
                    <div style="flex:1;border:1px solid #ddd;border-radius:12px;padding:16px;">
                      <div style="font-weight:600;margin-bottom:4px;">Affirm</div>
                      <div>Speak kindly to your present and your path.</div>
                    </div>
                    <div style="flex:1;border:1px solid #ddd;border-radius:12px;padding:16px;">
                      <div style="font-weight:600;margin-bottom:4px;">Reflect</div>
                      <div>Notice small wins and gentle learnings.</div>
                    </div>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    type: 'LOGIN_OTP',
    subject: 'Your login code for {{appName}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${logoUrl}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <h2 style="margin:0 0 8px 0;font-size:22px;line-height:30px;">Hello {{userName}}</h2>
                  <p style="margin:0;font-size:16px;line-height:24px;">Use this code to sign in:</p>
                  <div style="margin:16px 0;padding:18px;border:1px solid #ddd;border-radius:12px;text-align:center;">
                    <div style="font-size:34px;line-height:42px;letter-spacing:2px;font-weight:800;">{{code}}</div>
                  </div>
                  <p style="margin:0;font-size:14px;line-height:22px;">Valid for {{expiry}} minutes.</p>
                  <p style="margin:12px 0 0 0;font-size:13px;line-height:20px;">If you didn’t request this, you can safely ignore this email.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    type: 'NEWSLETTER_UPDATE',
    subject: 'Latest from {{appName}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${logoUrl}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <h2 style="margin:0 0 8px 0;font-size:22px;line-height:30px;">What’s new</h2>
                  <p style="margin:0;font-size:16px;line-height:24px;">{{updateSummary}}</p>
                  <p style="margin:12px 0 0 0;font-size:13px;line-height:20px;">Stay gentle, stay curious.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    type: 'GENERIC_NOTIFICATION',
    subject: '{{subject}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${logoUrl}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <h2 style="margin:0 0 8px 0;font-size:22px;line-height:30px;">{{title}}</h2>
                  <p style="margin:0;font-size:16px;line-height:24px;">{{content}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    type: 'CONTACT_CONFIRMATION',
    subject: 'We received your message',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${logoUrl}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <h2 style="margin:0 0 8px 0;font-size:22px;line-height:30px;">Hello {{userName}}</h2>
                  <p style="margin:0;font-size:16px;line-height:24px;">Thank you for reaching out. We’ve received your message and we’ll reply soon.</p>
                  <blockquote style="margin:16px 0;padding:0 12px;border-left:3px solid #ddd;font-size:15px;line-height:22px;">{{message}}</blockquote>
                  <p style="margin:12px 0 0 0;font-size:13px;line-height:20px;">With gratitude,<br/>{{appName}}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    type: 'CONTACT_NOTIFICATION',
    subject: 'New contact request',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${logoUrl}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <h2 style="margin:0 0 8px 0;font-size:22px;line-height:30px;">New contact request</h2>
                  <p style="margin:0;font-size:15px;line-height:22px;"><strong>Name:</strong> {{userName}}</p>
                  <p style="margin:4px 0 0 0;font-size:15px;line-height:22px;"><strong>Email:</strong> {{email}}</p>
                  <blockquote style="margin:12px 0;padding:0 12px;border-left:3px solid #ddd;font-size:15px;line-height:22px;">{{message}}</blockquote>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
  {
    type: 'MANIFEST_UNLOCK',
    subject: 'Your manifest video is unlocked',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="https://png.pngtree.com/png-clipart/20230928/original/pngtree-yoga-logo-icon-design-spiritual-silhouette-pose-vector-png-image_12898165.png" alt="Spiritual icon" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <h2 style="margin:0 0 8px 0;font-size:22px;line-height:30px;">Your video is ready</h2>
                  <p style="margin:0;font-size:15px;line-height:22px;">Saved on <strong>{{uploadDate}}</strong></p>
                  <p style="margin:4px 0 0 0;font-size:15px;line-height:22px;"><strong>Video:</strong> {{filename}}</p>
                  <p style="margin:12px 0 0 0;font-size:13px;line-height:20px;">Unlock date: <strong>{{unlockDate}}</strong></p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
  },
];

async function initTemplates() {
  try {
    await mongoose.connect(dbConfig.uri);
    console.log('Connected to MongoDB');

    for (const template of defaultTemplates) {
      await EmailTemplate.findOneAndUpdate(
        { type: template.type },
        template,
        { upsert: true, new: true }
      );
      console.log(`✓ Template ${template.type} initialized`);
    }

    console.log('\nAll email templates initialized!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing templates:', error);
    process.exit(1);
  }
}

initTemplates();
