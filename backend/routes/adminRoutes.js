// server/routes/adminRoutes.js
import express from 'express';
import { getPendingRequests, approveRequest, rejectRequest, loginAdmin } from '../controllers/adminController.js';

const router = express.Router();

// Route to get all pending requests
router.get('/requests', getPendingRequests);

// Route to approve a request
router.patch('/requests/approve/:id', approveRequest);

// Route to reject a request
router.delete('/requests/reject/:id', rejectRequest);

router.post('/login', loginAdmin);

export default router;
