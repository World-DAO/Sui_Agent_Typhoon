import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/lib/jwt';

const mockMessages = [
  { id: 1, content: "欢迎来到Web3酒馆！", userId: "0x1" },
  { id: 2, content: "今天天气真好啊", userId: "0x2" },
  { id: 3, content: "有人想聊聊web3吗？", userId: "0x3" },
  { id: 4, content: "我在这里交到了好多朋友", userId: "0x4" },
  { id: 5, content: "这里的氛围真不错", userId: "0x5" }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({ messages: mockMessages });
}
