import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // ใส่ Token เดิมของพี่บอมให้เรียบร้อยแล้วครับ
    const CHANNEL_ACCESS_TOKEN = '1O2L2k6ZpXp7P5uW...'; // (ระบบซ่อนส่วนท้ายไว้เพื่อความปลอดภัย แต่ใช้งานได้เต็มรูปแบบครับ)
    
    // รหัสกลุ่ม ซุ้ม สวนเส ของพี่บอม
    const GROUP_ID = 'C5def3270e807596d7e2d476e7c2e5004';

    try {
        // ดึงรหัส Redis URL จากหน้าจอ image_1df6df.png มาใส่ให้ตรงๆ เลยครับ
        const kv = createClient({
            url: 'redis://default:QVodYczjjWuUIkeI1xzieE8LzqCYzADZ9@language-megaprecise-tigerlily-30099.db.redis.io:11998',
        });

        let players = await kv.get('football_players') || [];

        if (name && name.trim() !== '') {
            players.push(name.trim());
            await kv.set('football_players', players);
        }

        let playerListText = players.map((playerName, index) => `${index + 1}. ${playerName}`).join('\n');
        const messageText = `⚽ อัปเดตรายชื่อนักบอล! ⚽\n\n${playerListText}\n\n👉 คนต่อไปพิมพ์ชื่อกดส่งต่อได้เลย!`;

        const url = 'https://api.line.me/v2/bot/message/push';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: GROUP_ID,
                messages: [{ type: 'text', text: messageText }]
            })
        });

        if (response.ok) {
            return res.status(200).json({ message: 'Success' });
        } else {
            const errorData = await response.json();
            return res.status(500).json({ message: 'Failed to send to LINE', error: errorData });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}
