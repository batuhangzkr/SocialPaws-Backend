import express from 'express';
import UserController from '../controllers/userController';
import { auth } from '../middleware/auth';
import { upload } from '../middleware/multer';

const router = express.Router();

router.post('/block', auth, UserController.blockUser);
router.post('/unblock', auth, UserController.unblockUser);

router.post('/updateProfilePhoto', auth, UserController.updateProfilePhoto);
router.get('/allUsers', auth, UserController.getAllUsers);
router.post('/uploadPhoto', auth, upload.single('profilePhoto'), UserController.uploadPhoto);
router.put('/updateProfilePhoto', auth, upload.single('profilePhoto'), UserController.updateProfilePhoto);
export default router;
