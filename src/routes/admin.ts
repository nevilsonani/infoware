import { Router } from 'express';
import * as ctrl from '../controllers/admin.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.patch('/orders/:id/status', auth(['ADMIN']), ctrl.changeStatus);
router.get('/analytics', auth(['ADMIN']), ctrl.analytics);

export default router;


