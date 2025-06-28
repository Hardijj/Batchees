// Vercel serverless function — Puppeteer + Lambda Chromium
export const config = {
  runtime: 'nodejs18.x',  // regular Node runtime (NOT "edge")
  memory: 512             // plenty for headless Chrome
};

import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  const target = req.query.url;
  if (!target || !/^https?:\/\//i.test(target)) {
    return res.status(400).json({ error: 'missing or bad ?url=' });
  }

  /* ---- launch headless Chrome ------------------------------------ */
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(
      // true => prefer local Chrome when dev-testing; false on Vercel
      process.env.NODE_ENV !== 'production'
    ),
    headless: chromium.headless,
    ignoreHTTPSErrors: true
  });

  try {
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

    // 1️⃣ go to StudyVerse page (first load shows JS wall)
    await page.goto(target, { waitUntil: 'domcontentloaded' });

    // 2️⃣ wait max 12 s for REAL content: any .chapter-card appears
    await page.waitForSelector('.chapter-card', { timeout: 12_000 });

    // 3️⃣ grab full, post-JS HTML
    const html = await page.content();        // outerHTML of <html>

    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.status(200).send(html);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'puppeteer fail', detail: err.message });
  } finally {
    await browser.close();
  }
                                 }
