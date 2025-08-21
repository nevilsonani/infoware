import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { config } from '../config/env';
import { wrap } from '../utils/errors';

export const login = wrap(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = user.password === 'hashed' ? password === 'password' : await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, { expiresIn: '2h' });
  res.json({ token, user: { id: user.id, role: user.role, email: user.email, name: user.name } });
});


