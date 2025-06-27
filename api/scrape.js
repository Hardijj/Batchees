const fetch = require('node-fetch');
const crypto = require('crypto');
const { JSDOM } = require('jsdom');

// STEP 1: URL to scrape
const TARGET_URL = 'https://studyverse-for-9th.infy.uk/Maths.html';

// Utility to extract hex strings from toNumbers("hex") calls
function extractHexGroups(html) {
  const matches = [...html.matchAll(/toNumbers["']([a-f0-9]{16,})["']/gi)];
  return matches.map(m => m[1]);
}

// Emulates slowAES.decrypt from browser (AES-128-CBC + zero padding)
function decryptAES128CBC(keyHex, ivHex, cipherHex) {
  const key = Buffer.from(keyHex, 'hex').slice(0, 16);
  const iv = Buffer.from(ivHex, 'hex').slice(0, 16);
  const cipher = Buffer.from(cipherHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  decipher.setAutoPadding(false);
  const decrypted = Buffer.concat([decipher.update(cipher), decipher.final()]);
  return decrypted.toString('hex');
}

// Fix index_1.m3u8 links to real video files
function maybeFixM3U8(url) {
  const match = url.match(/\/(\d{7})\/(\d{7})\/index_\d+\.m3u8/);
  if (!match) return url;

  const [_, folder1, folder2] = match;
  const last7 = folder2.slice(-7);
  const domain = url.includes('d1qcficr3lu37x') ? 'd1qcficr3lu37x' : 'd274dp7v20n4nf';
  return `https://${domain}.cloudfront.net/file_library/videos/channel_vod_non_drm_hls/${folder1}/${folder2}/${folder2}_${last7}.m3u8`;
}

// Main scraping function
(async () => {
  console.log('Step 1: Fetching page…');
  let html = await fetch(TARGET_URL).then(r => r.text());

  // If already has chapters, skip decrypt
  if (html.includes('chapter-card')) {
    console.log('✅ Page already unlocked');
  } else {
    console.log('🔐 Challenge detected… solving…');
    const [keyHex, ivHex, cipherHex] = extractHexGroups(html);
    const cookieValue = decryptAES128CBC(keyHex, ivHex, cipherHex);
    const cookie = `__test=${cookieValue}`;
    const url2 = TARGET_URL.includes('?') ? TARGET_URL + '&i=1' : TARGET_URL + '?i=1';

    html = await fetch(url2, {
      headers: { Cookie: cookie, 'User-Agent': 'Mozilla/5.0' },
    }).then(r => r.text());
    console.log('✅ Challenge passed, HTML received');
  }

  console.log('Step 2: Parsing HTML...');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const result = [];
  document.querySelectorAll('.chapter-card').forEach(card => {
    const chapter = card.querySelector('.chapter-title')?.textContent.trim() || 'Unknown';
    const lectures = [];
    const notes = [];

    card.querySelectorAll('.lesson').forEach(row => {
      const label = row.querySelector('span')?.textContent.trim().replace(':','');
      const a = row.querySelector('a')?.href;
      if (!label || !a) return;

      if (a.endsWith('.pdf')) {
        notes.push({ lecture: label, url: a });
      } else if (a.includes('youtube.com') || a.includes('youtu.be')) {
        lectures.push({ lecture: label, youtubeUrl: a });
      } else {
        const raw = new URL(a).searchParams.get('url') || a;
        const m3u8 = maybeFixM3U8(raw);
        lectures.push({ lecture: label, m3u8Url: m3u8 });
      }
    });

    result.push({ chapter, lectures, notes });
  });

  console.log('\n✅ Final extracted data:\n');
  console.dir({ chapters: result }, { depth: null });
})();
