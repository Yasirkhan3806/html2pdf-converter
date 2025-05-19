const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors')

const app = express();
app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/generate-pdf', async (req, res) => {
  try {
    console.log(req.body)
    const items = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).send('Request body should be an array');
    }

    const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

    const page = await browser.newPage();

    for (const item of items) {
      const { html, filename } = item;
      
      await page.setContent(html, {
        waitUntil: ['networkidle0']
      });

      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });

      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(pdf);
    }
  } catch (error) {
    res.status(500).send('Error generating PDF: ' + error.message);
  }
});

app.get('/',(req,res)=>{
  res.status(200).json({message:"done"})
})

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});