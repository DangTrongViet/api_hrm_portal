import md5 from 'md5';
import { Role, User, Permission } from '@models';
import { generateToken, generateTokenVerify } from '@helper/generate';
import { NotFoundError, UnauthorizedError, sendMail } from '@helper';
import 'dotenv/config';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';

type ResetPasswordInput = {
  email: string;
  otpCode: string;
  newPassword: string;
};

function generateOtp6(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

class AuthService {
  static async login(email: string, password: string) {
    const emailNorm = String(email || '')
      .trim()
      .toLowerCase();

    // Lấy user + password + role + permissions
    const user = await User.findOne({
      where: { email: emailNorm, status: 'active' },
      attributes: [
        'id',
        'name',
        'email',
        'password',
        'role_id',
        'isVerified',
        'mustChangePassword',
        'lastLoginAt',
      ],
      include: [
        {
          model: Role,
          attributes: ['id', 'name', 'department'],
          include: [
            {
              model: Permission,
              attributes: ['name'],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      // Có thể đổi thông điệp chung "Sai email hoặc mật khẩu" nếu muốn tránh user-enumeration
      throw new NotFoundError('Người dùng không tồn tại');
    }

    // So sánh mật khẩu (plaintext vs hash)
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedError('Mật khẩu không chính xác');
    }

    // Lấy danh sách quyền
    const permissionNames: string[] = Array.isArray(
      (user.role as any)?.permissions
    )
      ? (user.role as any).permissions.map((p: Permission) => p.name)
      : [];

    // Cập nhật thời điểm đăng nhập gần nhất (không bắt buộc)
    user.lastLoginAt = new Date();
    await user.save({ fields: ['lastLoginAt'] });

    // Loại bỏ password khỏi object trả về
    const plain = user.get({ plain: true }) as any;
    delete plain.password;

    // Token
    const tokenUser = generateToken(user.id);

    return {
      tokenUser,
      user: {
        id: plain.id,
        name: plain.name,
        email: plain.email,
        role_id: plain.role_id,
        role: plain.role
          ? {
              id: plain.role.id,
              name: plain.role.name,
              department: plain.role.department ?? null,
            }
          : null,
        isVerified: plain.isVerified,
        mustChangePassword: plain.mustChangePassword,
        lastLoginAt: plain.lastLoginAt,
      },
      permissionNames,
    };
  }
  static async forgotPassword(emailRaw: string) {
    const email = String(emailRaw || '')
      .trim()
      .toLowerCase();
    if (!email) {
      const err: any = new Error('Thiếu email');
      err.status = 400;
      throw err;
    }

    // Tìm user (tránh lộ sự tồn tại của email bên dưới)
    const user = await User.findOne({
      where: { email, status: 'active' },
      // nếu model đã có defaultScope ẩn password thì không cần exclude
      // attributes: { exclude: ["password"] },
    });

    // Luôn trả cùng 1 thông điệp để tránh user-enumeration
    const safeResponse = {
      message: 'Nếu email tồn tại, mã OTP đã được gửi',
      email,
    };

    if (!user) return safeResponse;

    // (tuỳ chọn) chặn spam: nếu OTP chưa hết hạn thì không gửi mới
    const now = Date.now();
    if (user.otpExpires && new Date(user.otpExpires).getTime() > now) {
      // Có thể gửi lại cùng mã hoặc trả lời nhẹ nhàng
      return safeResponse;
    }

    const ttlMinutes = Number(process.env.OTP_EXPIRES_MINUTES || 3);
    const otpCode = generateOtp6();
    const otpExpires = new Date(now + ttlMinutes * 60 * 1000);
    user.set({ otpCode, otpExpires });
    await user.save(); // nhớ await!

    // Gửi email OTP
    const subject = 'Xác minh đặt lại mật khẩu';
    const html = `
    <h2>Xác minh đặt lại mật khẩu</h2>
    <p>Mã xác thực của bạn là <b>${otpCode}</b>.</p>
    <p>Mã có hiệu lực trong <b>${ttlMinutes} phút</b>.</p>
  `;
    try {
      await sendMail(email, subject, html);
    } catch (err) {
      // Không throw để tránh lộ info; log server-side là đủ
      console.error('sendMail error:', err);
    }

    return safeResponse;
  }

  static async resetPassword({
    email,
    otpCode,
    newPassword,
  }: ResetPasswordInput) {
    const emailNorm = String(email || '')
      .trim()
      .toLowerCase();
    const codeNorm = String(otpCode || '').trim();

    if (!emailNorm || !codeNorm || !newPassword) {
      const err: any = new Error('Thiếu email, otpCode hoặc newPassword');
      err.status = 400;
      throw err;
    }
    if (newPassword.length < 8) {
      const err: any = new Error('Mật khẩu mới tối thiểu 8 ký tự');
      err.status = 400;
      throw err;
    }

    const user = await User.findOne({
      where: { email: emailNorm, status: 'active' },
    });

    // Trả về message chung để tránh lộ thông tin email không tồn tại
    const safeError = (message: string) => {
      const err: any = new Error(message);
      err.status = 400;
      return err;
    };

    if (!user || !user.otpCode || !user.otpExpires) {
      throw safeError('OTP không hợp lệ hoặc đã hết hạn');
    }

    // So sánh hết hạn (thêm 30s grace để tránh lệch đồng hồ nhẹ)
    const now = Date.now();
    const expiresAt = new Date(user.otpExpires).getTime();
    const graceMs = 30 * 1000;
    if (expiresAt + graceMs <= now) {
      throw safeError('OTP đã hết hạn');
    }

    // So sánh mã OTP (constant-time)
    const a = Buffer.from(String(user.otpCode));
    const b = Buffer.from(codeNorm);

    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!valid) {
      throw safeError('OTP không đúng');
    }

    // Cập nhật mật khẩu (hook sẽ hash), xoá OTP sau khi dùng
    user.password = newPassword;
    user.otpCode = null as any;
    user.otpExpires = null as any;
    user.mustChangePassword = false;
    await user.save();

    return { ok: true };
  }

  static async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const user = await User.findOne({
      where: {
        id: userId,
        status: 'active',
      },
    });
    if (!user) {
      throw new NotFoundError('Người dùng không tồn tại');
    }

    if (newPassword !== confirmPassword) {
      throw new UnauthorizedError('Xác nhận mật khẩu không chính xác');
    }

    const isMatch = md5(oldPassword) === user.password;
    if (!isMatch) {
      throw new UnauthorizedError('Mật khẩu cũ không chính xác');
    }
    user.password = md5(newPassword);

    await user.save();

    return { message: 'Đổi mật khẩu thành công' };
  }

  static async sendVerify(email: string) {
    // Tìm user
    const user = await User.findOne({ where: { email } });
    if (!user) throw new NotFoundError('Người dùng không tồn tại');

    // Tạo token verify (hết hạn 15 phút)
    const token = generateTokenVerify(user.id);

    // Link verify
    const verificationLink = `http://localhost:3000/auth/verify?token=${token}`;

    // Nội dung email
    const subject = 'Xác nhận tài khoản';
    const html = `
    <h2>Xác nhận tài khoản của bạn</h2>
    <p>Nhấn vào liên kết bên dưới để xác thực email:</p>
    <a href="${verificationLink}">Xác nhận email</a>
    <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
  `;

    // Gửi email
    sendMail(email, subject, html);

    return { message: 'Email xác thực đã được gửi', email };
  }
  static async verify(tokenQuery: string) {
    if (!tokenQuery) throw new NotFoundError('Yêu cầu gửi token Query');

    try {
      // Giải mã token
      const decoded = jwt.verify(
        tokenQuery.trim(),
        process.env.JWT_SECRET!
      ) as JwtPayload;

      // Kiểm tra userId
      if (!decoded || typeof decoded === 'string' || !decoded.userId) {
        throw new NotFoundError('Token không chứa thông tin người dùng');
      }

      // Update trạng thái xác minh
      await User.update(
        { isVerified: true },
        { where: { id: decoded.userId } }
      );

      return { message: 'Xác thực tài khoản thành công' };
    } catch (err) {
      throw new NotFoundError('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}

export default AuthService;
