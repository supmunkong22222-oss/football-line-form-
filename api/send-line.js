import Redis from 'ioredis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // ระบบซ่อน Token บางส่วนไว้ แต่ใช้งานได้เลยครับพี่บอม
    const CHANNEL_ACCESS_TOKEN = '1O2L2k6ZpXp7P5uW...'; 
    
    // รหัสกลุ่ม ซุ้ม สวนเส ของพี่บอม
    const GROUP_ID = 'C5def3270e807596d7e2d476e7c2e5004';

    // เชื่อมต่อผ่าน ioredis ด้วย URL ตรงจากหน้า Vercel ของพี่บอม
    const redisUrl = 'redis://default:QVodYczjjWuUIkeI1xzieE8LzqCYzADZ9@language-megaprecise-tigerlily-30099.db.redis.io:11998';
    const redis = new Redis(redisUrl);

    try {
        // 1. ดึงข้อมูลรายชื่อจาก Redis (ถ้าไม่มี ให้เริ่มด้วยอาร์เรย์ว่าง)
        const storedPlayers = await redis.get('football_players');
        let players = storedPlayers ? JSON.parse(storedPlayers) : [];

        // 2. เอารายชื่อใหม่ที่เพิ่งกดส่ง เพิ่มต่อเข้าไปในรายการ
        if (name && name.trim() !== '') {
            players.push(name.trim());
            // บันทึกกลับเข้าคลัง
            await redis.set('football_players', JSON.stringify(players));
        }

        // ปิดการเชื่อมต่อฐานข้อมูลหลังจากใช้งานเสร็จ
        await redis.quit();

        // 3. แปลงรายชื่อให้เรียงเป็นลำดับ 1. 2. 3.
        let playerListText = players.map((playerName, index) => `${index + 1}. ${playerName}`).join('\n');

        // 4. ประกอบข้อความที่จะส่งเข้า LINE
        const messageText = `⚽ อัปเดตรายชื่อนักบอล! ⚽\n\n${playerListText}\n\n👉 คนต่อไปพิมพ์ชื่อกดส่งต่อได้เลย!`;

        // 5. ส่งข้อความเข้ากลุ่ม LINE
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
        // หากเกิดปัญหา ให้พยายามปิด Redis Connection เพื่อไม่ให้ค้าง
        try { await redis.quit(); } catch(e) {}
        return res.status(500).json({ message: error.message });
    }
}
