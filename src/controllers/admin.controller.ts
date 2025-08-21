import { Request, Response } from 'express';
import * as orders from '../services/orders.service';
import { wrap } from '../utils/errors';

export const changeStatus = wrap(async (req: any, res: Response) => {
  const id = Number(req.params.id);
  const { status } = req.body as { status: 'APPROVED'|'FULFILLED'|'CANCELLED' };
  const updated = await orders.changeOrderStatus(id, status, req.user.id);
  res.json(updated);
});

export const analytics = wrap(async (_req: Request, res: Response) => {
  const data = await orders.analytics();
  res.json(data);
});


