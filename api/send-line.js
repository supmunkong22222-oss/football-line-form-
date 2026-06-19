export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const CHANNEL_ACCESS_TOKEN = 'X4cZS0+Cmqx0605CyzUgJthk6LekJBvbmruhcuFY/V01lUstJbGQ5qLgV2z1BCDX/flD5hvn06X0D07mcjNbFqo8Qr1tTsHg1fUghQKg1ln7STHNBOoVhqvHVM33Qk3ZdP/vCj3DeqGYj7SoGpqe6wdB04t89/1O/w1cDnyilFU=';

    // ดึงข้อมูลเหตุการณ์ที่ส่งมาจาก LINE
    const events = req.body.events || [];
    
    for (const event of events) {
        // ถ้าเป็นข้อความที่ส่งมาจากใน "กลุ่ม LINE"
        if (event.source && event.source.type === 'group') {
            const groupId = event.source.groupId; // นี่คือรหัสกลุ่มที่เราตามหาครับ!
            
            // บังคับให้บอทส่งข้อความตอบกลับเข้ากลุ่มทันที เพื่อบอกรหัสกลุ่มให้เราเห็น
            await fetch('https://api.line.me/v2/bot/message/push', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: groupId,
                    messages: [
                        {
                            type: 'text',
                            text: `รหัสกลุ่มของคุณคือ:\n${groupId}`
                        }
                    ]
                })
            });
        }
    }

    return res.status(200).json({ message: 'OK' });
}
