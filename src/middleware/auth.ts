import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, AuthUserPayload } from '../types';

export const JWT_SECRET = process.env.JWT_SECRET || 'abr_greens_production_jwt_secret_ec2_2026';

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'] || (req.headers['Authorization'] as string);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      errors: [['Unauthenticated or missing token.']]
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      errors: [['Token is invalid or expired.']]
    });
  }
}
