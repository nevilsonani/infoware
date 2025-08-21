import { Request, Response } from 'express';
import * as svc from '../services/orders.service';
import { wrap } from '../utils/errors';

export const create = wrap(async (req: any, res: Response) => {
  const order = await svc.placeOrder(req.user.id, req.body.items);
  res.status(201).json(order);
});

export const listBuyer = wrap(async (req: any, res: Response) => {
  const orders = await svc.listBuyerOrders(req.user.id);
  res.json(orders);
});

export const listSupplier = wrap(async (req: any, res: Response) => {
  const orders = await svc.listSupplierIncomingOrders(req.user.id);
  res.json(orders);
});

export const changeStatus = wrap(async (req: any, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: 'APPROVED'|'FULFILLED'|'CANCELLED' };
  const updated = await svc.changeOrderStatus(id, status, req.user.id);
  res.json(updated);
});


