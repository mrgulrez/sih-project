import express from 'express';
import { registerIndividual, login } from '../controllers/indRegController.js';

const router = express.Router();

// Route to register individual
router.post('/register', registerIndividual);

router.post('/login', login);

export default router;
