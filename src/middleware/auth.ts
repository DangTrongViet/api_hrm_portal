// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '@models/user.model';
import { Role } from '@models/roles.model';
import { Permission } from '@models/permissions.model';

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      roleId?: number;
      permissions?: string[];
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

function extractToken(req: Request): string | null {
  const hdr = req.headers.authorization;
  if (hdr && /^Bearer\s+/i.test(hdr))
    return hdr.replace(/^Bearer\s+/i, '').trim();
  const c1 = (req as any).cookies?.token;
  const c2 = (req as any).cookies?.tokenUser;
  return (c1 || c2) ?? null;
}

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: 'Unauthenticated' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    // 👇 đọc đúng key bạn đã ký: userId
    const userId = Number(payload.sub ?? payload.id ?? payload.userId);

    if (!userId)
      return res.status(401).json({ message: 'Invalid token (no user id)' });

    // Lấy user còn active + permissions
    const user = await User.findOne({
      where: { id: userId, status: 'active' },
      attributes: ['id', 'role_id', 'status'],
      include: [
        {
          model: Role,
          attributes: ['id'],
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
    if (!user)
      return res
        .status(401)
        .json({ message: 'Invalid token or inactive user' });

    const permissionNames = Array.isArray((user.role as any)?.permissions)
      ? (user.role as any).permissions.map((p: Permission) => p.name)
      : [];

    req.user = {
      id: user.id,
      roleId: user.role_id,
      permissions: permissionNames,
    };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
