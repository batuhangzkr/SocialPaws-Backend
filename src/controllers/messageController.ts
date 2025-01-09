import { Request, Response } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import mongoose from 'mongoose';
import { Notification } from '../models/Notification';


class MessageContoller {

  static async sendMessage(req: AuthRequest, res: Response) {
    const { conversationId, content } = req.body;

    const senderId = req.user?.id;
    if (!senderId) {
      return res.status(401).json({ msg: 'Yetkisiz erişim' });
    }

    const senderObjectId = new mongoose.Types.ObjectId(senderId);

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ msg: 'Konuşma bulunamadı' });
      }

      const isParticipant = conversation.participants.some(participant =>
        participant.toString() === senderObjectId.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({ msg: 'Bu konuşmaya mesaj gönderme yetkiniz yok.' });
      }

      const user = await User.findById(senderObjectId);
      if (!user) {
        return res.status(404).json({ msg: 'Kullanıcı bulunamadı.' });
      }

      const otherParticipant = conversation.participants.find(participant =>
        participant.toString() !== senderObjectId.toString()
      );

      if (!otherParticipant) {
        return res.status(404).json({ msg: 'Diğer katılımcı bulunamadı.' });
      }

      const otherUser = await User.findById(otherParticipant);
      if (!otherUser) {
        return res.status(404).json({ msg: 'Diğer kullanıcı bulunamadı.' });
      }

      if (user.blockedUsers.map(id => id.toString()).includes(otherParticipant.toString())) {
        return res.status(403).json({ msg: 'Bu kullanıcıya mesaj gönderemezsiniz.' });
      }

      if (otherUser.blockedUsers.map(id => id.toString()).includes(senderObjectId.toString())) {
        return res.status(403).json({ msg: 'Bu kullanıcı sizi engelledi, mesaj gönderemezsiniz.' });
      }

      const messageCount = await Message.countDocuments({ conversation: conversationId, sender: senderObjectId });

      if (messageCount >= 2 && !conversation.isApproved) {
        return res.status(403).json({ msg: 'Yalnızca iki mesaj gönderebilirsiniz. Karşı tarafın onayı gerekiyor.' });
      }

      const message = new Message({
        conversation: conversationId,
        sender: senderObjectId,
        content,
      });

      await message.save();


      const notification = new Notification({
        user: otherParticipant,
        type: 'message',
        content: `Yeni bir mesaj aldınız: ${content}`,
        relatedItemId: message._id instanceof mongoose.Types.ObjectId ? message._id : undefined,
      });

      await notification.save();

      if (messageCount === 0) {
        console.log("İlk mesaj gönderildi, onay isteği tetiklendi.");
      }

      conversation.updatedAt = new Date();
      conversation.lastMessage = content;
      conversation.lastMessageSender = senderObjectId;

      await conversation.save();

      return res.status(201).json(message);
    } catch (err: any) {
      console.error('Mesaj gönderilirken hata oluştu:', err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async approveConversation(req: AuthRequest, res: Response) {
    const { conversationId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ msg: 'Yetkisiz erişim' });
    }

    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ msg: 'Konuşma bulunamadı' });
      }


      const isParticipant = conversation.participants.some(participant =>
        participant.toString() === userId
      );

      if (!isParticipant) {
        return res.status(403).json({ msg: 'Bu konuşmayı onaylama yetkiniz yok.' });
      }

      conversation.isApproved = true;
      await conversation.save();

      return res.json({ msg: 'Konuşma başarıyla onaylandı.', conversation });
    } catch (err: any) {
      console.error('Onaylama sırasında hata oluştu:', err.message);
      return res.status(500).send('Sunucu hatası');
    }
  };


  static async getMessagesForConversation(req: AuthRequest, res: Response) {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    try {

      const conversation = await Conversation.findById(conversationId);

      if (!conversation) {
        return res.status(404).json({ message: 'Konuşma bulunamadı.' });
      }


      const isParticipant = conversation.participants.some((participantId) =>
        participantId.toString() === userId.toString()
      );

      if (!isParticipant) {
        return res.status(403).json({ message: 'Bu konuşmaya erişim yetkiniz yok.' });
      }


      const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: -1 }).populate('sender', 'name profilePhoto');

      return res.status(200).json(messages);
    } catch (err) {
      console.error('Mesajlar getirilirken hata oluştu:', err);
      return res.status(500).json({ message: 'Sunucu hatası.' });
    }
  };

}
export default MessageContoller