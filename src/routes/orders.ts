import { Router } from 'express';
import * as ctrl from '../controllers/orders.controller';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/', auth(['BUYER']), ctrl.create);
router.get('/', auth(['BUYER']), ctrl.listBuyer);
router.get('/supplier', auth(['SUPPLIER']), ctrl.listSupplier);
router.patch('/:id/status', auth(['SUPPLIER','ADMIN']), ctrl.changeStatus);

export default router;


