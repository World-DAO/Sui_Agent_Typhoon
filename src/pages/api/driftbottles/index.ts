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
    data?: Bottle[];
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: '只支持 GET 请求' });
    }

    try {
        // 这里替换为你的数据获取逻辑
        const bottles: Bottle[] = [
            {
                id: 1,
                title: "第一个漂流瓶",
                body: "这是第一个漂流瓶的内容",
                author: "作者1",
                time: new Date()
            },
            {
                id: 2,
                title: "第二个漂流瓶",
                body: "这是第二个漂流瓶的内容",
                author: "作者2",
                time: new Date()
            },
            {
                id: 3,
                title: "第三个漂流瓶",
                body: "这是第三个漂流瓶的内容",
                author: "作者1",
                time: new Date()
            },
            {
                id: 4,
                title: "第四个漂流瓶",
                body: "这是第四个漂流瓶的内容",
                author: "作者1",
                time: new Date()
            },
            {
                id: 5,
                title: "第5个漂流瓶",
                body: "这是第5个漂流瓶的内容",
                author: "作者3",
                time: new Date()
            },
            {
                id: 6,
                title: "第6个漂流瓶",
                body: "这是第6个漂流瓶的内容",
                author: "作者2",
                time: new Date()
            },
            {
                id: 7,
                title: "第7个漂流瓶",
                body: "这是第7个漂流瓶的内容",
                author: "作者5",
                time: new Date()
            },
        ];

        return res.status(200).json({
            success: true,
            message: '获取成功',
            data: bottles
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
} 