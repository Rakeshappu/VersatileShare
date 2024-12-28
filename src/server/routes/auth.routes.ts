import express from 'express';
import { signup, login, verifyEmail, resendVerification } from '../controllers/auth.controller';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

export default router;