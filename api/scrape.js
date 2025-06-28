// Vercel Serverless — Node 18 runtime
export const config = { runtime: 'nodejs18.x' };

import crypto from 'crypto';

// helper – small fetch wrapper
const getText = (url, headers = {}) =>
  fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', ...headers } })
    .then(r => r.text());

export default async function handler(req, res) {
  const src = req.query.url;
  if (!src || !/^https?:\/\//i.test(src)) {
    return res.status(400).json({ error: 'missing or bad ?url=' });
  }

  // 1️⃣ first request (may hit the wall)
  let html = await getText(src);

  // Shortcut if page already contains real content
  if (html.includes('class="chapter-card"')) {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  // 2️⃣ extract ALL toNumbers("…") tokens — accept any even-length hex
  const hexes = [...html.matchAll(/toNumbers["']([0-9a-f]{16,})["']/gi)]
               .map(m => m[1]);

  if (hexes.length < 3) {
    // If the wall ever changes, dump for debugging
    return res.status(500).json({ error: 'challenge parse fail', found: hexes.length });
  }

  const [keyHex, ivHex, cipherHex] = hexes;

  // 3️⃣ AES-128-CBC decrypt (emulates slowAES.decrypt)
  const key    = Buffer.from(keyHex,    'hex').slice(0, 16);
  const iv     = Buffer.from(ivHex,     'hex').slice(0, 16);
  const cipher = Buffer.from(cipherHex, 'hex');

  let plain;
  try {
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    decipher.setAutoPadding(false);                // zero padding
    plain = Buffer.concat([decipher.update(cipher), decipher.final()]);
  } catch (e) {
    return res.status(500).json({ error: 'AES decrypt error', detail: e.message });
  }

  const cookie = `__test=${plain.toString('hex')}`;
  const url2   = src.includes('?') ? `${src}&i=1` : `${src}?i=1`;

  // 4️⃣ second request with cookie → real page
  html = await getText(url2, { Cookie: cookie });

  res.setHeader('content-type', 'text/html; charset=utf-8');
  return res.send(html);
}
