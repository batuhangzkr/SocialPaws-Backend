import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { Token } from '../models/Token';
import { ObjectId } from 'mongoose';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    name?: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {

  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ msg: 'Token bulunamadı, yetkisiz erişim' });
  }

  try {

    const blacklistedToken = await Token.findOne({ token });
    if (blacklistedToken) {
      return res.status(401).json({ msg: 'Token geçersiz, lütfen tekrar giriş yapın.' });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { user: { id: string } };


    req.user = decoded.user;

    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Geçersiz token' });
  }
};
