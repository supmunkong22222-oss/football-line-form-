export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // 🔴 1. ใส่ Channel Access Token เดิมของพี่บอมตรงนี้ครับ
    const CHANNEL_ACCESS_TOKEN = 'X4cZS0+Cmqx0605CyzUgJthk6LekJBvbmruhcuFY/V01lUstJbGQ5qLgV2z1BCDX/flD5hvn06X0D07mcjNbFqo8Qr1tTsHg1fUghQKg1ln7STHNBOoVhqvHVM33Qk3ZdP/vCj3DeqGYj7SoGpqe6wdB04t89/1O/w1cDnyilFU=';

    // ล็อกเป้าหมายส่งเข้ากลุ่ม ซุ้ม สวนเส เรียบร้อยครับ
    const GROUP_ID = 'C5def3270e807596d7e2d476e7c2e5004';

    const url = 'https://api.line.me/v2/bot/message/push';
    
    const messageData = {
        to: GROUP_ID,
        messages: [
            {
                type: 'text',
                text: `⚽ มีนักบอลลงชื่อเพิ่ม! ⚽\n👤 ชื่อ: ${name}\n👉 คนต่อไปพิมพ์ชื่อกดส่งต่อได้เลย!`
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
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
