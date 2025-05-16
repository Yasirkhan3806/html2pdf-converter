const chromium = require('@sparticuz/chromium');
const playwright = require('playwright-core');

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { source, landscape = false, use_print = false } = JSON.parse(req.body);

    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
      channel: 'chrome'
    });

    const page = await browser.newPage();
    await page.setContent(source, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape,
      printBackground: use_print,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();

    // Vercel-specific binary handling
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="document.pdf"');
    
    return res.status(200).send(Buffer.from(pdfBuffer.toString('base64'), 'base64'));

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ 
      error: error.message,
      success: false
    });
  }
};