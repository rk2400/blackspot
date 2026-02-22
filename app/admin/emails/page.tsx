'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import { getEmailTemplates, updateEmailTemplate } from '@/lib/api-client';
import toast from 'react-hot-toast';

const LOGO_CID = 'cid:blackspot-logo';

const TEMPLATE_TYPES = [
  { value: 'ACCOUNT_WELCOME', label: 'Account Welcome' },
  { value: 'LOGIN_OTP', label: 'Login OTP' },
  { value: 'NEWSLETTER_UPDATE', label: 'Newsletter Update' },
  { value: 'GENERIC_NOTIFICATION', label: 'Generic Notification' },
  { value: 'CONTACT_CONFIRMATION', label: 'Contact Confirmation' },
  { value: 'CONTACT_NOTIFICATION', label: 'Contact Notification' },
  { value: 'MANIFEST_UNLOCK', label: 'Manifest Unlock' },
];

const DEFAULT_TEMPLATES: Record<string, { subject: string; body: string }> = {
  ACCOUNT_WELCOME: {
    subject: 'Welcome to {{appName}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${LOGO_CID}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;border-radius:50%;">
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
  LOGIN_OTP: {
    subject: 'Your login code for {{appName}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${LOGO_CID}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;border-radius:50%;">
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
  NEWSLETTER_UPDATE: {
    subject: 'Latest from {{appName}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${LOGO_CID}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;border-radius:50%;">
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
  GENERIC_NOTIFICATION: {
    subject: '{{subject}}',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${LOGO_CID}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;border-radius:50%;">
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
  CONTACT_CONFIRMATION: {
    subject: 'We received your message',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${LOGO_CID}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;border-radius:50%;">
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
  CONTACT_NOTIFICATION: {
    subject: 'New contact request',
    body: `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;text-align:center;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  <img src="${LOGO_CID}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;border-radius:50%;">
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
  MANIFEST_UNLOCK: {
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
};

export default function AdminEmailsPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Record<string, any>>({});
  const [selectedType, setSelectedType] = useState('ACCOUNT_WELCOME');
  const [formData, setFormData] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const template = templates[selectedType] || DEFAULT_TEMPLATES[selectedType];
    if (template) {
      setFormData({ subject: template.subject, body: template.body });
    }
  }, [selectedType, templates]);

  async function loadTemplates() {
    try {
      const data = await getEmailTemplates();
      const templateMap: Record<string, any> = {};
      data.forEach((t: any) => {
        templateMap[t.type] = t;
      });
      setTemplates(templateMap);
    } catch (error: any) {
      if (error.message.includes('Unauthorized') || error.message.includes('Admin')) {
        router.push('/admin/login');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateEmailTemplate({
        type: selectedType,
        subject: formData.subject,
        body: formData.body,
      });
      toast.success('Template saved!');
      loadTemplates();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Email Templates</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="font-semibold mb-4">Template Types</h2>
              <div className="space-y-2">
                {TEMPLATE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedType === type.value
                        ? 'bg-stone-800 text-white font-semibold'
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card p-6">
              <h2 className="text-2xl font-bold mb-6">
                {TEMPLATE_TYPES.find((t) => t.value === selectedType)?.label}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="input"
                  placeholder="Email subject"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Body (HTML)</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="input font-mono text-sm"
                  rows={15}
                  placeholder="Email body (HTML)"
                />
                <p className="text-sm text-stone-400 mt-2">
                  Common variables: {'{{userName}}'}, {'{{code}}'}, {'{{otp}}'}, {'{{expiry}}'}, {'{{updateSummary}}'}, {'{{title}}'}, {'{{content}}'}, {'{{message}}'}, {'{{email}}'}, {'{{unlockDate}}'}, {'{{filename}}'}, {'{{uploadDate}}'}, {'{{appName}}'}
                </p>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
