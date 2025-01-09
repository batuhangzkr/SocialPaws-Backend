import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { AuthRequest } from '../middleware/auth';
import { Message } from '../models/Message';
import mongoose, { ObjectId } from 'mongoose';
import { IConversation } from '../models/Conversation';
import { IMessage } from '../models/Message';


class ConversationController {


  static async createConversation(req: AuthRequest, res: Response) {
    const { receiverId } = req.body;

    try {
      if (!receiverId) {
        return res.status(400).json({ msg: 'Alıcı ID\'si gerekli.' });
      }

      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ msg: 'Yetkisiz erişim' });
      }


      const participantIds = [userId, receiverId];


      const existingConversation = await Conversation.findOne({
        participants: { $all: participantIds },
        contextType: 'general',
      });

      if (existingConversation) {
        return res.status(200).json(existingConversation);
      }


      const newConversation = new Conversation({
        participants: participantIds,
        contextType: 'general',
      });

      await newConversation.save();

      return res.status(201).json(newConversation);
    } catch (err: any) {
      console.error('Konuşma oluşturulurken hata:', err.message);
      return res.status(500).json({ msg: 'Sunucu hatası' });
    }
  };


  static async deleteConversation(req: AuthRequest, res: Response): Promise<Response> {
    const { conversationId } = req.params;
    const userId = req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ msg: 'Geçersiz konuşma ID' });
    }

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ msg: 'Konuşma bulunamadı' });
      }


      const isParticipant = conversation.participants.some(participant =>
        participant.toString() === userId?.toString()
      );

      if (!isParticipant) {
        return res.status(401).json({ msg: 'Bu konuşmayı silme yetkiniz yok.' });
      }


      if (userId && !conversation.deletedFor.some(id => id.toString() === userId.toString())) {
        conversation.deletedFor.push(userId as any);
      }


      if (conversation.deletedFor.length === conversation.participants.length) {
        await Conversation.deleteOne({ _id: conversation._id });
        return res.json({ msg: 'Konuşma tamamen silindi.' });
      }


      await conversation.save();
      return res.json({ msg: 'Konuşma sizin için silindi.' });
    } catch (err: any) {
      console.error('Silme işlemi sırasında hata:', err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async getUserConversations(req: AuthRequest, res: Response) {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: 'Yetkisiz erişim' });
    }

    try {

      const conversations = await Conversation.find({ participants: userId })
        .populate('participants', 'name profilePhoto')
        .sort({ updatedAt: -1 });


      const conversationDetails = await Promise.all(
        conversations.map(async (conversation) => {
          const lastMessage = await Message.findOne({ conversation: conversation._id })
            .sort({ createdAt: -1 });

          return {
            conversationId: conversation._id,
            participants: conversation.participants,
            lastMessage: lastMessage ? lastMessage.content : 'Henüz mesaj yok',
            lastMessageTimestamp: lastMessage ? lastMessage.createdAt : conversation.createdAt,
          };
        })
      );

      return res.status(200).json(conversationDetails);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  };

}

export default ConversationController
