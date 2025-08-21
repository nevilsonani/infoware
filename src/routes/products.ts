import { Router } from 'express';
import * as ctrl from '../controllers/products.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', ctrl.list);
router.post('/', auth(['SUPPLIER']), ctrl.upsert);
router.patch('/:id/stock', auth(['SUPPLIER']), ctrl.setStock);

export default router;


