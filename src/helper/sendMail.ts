// src/lib/mailer.ts
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

let cached: Transporter | null = null;

function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getTransporter(): Transporter {
  if (cached) return cached;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Thiếu EMAIL_USER hoặc EMAIL_PASS (Gmail App Password).');
  }

  cached = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }, // yêu cầu App Password (không phải mật khẩu Gmail thường)
  });

  return cached;
}

export async function verifyMailer(): Promise<void> {
  const tx = getTransporter();
  await tx.verify();
  if (process.env.NODE_ENV !== 'production') {
    console.log('[mailer] SMTP ready (gmail)');
  }
}

/** Gửi email HTML (+ text fallback) */
export async function sendMail(
  to: string | string[],
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  const tx = getTransporter();

  const fromUser = process.env.EMAIL_USER!; // đã kiểm ở trên
  const opts: SendMailOptions = {
    from: fromUser,
    to,
    subject,
    html,
    text: text ?? htmlToText(html),
  };

  const info = await tx.sendMail(opts);

  if (process.env.NODE_ENV !== 'production') {
    console.log('[mailer] Sent:', info.messageId, '→', to);
  }
}

/** Template HTML cho email mời kích hoạt */
export function buildInviteEmailHtml(name: string, inviteLink: string): string {
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial">
    <h2>Chào ${name || ''},</h2>
    <p>Bạn được mời kích hoạt tài khoản trên hệ thống HRM.</p>
    <p>Vui lòng bấm nút bên dưới để đặt mật khẩu và kích hoạt tài khoản:</p>
    <p style="margin:24px 0">
      <a href="${inviteLink}"
         style="display:inline-block;background:#111;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
         Kích hoạt tài khoản
      </a>
    </p>
    <p>Nếu nút không hoạt động, sao chép liên kết sau vào trình duyệt:</p>
    <p style="word-break:break-all"><a href="${inviteLink}">${inviteLink}</a></p>
    <p>Liên kết sẽ hết hạn sau một thời gian ngắn vì lý do bảo mật.</p>
    <p>Trân trọng,<br/>HRM System</p>
  </div>`;
}

/** Helper giữ tương thích với service */
export async function sendInviteEmail(
  to: string,
  name: string,
  inviteLink: string
): Promise<void> {
  const subject = 'Kích hoạt tài khoản HRM';
  const html = buildInviteEmailHtml(name, inviteLink);
  const text = `Chào ${name},\n\nMời bạn kích hoạt tài khoản: ${inviteLink}\n\nTrân trọng,\nHRM System`;
  await sendMail(to, subject, html, text);
}
