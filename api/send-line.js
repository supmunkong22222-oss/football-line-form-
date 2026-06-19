import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // 🔴 1. ใส่ Channel Access Token เดิมของพี่บอมตรงนี้ครับ
    const CHANNEL_ACCESS_TOKEN = 'X4cZS0+Cmqx0605CyzUgJthk6LekJBvbmruhcuFY/V01lUstJbGQ5qLgV2z1BCDX/flD5hvn06X0D07mcjNbFqo8Qr1tTsHg1fUghQKg1ln7STHNBOoVhqvHVM33Qk3ZdP/vCj3DeqGYj7SoGpqe6wdB04t89/1O/w1cDnyilFU=';
    
    // รหัสกลุ่ม ซุ้ม สวนเส ของพี่บอม
    const GROUP_ID = 'C5def3270e807596d7e2d476e7c2e5004';

    try {
        // เชื่อมต่อระบบ KV Database อัตโนมัติ (อ่านค่าจากระบบที่ต่อไว้เมื่อกี้)
        const kv = createClient({
            url: process.env.KV_REST_API_URL,
            token: process.env.KV_REST_API_TOKEN,
        });

        // 1. ดึงรายชื่อเก่าที่มีอยู่ในฐานข้อมูลออกมาก่อน (ถ้าไม่มีให้เป็นอาร์เรย์ว่าง)
        let players = await kv.get('football_players') || [];

        // 2. เอารายชื่อใหม่ที่เพิ่งกดส่ง เพิ่มต่อเข้าไปในรายการ
        if (name && name.trim() !== '') {
            players.push(name.trim());
            // บันทึกรายการที่อัปเดตล่าสุดกลับเข้าไปในฐานข้อมูล
            await kv.set('football_players', players);
        }

        // 3. จัดหน้าตาข้อความ แปลงรายชื่อให้เรียงเป็นลำดับ 1. 2. 3.
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
        return res.status(500).json({ message: error.message });
    }
}
