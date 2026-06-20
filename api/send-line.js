import Redis from 'ioredis';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // 🔴 จุดสำคัญ: ลบข้อความข้างล่างนี้ออก แล้วเอารหัส Token ตัวจริงยาวๆ ของพี่บอมมาวางใส่ในเครื่องหมายคำพูดครับ
    const CHANNEL_ACCESS_TOKEN = 'X4cZS0+Cmqx0605CyzUgJthk6LekJBvbmruhcuFY/V01lUstJbGQ5qLgV2z1BCDX/flD5hvn06X0D07mcjNbFqo8Qr1tTsHg1fUghQKg1ln7STHNBOoVhqvHVM33Qk3ZdP/vCj3DeqGYj7SoGpqe6wdB04t89/1O/w1cDnyilFU=';
    
    // รหัสกลุ่ม ซุ้ม สวนเส ของพี่บอม
    const GROUP_ID = 'C5def3270e807596d7e2d476e7c2e5004';

    // รหัสเชื่อมต่อฐานข้อมูล Redis Cloud จากหน้าจอ Vercel ของพี่บอม
    const redisUrl = 'redis://default:QVodYczjjWuUIkeI1xzieE8LzqCYzADZ9@language-megaprecise-tigerlily-30099.db.redis.io:11998';
    const redis = new Redis(redisUrl);

    try {
        // 1. ดึงข้อมูลรายชื่อที่มีอยู่ในฐานข้อมูลออกมาก่อน
        const storedPlayers = await redis.get('football_players');
        let players = storedPlayers ? JSON.parse(storedPlayers) : [];

        // 2. เอารายชื่อใหม่ที่เพิ่งกรอก เพิ่มต่อท้ายเข้าไป
        if (name && name.trim() !== '') {
            players.push(name.trim());
            // บันทึกรายการใหม่กลับเข้าไปในฐานข้อมูล
            await redis.set('football_players', JSON.stringify(players));
        }

        // ปิดการเชื่อมต่อคลังข้อมูลทันทีเมื่อบันทึกเสร็จ
        await redis.quit();

        // 3. จัดหน้าตาข้อชื่อเรียงลำดับเป็น 1. 2. 3.
        let playerListText = players.map((playerName, index) => `${index + 1}. ${playerName}`).join('\n');
        const messageText = `⚽ อัปเดตรายชื่อนักบอล! ⚽\n\n${playerListText}\n\n👉 คนต่อไปพิมพ์ชื่อกดส่งต่อได้เลย!`;

        // 4. ส่งข้อความเข้ากลุ่ม LINE
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
