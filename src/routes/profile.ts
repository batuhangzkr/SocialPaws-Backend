import express from 'express';
import ProfileController from '../controllers/profileController';
import { auth } from '../middleware/auth';

const router = express.Router();


router.get('/', auth, ProfileController.getProfile);
router.get('/:userId', auth, ProfileController.getUserProfile);
router.put('/update-profile', auth, ProfileController.updateProfile);

export default router;


