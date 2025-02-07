import { NextApiRequest, NextApiResponse } from 'next';
import { generateToken } from '@/lib/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { address } = req.body;
  const token = generateToken(address);
  
  return res.json({ token });
}
