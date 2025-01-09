import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Comment } from '../models/Comment';
import { Pet } from '../models/Pet';
import { AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

class CommentController {

  static async addComment(req: AuthRequest, res: Response): Promise<Response> {
    const { petId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(petId)) {
      return res.status(400).json({ message: 'Geçersiz hayvan ID\'si.' });
    }


    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Yorum metni boş olamaz.' });
    }

    try {
      const petObjectId = new mongoose.Types.ObjectId(petId);
      const pet = await Pet.findById(petObjectId);
      if (!pet) {
        return res.status(404).json({ message: 'Hayvan bulunamadı.' });
      }

      const comment = new Comment({
        user: req.user?.id,
        text,
        pet: pet._id,
      });

      await comment.save();
      pet.comments.push(comment._id as mongoose.Schema.Types.ObjectId);
      await pet.save();


      const notification = new Notification({
        user: pet.user,
        type: 'comment',
        content: `${req.user?.name} hayvanınıza yorum yaptı: "${text}".`,
        relatedItemId: pet._id,
        isRead: false,
        createdAt: new Date(),
      });

      await notification.save();

      return res.status(201).json({ msg: 'Yorum başarıyla eklendi.', comment });
    } catch (err: any) {
      console.error('Yorum eklenirken hata oluştu:', err.message);
      return res.status(500).json({ message: 'Sunucu hatası.' });
    }
  };


  static async deleteComment(req: AuthRequest, res: Response): Promise<Response> {
    const { commentId } = req.params;

    try {

      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res.status(404).json({ msg: 'Yorum bulunamadı.' });
      }


      const pet = await Pet.findById(comment.pet);
      if (!pet) {
        return res.status(404).json({ msg: 'Hayvan bulunamadı.' });
      }


      if (comment.user.toString() !== req.user?.id && pet.user.toString() !== req.user?.id) {
        return res.status(403).json({ msg: 'Yorumu silme yetkiniz yok.' });
      }

      await Comment.findByIdAndDelete(commentId);


      await Pet.findByIdAndUpdate(pet._id, { $pull: { comments: commentId } });

      return res.json({ msg: 'Yorum başarıyla silindi.' });
    } catch (err: any) {
      console.error('Yorum silme işlemi sırasında hata:', err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };

}

export default CommentController
