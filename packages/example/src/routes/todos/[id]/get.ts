import { Request, Response } from 'express';

export default async function (req: Request, res: Response) {
  res.json({ message: req.params.id });
}
