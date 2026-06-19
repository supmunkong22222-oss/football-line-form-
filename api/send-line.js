export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { name } = req.body;

    // 🔴 เอา Channel Access Token ยาวๆ ที่พี่บอมกด Issue มาจากหน้า LINE Developers มาวางในเครื่องหมาย ' ' นี้แทนได้เลยครับ
    const CHANNEL_ACCESS_TOKEN = 'X4cZS0+Cmqx0605CyzUgJthk6LekJBvbmruhcuFY/V01lUstJbGQ5qLgV2z1BCDX/flD5hvn06X0D07mcjNbFqo8Qr1tTsHg1fUghQKg1ln7STHNBOoVhqvHVM33Qk3ZdP/vCj3DeqGYj7SoGpqe6wdB04t89/1O/w1cDnyilFU=';

    const url = 'https://api.line.me/v2/bot/message/broadcast';
    
    const messageData = {
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
