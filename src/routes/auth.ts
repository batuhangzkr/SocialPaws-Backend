import express from 'express';
import AuthController from '../controllers/authController';
import { auth } from '../middleware/auth';

const router = express.Router();


router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', auth, AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/verify-email/:token', AuthController.verifyEmail);


router.post('/forgot-password', AuthController.forgotPassword);
router.post('/verify-reset-code', AuthController.verifyResetCode);
router.post('/reset-password', AuthController.resetPassword);
router.post('/reset-password-confirmation', AuthController.resetPasswordConfirmation);


router.put('/change-password', auth, AuthController.changePassword);
router.delete('/delete-account', auth, AuthController.deleteAccount);

export default router;
