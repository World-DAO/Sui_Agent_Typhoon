import type { NextApiRequest, NextApiResponse } from 'next';

type TestResponse = {
  success: boolean;
  message: string;
  data?: {
    userId: number;
    username: string;
    lastLoginTime: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TestResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '只支持 GET 请求' });
  }

  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ success: false, message: '缺少 userId 参数' });
    }

    // 模拟数据
    const mockData = {
      userId: Number(userId),
      username: `用户${userId}`,
      lastLoginTime: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      message: '获取成功',
      data: mockData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}
