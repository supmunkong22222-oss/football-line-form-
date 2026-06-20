const Redis = require('ioredis');
const axios = require('axios');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // รหัส Token บอทไลน์ของพี่บอม
    const CHANNEL_ACCESS_TOKEN = 'X4cZS0+Cmqx0605CyzUgJthk6LekJBvbmruhcufY/V011UstJbG95qLgV2z1BCDX/f1D5hvn06X0D0...'; 
    
    // รหัสกลุ่ม ซุ้ม สวนเส ของพี่บอม
    const GROUP_ID = 'C5def3270e807596d7e2d476e7c2e5004';

    // รหัสเชื่อมต่อฐานข้อมูล Redis Cloud
    const redisUrl = 'redis://default:QVodYczjjWuUIkeI1xzieE8LzqCYzADZ9@language-megaprecise-tigerlily-30099.db.redis.io:11998';
    const redis = new Redis(redisUrl);

    try {
        // 1. ดึงข้อมูลรายชื่อจากฐานข้อมูล
        const storedPlayers = await redis.get('football_players');
        let players = storedPlayers ? JSON.parse(storedPlayers) : [];

        // 2. เพิ่มชื่อใหม่เข้าไปในรายการ
        if (name && name.trim() !== '') {
            players.push(name.trim());
            await redis.set('football_players', JSON.stringify(players));
        }

        // ปิดการเชื่อมต่อฐานข้อมูล
        await redis.quit();

        // 3. เรียงลำดับชื่อนักบอล 1. 2. 3.
        let playerListText = players.map((playerName, index) => `${index + 1}. ${playerName}`).join('\n');
        const messageText = `⚽ อัปเดตรายชื่อนักบอล! ⚽\n\n${playerListText}\n\n👉 คนต่อไปพิมพ์ชื่อกดส่งต่อได้เลย!`;

        // 4. ส่งข้อความเข้ากลุ่ม LINE ผ่าน axios แทน fetch
        const url = 'https://api.line.me/v2/bot/message/push';
        
        const response = await axios.post(url, {
            to: GROUP_ID,
            messages: [{ type: 'text', text: messageText }]
        }, {
            headers: {
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200) {
            return res.status(200).json({ message: 'Success' });
        } else {
            return res.status(500).json({ message: 'Failed to send to LINE' });
        }
    } catch (error) {
        try { await redis.quit(); } catch(e) {}
        return res.status(500).json({ message: error.message });
    }
}
