"use-strict";
import { Request, Response, NextFunction } from "express";
import { AuthService } from "@service";
import { ApiResponse } from "@helper";
import "dotenv/config";
class AuthController {
  //[login]
  static async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;

    try {
      const { tokenUser, user, permissionNames } = await AuthService.login(
        email,
        password
      );

      // ✅ Chọn chế độ cookie theo origin FE
      const feOrigin = (process.env.APP_ORIGIN || "http://localhost:5173")
        .split(",")[0]
        .trim();
      const isLocal = /^https?:\/\/localhost(?::\d+)?$/.test(feOrigin);

      res.cookie("token", tokenUser, {
        httpOnly: true,
        // ✅ Cross-site cần None + Secure; local dev (localhost) dùng Lax + không Secure
        sameSite: isLocal ? "lax" : "none",
        secure: isLocal ? false : true,
        path: "/", // ✅ phải là "/" để mọi /api/* đều nhận cookie
        maxAge: 24 * 60 * 60 * 1000,
      });

      return res.json({
        message: "Đăng nhập thành công",
        user: {
          id: user.id,
          email: user.email,
          full_name: user.name, // FE đang đọc full_name
          permissionNames,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  //[logout]
  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> {
    try {
      // Nếu bạn đang bảo vệ /me bằng cookie 'token', thì xóa cookie này:
      const feOrigin = (process.env.APP_ORIGIN || "http://localhost:5173")
        .split(",")[0]
        .trim();
      const isLocal = /^https?:\/\/localhost(?::\d+)?$/.test(feOrigin);

      res.clearCookie("token", {
        httpOnly: true,
        sameSite: isLocal ? "lax" : "none",
        secure: isLocal ? false : true,
        path: "/", // phải giống lúc set cookie
      });
      return res
        .status(200)
        .json(ApiResponse.success(null, "Đăng xuất thành công"));
    } catch (error) {
      next(error);
    }
  }

  //[forgotPassword]
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    const { email } = req.body;
    try {
      const data = await AuthService.forgotPassword(email);
      return res
        .status(200)
        .json(
          ApiResponse.success(data, "Gửi email đặt lại mật khẩu thành công")
        );
    } catch (error) {
      next(error);
    }
  }

  //[changePassword]
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    const { userId } = (req as any).userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    try {
      const data = await AuthService.changePassword(
        userId,
        oldPassword,
        newPassword,
        confirmPassword
      );
      return res
        .status(200)
        .json(ApiResponse.success(data, "Đổi mật khẩu thành công"));
    } catch (error) {
      next(error);
    }
  }

  static async sendVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const data = await AuthService.sendVerify(email);
      return res
        .status(200)
        .json(
          ApiResponse.success(data, "Gửi Url xác minh tài khoản thành công!")
        );
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenQuery = req.query.token as string;
      const data = await AuthService.verify(tokenQuery);
      return res
        .status(200)
        .json(ApiResponse.success(data, "Tài khoản đã được xác minh!"));
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    const { email, otpCode, newPassword } = req.body;
    try {
      const data = await AuthService.resetPassword({
        email,
        otpCode,
        newPassword,
      });
      return res
        .status(200)
        .json(ApiResponse.success(data, "Đổi mật khẩu thành công"));
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
