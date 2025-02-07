import type { NextApiRequest, NextApiResponse } from 'next';

type Bottle = {
    title: string;
    body: string;
    author: string;
    time: Date;
    id: number;
}

type ApiResponse = {
    success: boolean;
    message: string;
    data?: Bottle;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: '只支持 GET 请求' });
    }

    try {
        // 这里替换为你的数据获取逻辑
        const bottle: Bottle = {
            id: Number(id),
            title: `漂流瓶 ${id}`,
            body: `这是漂流瓶 ${id} 的内容`,
            author: `作者 ${id}`,
            time: new Date()
        };

        return res.status(200).json({
            success: true,
            message: '获取成功',
            data: bottle
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
} 