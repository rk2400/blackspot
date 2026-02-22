import nodemailer from 'nodemailer';
import { emailConfig, authConfig, appConfig } from './config';
import EmailTemplate from './models/EmailTemplate';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Initialize transporter if SMTP config is available
    if (emailConfig.isConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure || emailConfig.port === 465,
        auth: {
          user: emailConfig.user,
          pass: emailConfig.pass,
        },
      });

      // Optional connection verification for clearer diagnostics
      this.transporter.verify().then(() => {
        console.log('Email transporter verified and ready');
      }).catch((err) => {
        console.error('Email transporter verification failed:', err?.message || err);
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // If no SMTP configured, log email (mock mode)
      if (!this.transporter) {
        console.log('📧 [MOCK EMAIL]');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('Body:', options.html);
        return true;
      }

      await this.transporter.sendMail({
        from: emailConfig.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        replyTo: options.replyTo,
      });

      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  private render(body: string, variables: Record<string, string | number>): string {
    const lookup: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(variables)) {
      lookup[k] = v;
      lookup[k.toLowerCase()] = v;
      lookup[k.replace(/[_\-\s]/g, '').toLowerCase()] = v;
    }
    // Synonyms
    if (lookup['userName'] !== undefined) {
      lookup['username'] = lookup['userName'];
      lookup['user'] = lookup['userName'];
      lookup['name'] = lookup['userName'];
    }
    if (lookup['email'] !== undefined) {
      lookup['mail'] = lookup['email'];
    }
    if (lookup['code'] !== undefined) {
      lookup['otp'] = lookup['code'];
    }
    lookup['appName'] = appConfig.name;
    const tokenRe = /\{\{\s*([a-zA-Z0-9_.\-]+)\s*\}\}/g;
    return body.replace(tokenRe, (_m, key: string) => {
      const norm = key.toLowerCase();
      const compact = key.replace(/[_\-\s]/g, '').toLowerCase();
      const val =
        lookup[key] ??
        lookup[norm] ??
        lookup[compact];
      return val !== undefined ? String(val) : _m;
    });
  }
 
  private ensureBrand(html: string): string {
    const iconUrl = `${appConfig.url}/images/blackspot.jpeg`;
    if (html.includes(iconUrl) || html.includes('/images/blackspot.jpeg')) return this.stripBackgroundStyles(html);
    const content = this.stripBackgroundStyles(html);
    return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding:16px 12px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;">
              <tr>
                <td style="padding:8px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;text-align:center;">
                  <img src="${iconUrl}" alt="BlackSpot logo" width="96" style="display:block;margin:12px auto;">
                  <div style="margin:6px 0 16px 0;font-size:14px;">Greetings from BlackSpot</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 24px 24px 24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,'Helvetica Neue',Arial,sans-serif;color:#111;">
                  ${content}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  }
 
  private stripBackgroundStyles(html: string): string {
    const removedBgColor = html.replace(/background-color\s*:\s*[^;"']+;?/gi, '');
    const removedBgImage = removedBgColor.replace(/background-image\s*:\s*[^;"']+;?/gi, '');
    const removedBg = removedBgImage.replace(/background\s*:\s*[^;"']+;?/gi, '');
    return removedBg;
  }

  async sendUsingTemplate(
    type: string,
    to: string,
    variables: Record<string, string | number>,
    replyTo?: string
  ): Promise<boolean> {
    const template = await EmailTemplate.findOne({ type });
    if (!template) {
      console.error(`Email template not found for type: ${type}`);
      return false;
    }
    const html = this.ensureBrand(this.render(template.body, variables));
    const subject = template.subject;
    return this.sendEmail({ to, subject, html, replyTo });
  }

  async sendOTP(email: string, code: string): Promise<boolean> {
    return this.sendUsingTemplate('LOGIN_OTP', email, { code, appName: appConfig.name, expiry: authConfig.otpExpiryMinutes });
  }

  // Order and payment emails removed
}

export const emailService = new EmailService();
