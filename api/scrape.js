//  ▸  Deploy on Vercel (Node 18+ runtime)
//  ▸  Usage:
//       https://your-vercel-app.vercel.app/api/scrape?url=https://studyverse-for-9th.infy.uk/Maths.html
//
//  Response: 200 text/html  (full page HTML)

import crypto from 'crypto';

export default async function handler(req, res) {
  const target = req.query.url;
  if (!target || !/^https?:\/\//i.test(target)) {
    return res.status(400).json({ error: 'missing or bad url' });
  }

  const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';

  /* ---------- 1. first fetch (may be the cookie wall) -------- */
  let html = await fetch(target, { headers: { 'User-Agent': UA } })
    .then(r => r.text())
    .catch(() => null);

  if (!html) return res.status(502).json({ error: 'first fetch failed' });

  /* If real page already received, send it back ---------------- */
  if (html.includes('class="chapter-card"')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  /* ---------- 2. extract the three hex strings ---------------- */
  const hexes = [...html.matchAll(/toNumbers["']([0-9a-f]{16,})["']/gi)]
                .map(m => m[1]);
  if (hexes.length < 3) {
    return res.status(500).json({ error: 'challenge parse fail' });
  }
  const [keyHex, ivHex, cipherHex] = hexes;

  /* ---------- 3. AES-128-CBC decrypt (slowAES equivalent) ----- */
  try {
    const decipher = crypto.createDecipheriv(
      'aes-128-cbc',
      Buffer.from(keyHex, 'hex'),
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAutoPadding(false);                    // zero-padding
    const plain = Buffer.concat([
      decipher.update(Buffer.from(cipherHex, 'hex')),
      decipher.final()
    ]);
    const cookieVal = plain.toString('hex');

    /* ---------- 4. second fetch with __test cookie ------------ */
    const urlWithI = target.includes('?') ? target + '&i=1' : target + '?i=1';
    html = await fetch(urlWithI, {
      headers: {
        'User-Agent': UA,
        'Cookie'    : `__test=${cookieVal}`
      }
    }).then(r => r.text());

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);

  } catch (e) {
    return res.status(500).json({ error: 'AES decrypt fail', detail: e.message });
  }
}
