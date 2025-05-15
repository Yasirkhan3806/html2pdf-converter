const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
app.use(express.json()); // Accept JSON body
app.use(cors({ origin: '*' })); // Enable CORS


app.get('/',(req,res)=>{
     console.log("a request is here")
    res.send("i am listening")
   
})


app.post('/generate-pdf', async (req, res) => {
  try {
    const { source, landscape = false, use_print = false } = req.body;

    if (!source) {
      return res.status(400).send('Missing "source" HTML content.');
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(source, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: landscape,
      printBackground: use_print
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="generated.pdf"',
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).send('PDF generation failed');
  }
});

app.listen(3000, () => console.log('Server listening on http://localhost:3000'));
