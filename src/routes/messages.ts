import express from 'express';
import MessageContoller from '../controllers/messageController';
import { auth } from '../middleware/auth';

const router = express.Router();


router.post('/', auth, MessageContoller.sendMessage);
router.get('/userconversation/:conversationId', auth, MessageContoller.getMessagesForConversation);

export default router;
