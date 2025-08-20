// authz.ts
import { Request, Response, NextFunction } from 'express';
import { User, Role, Permission } from '@models';

type Mode = 'any' | 'all';

export function hasPermission(required: string[] = [], mode: Mode = 'any') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            required: true,
            include: [
              {
                model: Permission,
                required: false,
                attributes: ['name'],
                through: { attributes: [] },
              },
            ],
          },
        ],
        attributes: ['id', 'status'],
      });

      if (!user) return res.status(401).json({ message: 'Unauthorized' });
      if (user.status !== 'active')
        return res.status(403).json({ message: 'Forbidden: Inactive user' });
      if (!user.role)
        return res.status(403).json({ message: 'Forbidden: No role assigned' });

      if (user.role?.name === 'admin') return next();

      const permSet = new Set((user.role.permissions ?? []).map((p) => p.name));

      if (required.length === 0) return next(); // không yêu cầu quyền => cho qua

      const allowed =
        mode === 'any'
          ? required.some((rp) => permSet.has(rp))
          : required.every((rp) => permSet.has(rp));

      if (!allowed) {
        return res.status(403).json({
          message:
            mode === 'any'
              ? 'Forbidden: Thiếu ít nhất 1 quyền yêu cầu'
              : 'Forbidden: Thiếu quyền bắt buộc',
          missing:
            mode === 'all'
              ? required.filter((rp) => !permSet.has(rp))
              : undefined,
        });
      }

      return next();
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Permission check failed', error });
    }
  };
}
