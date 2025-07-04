import puppeteer from 'puppeteer';
import fs from 'fs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function postToTwitter({ username, password, content, imagePath = null }) {
  console.log('🐦 Starting Twitter automation...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // Navigate to Twitter login
    console.log('📱 Navigating to X (Twitter) login page...');
    await page.goto('https://x.com/i/flow/login', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Login process
    console.log('🔐 Logging in...');
    await page.waitForSelector('input[name="text"]', { timeout: 15000 });
    await page.type('input[name="text"]', username, { delay: 100 });

    // Click Next
    const nextButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
      return buttons.find(btn => 
        btn.innerText && btn.innerText.trim().toLowerCase() === 'next'
      );
    });
    if (nextButton) {
      await nextButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    await delay(2000);

    // Handle potential username confirmation
    try {
      await page.waitForSelector('input[data-testid="ocfEnterTextTextInput"]', { timeout: 5000 });
      console.log('🔄 Username confirmation required...');
      await page.type('input[data-testid="ocfEnterTextTextInput"]', username, { delay: 50 });
      
      const confirmNextButton = await page.evaluateHandle(() => {
        const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
        return buttons.find(btn => 
          btn.innerText && btn.innerText.trim().toLowerCase() === 'next'
        );
      });
      if (confirmNextButton) {
        await confirmNextButton.click();
      }
      await delay(2000);
    } catch (e) {
      // Username confirmation not needed
    }

    // Enter password
    console.log('🔑 Entering password...');
    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    await page.type('input[name="password"]', password, { delay: 100 });

    // Click Log in
    const loginButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('div[role="button"], button'));
      return buttons.find(btn => 
        btn.innerText && (
          btn.innerText.trim().toLowerCase() === 'log in' ||
          btn.innerText.trim().toLowerCase() === 'sign in'
        )
      );
    });
    if (loginButton) {
      await loginButton.click();
    } else {
      await page.keyboard.press('Enter');
    }

    // Wait for home page
    console.log('⏳ Waiting for home page...');
    await page.waitForSelector('[data-testid="tweetTextarea_0"]', { timeout: 20000 });
    console.log('✅ Login successful!');

    // Compose tweet
    console.log('✍️ Composing tweet...');
    const tweetTextarea = await page.$('[data-testid="tweetTextarea_0"]');
    await tweetTextarea.click();
    
    // Clear and type content
    await page.evaluate((selector) => {
      const input = document.querySelector(selector);
      if (input) {
        input.textContent = '';
        input.innerHTML = '';
        input.focus();
      }
    }, '[data-testid="tweetTextarea_0"]');
    
    await delay(500);
    
    // Type content character by character
    for (let i = 0; i < content.length; i++) {
      await page.keyboard.type(content[i], { delay: 50 });
      
      if (i % 10 === 0) {
        await page.evaluate((selector) => {
          const input = document.querySelector(selector);
          if (input) {
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }, '[data-testid="tweetTextarea_0"]');
      }
    }

    // Trigger events to enable Post button
    await page.evaluate((selector) => {
      const input = document.querySelector(selector);
      if (input) {
        const events = ['input', 'change', 'keyup', 'blur', 'focus'];
        events.forEach(eventType => {
          input.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
      }
    }, '[data-testid="tweetTextarea_0"]');

    // Add image if provided
    if (imagePath && fs.existsSync(imagePath)) {
      console.log('📎 Adding image...');
      const fileInput = await page.$('input[data-testid="fileInput"]');
      await fileInput.uploadFile(imagePath);
      await delay(3000);
    }

    // Post tweet
    console.log('🚀 Posting tweet...');
    await delay(2000);

    // Find and click Post button
    const postButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('[data-testid="tweetButton"]');
      for (const button of buttons) {
        const style = getComputedStyle(button);
        const bgColor = style.backgroundColor;
        if (bgColor.includes('29, 155, 240') || bgColor.includes('15, 20, 25')) {
          return button;
        }
      }
      return null;
    });

    if (postButton) {
      await postButton.click();
      console.log('✅ Tweet posted successfully!');
      await delay(3000);
      return { success: true, message: 'Tweet posted successfully' };
    } else {
      throw new Error('Could not find enabled Post button');
    }

  } catch (error) {
    console.error('❌ Twitter automation error:', error);
    await page.screenshot({ path: 'twitter-error.png' });
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
}