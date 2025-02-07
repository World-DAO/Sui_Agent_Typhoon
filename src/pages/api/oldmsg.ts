import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/jwt';

const mockOldMessages = [
  { id: 6, content: "这是一条已读消息", userId: "0x6" },
  { id: 7, content: "这是另一条已读消息", userId: "0x7" }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ messages: mockOldMessages });
}
