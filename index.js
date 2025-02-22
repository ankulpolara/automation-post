require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const INSTAGRAM_USERNAME = "social_hot_hub";
const INSTAGRAM_PASSWORD = "social12345";

async function postToInstagram(imageUrl, caption) {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

    await page.type('input[name="username"]', INSTAGRAM_USERNAME, { delay: 100 });
    await page.type('input[name="password"]', INSTAGRAM_PASSWORD, { delay: 100 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await page.goto('https://www.instagram.com/create/style/', { waitUntil: 'networkidle2' });

    const inputUploadHandle = await page.$('input[type="file"]');
    await inputUploadHandle.uploadFile(imageUrl);
    await page.waitForTimeout(3000);

    await page.click('button._acan._acao._acas');
    await page.waitForTimeout(2000);

    await page.type('textarea[aria-label="Write a caption..."]', caption, { delay: 100 });

    await page.click('button._acan._acao._acas');
    await page.waitForTimeout(5000);

    console.log("✅ Post uploaded successfully!");
    await browser.close();
}

app.post('/post-instagram', async (req, res) => {
    const posts = req.body.posts;

    for (const post of posts) {
        try {
            await postToInstagram(post.imageUrl, post.caption);

            // Update status in Google Sheets
            const updateUrl = `https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?rowIndex=${post.rowIndex}`;
            await fetch(updateUrl);
        } catch (error) {
            console.error("❌ Error posting:", error);
        }
    }

    res.send({ success: true });
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));


app.get("/", (req, res) => {
    res.send("Welcome to the server!");
  });
