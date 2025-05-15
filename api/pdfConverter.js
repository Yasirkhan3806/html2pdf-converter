const chromium = require('@sparticuz/chromium');
const playwright = require('playwright-core');

module.exports = async (req, res) => {
  // Set CORS headers for all incoming requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Optional: Simple GET endpoint to verify server is live
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'Server is live' });
  }

  try {
    // Properly handle both parsed and unparsed bodies
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { source, landscape, use_print } = body;

    const browser = await playwright.chromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(source, { waitUntil: 'networkidle' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: landscape || false,
      printBackground: use_print || false,
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error(error);
    // Ensure error response includes CORS headers
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
};