// api/index.js
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-core');
// const chromium = require('chrome-aws-lambda');

app.use(cors()); // Enable CORS for all requests

app.get('/fetch-url', (req, res) => {
    const url = req.query.url;
    request(url, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            res.status(500).send('Error fetching URL');
        }
    });
});

// API to fetch URL and extract modal data
app.get('/fetch-facebookads-data', async (req, res) => {
    const url = req.query.url;

    if (!url) {
        return res.status(400).send('URL is required');
    }

    try {

        const browser = await puppeteer.launch({
            headless: true,
            args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            ],
            });

        const page = await browser.newPage();

        await page.goto(url, { waitUntil: 'networkidle2' }); // Ensure the page is fully loaded

        // Extracting all the required data from the modal
        const modalData = await page.evaluate(() => {
            // Find the target span or anchor element
            const linkElement = document.querySelector('.x1hl2dhg.x1lku1pv.x8t9es0.x1fvot60.xxio538.xjnfcd9.xq9mrsl.x1yc453h.x1h4wwuj.x1fcty0u.x1lliihq');

            // Extract the page name (e.g., "GoPetition") from the span with class "x8t9es0 x1fvot60 xxio538"
            const pageNameElement = document.querySelector('.x8t9es0.x1fvot60.xxio538.x108nfp6.xq9mrsl.x1h4wwuj.x117nqv4.xeuugli');
            const pageName = pageNameElement ? pageNameElement.innerText : null;

            // Extract the job-related text from the span with classes for the second block of content
            const jobTextElement = document.querySelector('span.x8t9es0.xw23nyj.xo1l8bm.x63nzvj.x108nfp6.xq9mrsl.x1h4wwuj.xeuugli div._4ik4._4ik5 span');
            const jobText = jobTextElement ? jobTextElement.innerText : null;

            // Return all the data in an object for the modal
            return {
                pageName,
                jobText,
                linkText: linkElement ? linkElement.innerText : null,  // Text from the link
                linkUrl: linkElement ? linkElement.href : null,        // URL from the link
            };
        });

        await browser.close();

        // Send the extracted data as a response for the modal
        res.json({ status: 'success', modalData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching or processing the URL');
    }
});




// app.get('/fetch-facebookads-data', async (req, res) => {
//     const url = req.query.url;

//     if (!url) {
//         return res.status(400).send('URL is required');
//     }

//     let browser;
//     try {
//         // Launch Puppeteer with chrome-aws-lambda configuration
//         browser = await puppeteer.launch({
//             args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
//             executablePath: await chromium.executablePath, // Use chromium's executable path
//             headless: chromium.headless,                  // Ensure headless mode
//         });

//         const page = await browser.newPage();

//         // Navigate to the page and wait for it to load
//         await page.goto(url, { waitUntil: 'networkidle2' });

//         // Extracting data
//         const modalData = await page.evaluate(() => {
//             const linkElement = document.querySelector('.x1hl2dhg.x1lku1pv.x8t9es0.x1fvot60.xxio538.xjnfcd9.xq9mrsl.x1yc453h.x1h4wwuj.x1fcty0u.x1lliihq');
//             const pageNameElement = document.querySelector('.x8t9es0.x1fvot60.xxio538.x108nfp6.xq9mrsl.x1h4wwuj.x117nqv4.xeuugli');
//             const jobTextElement = document.querySelector('span.x8t9es0.xw23nyj.xo1l8bm.x63nzvj.x108nfp6.xq9mrsl.x1h4wwuj.xeuugli div._4ik4._4ik5 span');

//             return {
//                 pageName: pageNameElement ? pageNameElement.innerText : null,
//                 jobText: jobTextElement ? jobTextElement.innerText : null,
//                 linkText: linkElement ? linkElement.innerText : null,
//                 linkUrl: linkElement ? linkElement.href : null,
//             };
//         });

//         // Close the browser instance
//         await browser.close();

//         // Send the extracted data as JSON
//         res.json({ status: 'success', modalData });
//     } catch (error) {
//         console.error(error);
//         if (browser) await browser.close();
//         res.status(500).send('Error fetching or processing the URL');
//     }
// });



app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
});

