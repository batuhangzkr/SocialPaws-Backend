import express from 'express';
import ConversationController from '../controllers/conversationController';
import { auth } from '../middleware/auth';
import MessageContoller from '../controllers/messageController';

const router = express.Router();


router.post('/', auth, ConversationController.createConversation);
router.get('/my-conversations', auth, ConversationController.getUserConversations);
router.delete('/:conversationId', auth, ConversationController.deleteConversation);
router.post('/:conversationId/approve', auth, MessageContoller.approveConversation);

export default router;
