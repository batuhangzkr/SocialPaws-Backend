import { Router } from 'express';
import { auth } from '../middleware/auth';
import LikeController from '../controllers/likeController';

const router = Router();


router.post('/:petId', auth, LikeController.addLike);


router.delete('/:petId', auth, LikeController.removeLike);

export default router;
