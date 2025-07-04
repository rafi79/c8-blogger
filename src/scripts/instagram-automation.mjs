import puppeteer from 'puppeteer';
import fs from 'fs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function postToInstagram({ username, password, content, imagePath = null }) {
  console.log('📸 Starting Instagram automation...');
  
  if (!imagePath || !fs.existsSync(imagePath)) {
    return { success: false, message: 'Instagram requires an image to post' };
  }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();

  try {
    // Navigate to Instagram
    console.log('🔗 Navigating to Instagram...');
    await page.goto('https://www.instagram.com/accounts/login/', { 
      waitUntil: 'networkidle2' 
    });

    // Login
    console.log('🔐 Logging in...');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.type('input[name="username"]', username, { delay: 100 });
    await page.type('input[name="password"]', password, { delay: 100 });
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });

    console.log('✅ Login successful!');
    await delay(3000);

    // Start post creation
    console.log('📸 Starting post creation...');
    await page.waitForSelector('svg[aria-label="New post"]', { timeout: 15000 });
    await page.click('svg[aria-label="New post"]');
    await delay(3000);

    // Upload file
    console.log('📁 Uploading image...');
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Select from computer') || text.includes('Drag photos and videos here');
    }, { timeout: 15000 });

    const [fileChooser] = await Promise.all([
      page.waitForFileChooser({ timeout: 10000 }),
      page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const selectButton = buttons.find(btn => 
          btn.textContent.includes('Select from computer')
        );
        if (selectButton) {
          selectButton.click();
          return true;
        }
        return false;
      })
    ]);

    await fileChooser.accept([imagePath]);
    console.log('✅ Image uploaded successfully');

    // Navigate through crop screen
    console.log('⏳ Processing through crop screen...');
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Crop') || 
             Array.from(document.querySelectorAll('button')).some(btn => btn.textContent.trim() === 'Next');
    }, { timeout: 20000 });

    await delay(2000);

    // Click Next on crop screen
    const cropNextClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const nextButton = buttons.find(btn => btn.textContent.trim() === 'Next');
      if (nextButton) {
        nextButton.click();
        return true;
      }
      return false;
    });

    if (!cropNextClicked) {
      throw new Error('Could not find Next button on crop screen');
    }

    console.log('✅ Clicked Next on crop screen');
    await delay(3000);

    // Navigate through filter screen
    console.log('⏳ Processing through filter screen...');
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Filter') || text.includes('Edit') ||
             Array.from(document.querySelectorAll('button')).some(btn => btn.textContent.trim() === 'Next');
    }, { timeout: 20000 });

    await delay(2000);

    // Click Next on filter screen
    const filterNextClicked = await page.evaluate(() => {
      const buttonDivs = Array.from(document.querySelectorAll('div[role="button"]'));
      for (const div of buttonDivs) {
        const text = div.textContent.trim();
        if (text === 'Next') {
          div.click();
          return true;
        }
      }
      return false;
    });

    if (!filterNextClicked) {
      throw new Error('Could not find Next button on filter screen');
    }

    console.log('✅ Clicked Next on filter screen');
    await delay(3000);

    // Add caption
    console.log('✍️ Adding caption...');
    await page.waitForFunction(() => {
      const text = document.body.innerText;
      return text.includes('Write a caption') || 
             text.includes('Share') ||
             document.querySelector('textarea') !== null ||
             Array.from(document.querySelectorAll('button')).some(btn => btn.textContent.trim() === 'Share');
    }, { timeout: 15000 });

    // Find and fill caption
    const captionAdded = await page.evaluate((caption) => {
      const captionDiv = document.querySelector('div[aria-label="Write a caption..."]');
      if (captionDiv) {
        captionDiv.focus();
        captionDiv.textContent = caption;
        captionDiv.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }

      // Fallback selectors
      const fallbackSelectors = [
        'div[contenteditable="true"][role="textbox"]',
        'textarea[aria-label*="caption"]'
      ];

      for (const selector of fallbackSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          element.focus();
          element.textContent = caption;
          element.dispatchEvent(new Event('input', { bubbles: true }));
          return true;
        }
      }
      return false;
    }, content);

    if (captionAdded) {
      console.log(`✅ Caption added: "${content}"`);
    } else {
      console.log('⚠️ Caption field not found, proceeding without caption');
    }

    await delay(2000);

    // Share post
    console.log('🚀 Sharing post...');
    const shareClicked = await page.evaluate(() => {
      const buttonDivs = Array.from(document.querySelectorAll('div[role="button"]'));
      for (const div of buttonDivs) {
        const text = div.textContent.trim();
        if (text === 'Share') {
          div.click();
          return true;
        }
      }
      return false;
    });

    if (!shareClicked) {
      throw new Error('Could not find Share button');
    }

    console.log('✅ Instagram post shared successfully!');
    await delay(5000);

    return { success: true, message: 'Instagram post created successfully' };

  } catch (error) {
    console.error('❌ Instagram automation error:', error);
    await page.screenshot({ path: 'instagram-error.png' });
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
}