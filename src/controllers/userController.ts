

import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import fs from 'fs';

class UserController {

  static async uploadPhoto(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
      }


      if (!req.file) {
        return res.status(400).json({ msg: 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.' });
      }


      if (user.profilePhoto) {
        const oldPath = user.profilePhoto;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      user.profilePhoto = `uploads/profile/${req.file.filename}`;
      console.log(user.profilePhoto)
      await user.save();

      return res.status(200).json({ msg: 'Profil fotoğrafı başarıyla yüklendi', user });
    } catch (error: any) {
      console.error('Sunucu hatası:', error);
      return res.status(500).json({ msg: 'Sunucu hatası.' });
    }
  }

  static async updateProfilePhoto(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
      }

      if (!req.file) {
        return res.status(400).json({ msg: 'Fotoğraf yüklenemedi. Lütfen tekrar deneyin.' });
      }

      // Eskiyi sil
      if (user.profilePhoto) {
        const oldPath = user.profilePhoto;
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Yeni fotoğraf
      user.profilePhoto = `/uploads/profile/${req.file.filename}`;
      console.log(req.file.path)
      await user.save();

      return res.status(200).json({ msg: 'Profil fotoğrafı başarıyla güncellendi', user });
    } catch (error: any) {
      console.error('Sunucu hatası:', error);
      return res.status(500).json({ msg: 'Sunucu hatası.' });
    }
  }


  static async getAllUsers(req: AuthRequest, res: Response): Promise<Response> {
    try {

      const users = await User.find();

      if (!users) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
      }

      return res.json({ users });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };

  static async blockUser(req: AuthRequest, res: Response) {
    const { blockedUserId } = req.body;
    const userId = req.user!.id;

    try {

      const [user, blockedUser] = await Promise.all([
        User.findById(userId),
        User.findById(blockedUserId)
      ]);

      if (!user || !blockedUser) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }

      if (user.blockedUsers.includes(blockedUserId)) {
        return res.status(400).json({ message: 'Bu kullanıcı zaten engellenmiş.' });
      }

      user.blockedUsers.push(blockedUserId);
      await user.save();

      return res.status(200).json({ message: 'Kullanıcı başarıyla engellendi.' });
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: 'Sunucu hatası.' });
    }
  };


  static async unblockUser(req: AuthRequest, res: Response) {
    const { blockedUserId } = req.body;
    const userId = req.user!.id;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      }


      user.blockedUsers = user.blockedUsers.filter(id => id.toString() !== blockedUserId);
      await user.save();

      return res.status(200).json({ message: 'Kullanıcının engeli başarıyla kaldırıldı.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Sunucu hatası.' });
    }
  };

}

export default UserController