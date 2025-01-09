import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { User } from '../models/User';
import { ResetToken } from '../models/ResetToken';
import { Token } from '../models/Token';
import { jwtDecode } from "jwt-decode"


interface ResetPasswordTokenPayload extends jwt.JwtPayload {
  userId: string;
}

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

class AuthController {

  static async register(req: Request, res: Response): Promise<Response> {
    const { name, email, password, city, district, phoneNumber, countryCode }:
      {
        name: string;
        email: string;
        password: string;
        city?: string;
        district?: string;
        phoneNumber: string;
        countryCode: string;
      } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user && !user.isVerified) {
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        await user.save();

        const verificationLink = `${process.env.CLIENT_URL}/api/auth/verify-email/${verificationToken}`;

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'E-posta Doğrulama',
          text: `Merhaba ${user.name}, lütfen e-posta adresinizi doğrulamak için şu linke tıklayın: ${verificationLink}. Bu link 30 dakika geçerlidir.`,
        };

        await transporter.sendMail(mailOptions);

        return res.json({ msg: 'E-posta zaten kayıtlı, lütfen doğrulama mailini kontrol edin.' });
      }

      if (user && user.isVerified) {
        return res.status(400).json({ msg: 'Kullanıcı zaten mevcut ve doğrulanmış.' });
      }


      user = new User({
        name,
        email,
        password,
        city: city || '',
        district: district || '',
        phoneNumber: phoneNumber
      });

      const salt: string = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verificationToken = verificationToken;

      await user.save();

      const verificationLink = `${process.env.CLIENT_URL}/api/auth/verify-email/${verificationToken}`;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'E-posta Doğrulama',
        text: `Merhaba ${user.name}, lütfen e-posta adresinizi doğrulamak için şu linke tıklayın: ${verificationLink}. Bu link 30 dakika geçerlidir.`,
      };

      await transporter.sendMail(mailOptions);

      return res.json({ msg: 'Kayıt başarılı, lütfen e-posta adresinizi doğrulamak için gelen kutunuzu kontrol edin.' });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async login(req: Request, res: Response): Promise<Response> {
    const { email, password }: { email: string; password: string } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
      }

      if (!user.isVerified) {
        return res.status(400).json({ msg: 'E-posta adresiniz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.' });
      }

      const isMatch: boolean = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Geçersiz kimlik bilgileri' });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };


      const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });


      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refreshSecret', { expiresIn: '7d' });


      res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true, sameSite: 'strict' });

      return res.json({ accessToken });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async refreshToken(req: AuthRequest, res: Response): Promise<Response> {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ msg: 'Refresh token eksik' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'refreshSecret') as any;
      const userId = decoded.user.id;

      const newAccessToken = jwt.sign(
        { user: { id: userId } },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      return res.json({ accessToken: newAccessToken });
    } catch (err) {
      return res.status(403).json({ msg: 'Geçersiz refresh token' });
    }
  };


  static async verifyEmail(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;

    try {
      const user = await User.findOne({ verificationToken: token });

      if (!user) {
        return res.status(400).json({ msg: 'Geçersiz veya süresi dolmuş token.' });
      }

      user.isVerified = true;
      user.verificationToken = null;

      await user.save();

      return res.json({ msg: 'E-posta adresiniz başarıyla doğrulandı, artık giriş yapabilirsiniz.' });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async forgotPassword(req: Request, res: Response): Promise<Response> {
    const { email }: { email: string } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Bu e-posta adresiyle ilişkili bir kullanıcı bulunamadı.' });
      }


      await ResetToken.findOneAndDelete({ userId: user._id });


      const resetCode = crypto.randomInt(100000, 999999).toString();

      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 15);


      const newResetToken = new ResetToken({
        userId: user._id,
        token: resetCode,
        expiryDate,
      });

      await newResetToken.save();


      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Şifre Sıfırlama Doğrulama Kodu',
        text: `Merhaba, şifrenizi sıfırlamak için doğrulama kodunuz: ${resetCode}. Kodun geçerlilik süresi 15 dakikadır.`,
      };

      await transporter.sendMail(mailOptions);

      return res.json({ msg: 'Doğrulama kodu e-posta adresinize gönderildi.' });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async verifyResetCode(req: Request, res: Response): Promise<Response> {
    const { email, code }: { email: string; code: string } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Kullanıcı bulunamadı.' });
      }

      const resetToken = await ResetToken.findOne({ userId: user._id, token: code });
      if (!resetToken || resetToken.expiryDate < new Date()) {
        return res.status(400).json({ msg: 'Geçersiz ya da süresi dolmuş doğrulama kodu.' });
      }


      const resetPasswordToken = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' }
      );

      return res.status(200).json({ msg: 'Doğrulama başarılı.', token: resetPasswordToken });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async resetPasswordConfirmation(req: Request, res: Response): Promise<Response> {
    const { token } = req.params;

    try {
      const resetToken = await ResetToken.findOne({ token });
      if (!resetToken || resetToken.expiryDate < new Date()) {
        return res.status(400).send('Geçersiz ya da süresi dolmuş token.');
      }


      return res.status(200).json({ token });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async resetPassword(req: Request, res: Response): Promise<Response> {
    const { token, password }: { token: string; password: string } = req.body;

    try {

      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as ResetPasswordTokenPayload;

      if (!decoded || !decoded.userId) {
        return res.status(400).json({ msg: 'Geçersiz token.' });
      }

      const userId = decoded.userId;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({ msg: 'Kullanıcı bulunamadı.' });
      }


      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();


      await ResetToken.findOneAndDelete({ userId });

      return res.json({ msg: 'Şifreniz başarıyla sıfırlandı.' });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async changePassword(req: AuthRequest, res: Response): Promise<Response> {
    const { currentPassword, newPassword }: { currentPassword: string; newPassword: string } = req.body;

    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Eski şifreniz yanlış' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();

      return res.json({ msg: 'Şifreniz başarıyla güncellendi' });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async deleteAccount(req: AuthRequest, res: Response): Promise<Response> {
    const { password }: { password: string } = req.body;

    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Girilen şifre yanlış.' });
      }

      await User.findByIdAndDelete(req.user?.id);

      return res.json({ msg: 'Hesabınız başarıyla silindi.' });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async logout(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const token = req.header('Authorization');

      if (!token) {
        return res.status(400).json({ msg: 'Token bulunamadı' });
      }

      const decodedToken: any = jwtDecode(token);
      if (!decodedToken) {
        return res.status(400).json({ msg: 'Geçersiz token' });
      }

      const expiryDate = new Date(decodedToken.exp * 1000);


      const blacklistedToken = new Token({
        token,
        expiryDate,
      });
      await blacklistedToken.save();


      res.clearCookie('refreshToken');

      return res.json({ msg: 'Başarıyla çıkış yapıldı.' });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };

}

export default AuthController