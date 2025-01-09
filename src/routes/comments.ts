import { Router } from 'express';
import { auth } from '../middleware/auth';
import CommentController from '../controllers/commentController';

const router = Router();


router.post('/:petId', auth, CommentController.addComment);


router.delete('/:commentId', auth, CommentController.deleteComment);

export default router;
