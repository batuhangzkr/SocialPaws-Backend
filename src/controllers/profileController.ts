import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import mongoose from 'mongoose';

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

class ProfileController {

  static async getProfile(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id

      const user = await User.findById(req.user?.id).select('-password -_id -verificationToken -__v -updatedAt -createdAt -blockedUsers');

      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
      }

      return res.json({
        _id: userId,
        name: user.name,
        email: user.email,
        city: user.city,
        district: user.district,
        phoneNumber: user.phoneNumber,
        country: user.country,
        isVerified: user.isVerified,
        pets: user.pets,
        profilePhoto: user.profilePhoto
      });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async getUserProfile(req: Request, res: Response): Promise<Response> {
    const { userId } = req.params;

    try {

      const user = await User.findById(userId).select('name profilePhoto country city localArea pets');
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
      }

      return res.json(user);
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async updateProfile(req: AuthRequest, res: Response): Promise<Response> {
    const { name, city, phoneNumber, country, district } = req.body;

    try {

      const user = await User.findById(req.user?.id);
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı' });
      }


      if (name) user.name = name;
      if (city) user.city = city;
      if (country) user.country = country;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (district) user.district = district;


      await user.save();

      return res.json({ msg: 'Profiliniz başarıyla güncellendi', user });
    } catch (err: any) {
      console.error(err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };

}

export default ProfileController
