import express from 'express';
import { registerIndividual, verifyEmail, login } from '../controllers/indRegController.js';

const router = express.Router();

// Route to register individual
router.post('/register', registerIndividual);

// Route to verify email
router.get('/verify-email', verifyEmail);

router.post('/login', login);

export default router;
