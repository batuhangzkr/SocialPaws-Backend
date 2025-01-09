import { Request, Response } from 'express';
import { Like } from '../models/Like';
import { Pet } from '../models/Pet';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';

class LikeController {

  static async addLike(req: AuthRequest, res: Response): Promise<Response> {
    const { petId } = req.params;

    try {

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı.' });
      }

      const userObjectId = new mongoose.Types.ObjectId(req.user?.id);


      const existingLike = await Like.findOne({ user: userObjectId, pet: petId });
      if (existingLike) {
        return res.status(400).json({ msg: 'Bu hayvan zaten beğenildi.' });
      }


      const like = new Like({
        user: userObjectId,
        pet: petId,
      });

      await like.save();

      pet.likes.push(userObjectId);
      await pet.save();


      const notification = new Notification({
        user: pet.user,
        type: 'like',
        content: `${req.user?.name} hayvanınızı beğendi.`,
        relatedItemId: pet._id,
        isRead: false,
        createdAt: new Date(),
      });

      await notification.save();

      return res.status(201).json({ msg: 'Hayvan beğenildi.', like, notification });
    } catch (err: any) {
      console.error('Like ekleme sırasında hata:', err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };


  static async removeLike(req: AuthRequest, res: Response): Promise<Response> {
    const { petId } = req.params;

    try {

      const pet = await Pet.findById(petId);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı.' });
      }


      const userObjectId = new mongoose.Types.ObjectId(req.user?.id);


      const like = await Like.findOne({ user: userObjectId, pet: petId });
      if (!like) {
        return res.status(400).json({ msg: 'Bu hayvana like atılmamış.' });
      }


      await Like.findByIdAndDelete(like._id);


      pet.likes = pet.likes.filter(likeId => likeId.toString() !== userObjectId.toString());
      await pet.save();

      return res.status(200).json({ msg: 'Beğeni kaldırıldı.' });
    } catch (err: any) {
      console.error('Like geri alma sırasında hata:', err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };

}

export default LikeController
