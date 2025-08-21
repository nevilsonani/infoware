import { Request, Response } from 'express';
import * as svc from '../services/products.service';
import { wrap } from '../utils/errors';

export const list = wrap(async (_req: Request, res: Response) => {
  const data = await svc.listProducts();
  res.json(data);
});

export const upsert = wrap(async (req: any, res: Response) => {
  const product = await svc.upsertProduct(req.user.id, req.body);
  res.status(201).json(product);
});

export const setStock = wrap(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { quantityInBase } = req.body;
  const product = await svc.updateStock(id, quantityInBase);
  res.json(product);
});


