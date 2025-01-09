import express from 'express';
import NotificationController from '../controllers/notificationController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/categories', auth, NotificationController.getNotificationsByCategory);
router.put('/read/:notificationId', auth, NotificationController.markNotificationAsRead);

export default router;
