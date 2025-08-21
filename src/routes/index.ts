import { Router } from 'express';
import products from './products';
import orders from './orders';
import admin from './admin';
import { login } from '../controllers/auth.controller';

const router = Router();

router.post('/auth/login', login);
router.use('/products', products);
router.use('/orders', orders);
router.use('/admin', admin);

export default router;


