import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  admin?: { id: string; role: string };
}

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token =
    req.headers.authorization?.replace('Bearer ', '') ||
    (typeof req.query.token === 'string' ? req.query.token : undefined);

  if (!token) return res.status(401).json({ message: 'Authentication required' });

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'iskcon_kopargaon_supreme_secret_108';
    req.admin = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    next();
  } catch (err: any) {
    console.error('❌ requireAdmin verification failed:', err.message);
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
};
