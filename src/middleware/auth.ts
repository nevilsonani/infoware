import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { HttpError } from '../utils/errors';

export type UserJwt = { id: number; role: 'BUYER'|'SUPPLIER'|'ADMIN' };

export function auth(requiredRoles?: Array<UserJwt['role']>) {
  return (req: any, _res: any, next: any) => {
    const header = req.headers['authorization'] || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return next(new HttpError(401, 'Missing token'));
    try {
      const payload = jwt.verify(token, config.jwtSecret) as UserJwt;
      if (requiredRoles && !requiredRoles.includes(payload.role)) {
        return next(new HttpError(403, 'Forbidden'));
      }
      req.user = payload;
      next();
    } catch {
      next(new HttpError(401, 'Invalid token'));
    }
  };
}


