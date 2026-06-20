import Redis from 'ioredis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // รหัส Token บอทไลน์ของพี่บอม (ใส่ตัวเต็มยาวๆ ของพี่บอมในเครื่องหมายคำพูดได้เลยครับ)
    const CHANNEL_ACCESS_TOKEN = 'X4cZS0+Cmqx0605CyzUgJthk6LekJBvbmruhcuFY/V01lUstJbGQ5qLgV2z1BCDX/flD5hvn06X0D07mcjNbFqo8Qr1tTsHg1fUghQKg1ln7STHNBOoVhqvHVM33Qk3ZdP/vCj3DeqGYj7SoGpqe6wdB04t89/1O/w1cDnyilFU=';
    
    // รหัสกลุ่ม ซุ้ม สวนเส ของพี่บอม
    const GROUP_ID = 'C5def3270e807596d7e2d476e7c2e5004';

    // 🔴 วางรหัส REDIS_URL ตัวเต็มที่กด Show secret แล้วตรงนี้ครับ
    const redisUrl = 'REDIS_URL="redis://default:QVodYczjjWuUIkeI1xziE8LzqCYzADZ9@language-megaprecise-tigerlily-30099.db.redis.io:11998"';
    const redis = new Redis(redisUrl);

    try {
        const storedPlayers = await redis.get('football_players');
        let players = storedPlayers ? JSON.parse(storedPlayers) : [];

        if (name && name.trim() !== '') {
            players.push(name.trim());
            await redis.set('football_players', JSON.stringify(players));
        }

        await redis.quit();

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
        try { await redis.quit(); } catch(e) {}
        return res.status(500).json({ message: error.message });
    }
}
