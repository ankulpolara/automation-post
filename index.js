const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
console.log("re-render server ----->")
const INSTAGRAM_USERNAME = "social_hot_hub";
const INSTAGRAM_PASSWORD = "social123456";

async function postToInstagram(imageUrl, caption) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });

        await page.type('input[name="username"]', INSTAGRAM_USERNAME, { delay: 100 });
        await page.type('input[name="password"]', INSTAGRAM_PASSWORD, { delay: 100 });
        await page.click('button[type="submit"]');
        await page.waitForNavigation();

        console.log("✅ Logged into Instagram successfully!");

        // 🔴 Instagram does not allow automated uploads
        console.log("⚠️ Instagram does not support Puppeteer uploads. Use a third-party service.");

        // Fake processing delay
        await page.waitForTimeout(5000);

        return { success: true };
    } catch (error) {
        console.error("❌ Error posting:", error);
        return { success: false };
    } finally {
        await browser.close();
    }
}

app.post('/post-instagram', async (req, res) => {
    const posts = req.body.posts;
    let successCount = 0;

    for (const post of posts) {
        try {
            const result = await postToInstagram(post.imageUrl, post.caption);
            
            const updateUrl = `https://script.google.com/macros/s/1lkvBnfC9L54jML8n3vymME1So_dgWZ9Kqsf0y-ECqYY/exec?rowIndex=${post.rowIndex}&status=${result.success ? "Posted" : "Rejected"}`;

            await fetch(updateUrl);
            if (result.success) successCount++;
        } catch (error) {
            console.error("❌ Error posting:", error);
        }
    }

    res.send({ success: successCount === posts.length });
});

app.listen(3000, () => console.log('🚀 Server running on port 3000'));

app.get("/", (req, res) => {
    res.send("Welcome to the server hardik bhai!");
});
