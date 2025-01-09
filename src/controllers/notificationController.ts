import { Request, Response } from 'express';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/auth';

class NotificationController {

  static async getNotificationsByCategory(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ msg: 'Yetkisiz işlem.' });
    }

    try {

      const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });


      const groupedNotifications = {
        likes: notifications.filter(n => n.type === 'like'),
        comments: notifications.filter(n => n.type === 'comment'),
        breedingRequests: notifications.filter(n => n.type === 'breeding'),
        messages: notifications.filter(n => n.type === 'message'),
      };

      return res.status(200).json(groupedNotifications);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  };


  static async markNotificationAsRead(req: AuthRequest, res: Response) {
    const { notificationId } = req.params;

    try {
      const notification = await Notification.findById(notificationId);

      if (!notification) {
        return res.status(404).json({ msg: 'Bildirim bulunamadı.' });
      }

      if (notification.user.toString() !== req.user?.id) {
        return res.status(403).json({ msg: 'Bu bildirimi okuma yetkiniz yok.' });
      }

      notification.isRead = true;
      await notification.save();

      return res.status(200).json({ msg: 'Bildirim okundu olarak işaretlendi.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Sunucu hatası' });
    }
  };

}

export default NotificationController