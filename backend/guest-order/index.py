import json
import os
import psycopg2
import urllib.request

def send_telegram(message: str):
    token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    chat_id = os.environ.get('TELEGRAM_CHAT_ID', '')
    if not token or not chat_id:
        return
    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        data = json.dumps({"chat_id": chat_id, "text": message, "parse_mode": "HTML"}).encode()
        req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass

def handler(event: dict, context) -> dict:
    """Сохраняет подтверждение участия гостя, выбор блюда, напитков и пожелание. Отправляет уведомление в Telegram."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    if event.get('httpMethod') == 'GET':
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        cur.execute("""
            SELECT id, guest_name, coming, guests_count, hot_dish, alcohol, wish, created_at
            FROM t_p98537980_wedding_invitation_c.guest_orders
            ORDER BY created_at DESC
        """)
        rows = cur.fetchall()
        cur.close()
        conn.close()
        result = [
            {
                'id': r[0],
                'guest_name': r[1],
                'coming': r[2],
                'guests_count': r[3],
                'hot_dish': r[4],
                'alcohol': r[5] or [],
                'wish': r[6],
                'created_at': str(r[7]),
            }
            for r in rows
        ]
        return {'statusCode': 200, 'headers': headers, 'body': json.dumps(result, ensure_ascii=False)}

    if event.get('httpMethod') == 'POST':
        body = json.loads(event.get('body') or '{}')
        guest_name = body.get('guest_name', '').strip()
        coming = body.get('coming', 'yes')
        guests_count = int(body.get('guests_count', 1))
        hot_dish = body.get('hot_dish', '').strip()
        alcohol = body.get('alcohol', [])
        wish = body.get('wish', '').strip()

        if not guest_name:
            return {'statusCode': 400, 'headers': headers, 'body': json.dumps({'error': 'Укажите имя'}, ensure_ascii=False)}

        alcohol_arr = '{' + ','.join(f'"{a}"' for a in alcohol) + '}'

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        cur.execute(
            """INSERT INTO t_p98537980_wedding_invitation_c.guest_orders
               (guest_name, coming, guests_count, hot_dish, alcohol, wish)
               VALUES (%s, %s, %s, %s, %s, %s) RETURNING id""",
            (guest_name, coming, guests_count, hot_dish or None, alcohol_arr, wish or None)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        coming_label = "✅ Придёт" if coming == "yes" else "❌ Не придёт"
        alcohol_text = ", ".join(alcohol) if alcohol else "—"
        send_telegram(
            f"💌 <b>Новый ответ гостя</b>\n\n"
            f"👤 <b>Имя:</b> {guest_name}\n"
            f"📋 <b>Участие:</b> {coming_label}\n"
            f"🍽 <b>Горячее:</b> {hot_dish or '—'}\n"
            f"🥂 <b>Напитки:</b> {alcohol_text}\n"
            f"💬 <b>Пожелание:</b> {wish or '—'}"
        )

        return {'statusCode': 200, 'headers': headers, 'body': json.dumps({'ok': True, 'id': new_id}, ensure_ascii=False)}

    return {'statusCode': 405, 'headers': headers, 'body': ''}