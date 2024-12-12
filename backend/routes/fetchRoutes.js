import express from 'express';
import { getUserRole } from '../controllers/fetchController.js'; // Import controller

const router = express.Router();

// Define the route to get the user's role
router.get('/role', getUserRole);


export default router;
