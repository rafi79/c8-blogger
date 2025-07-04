import puppeteer from 'puppeteer';
import fs from 'fs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function postToFacebook({ email, password, content, imagePath = null }) {
  console.log('📘 Starting Facebook automation...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });

  const page = await browser.newPage();

  try {
    // Navigate to Facebook
    console.log('🔗 Navigating to Facebook...');
    await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });
    await delay(3000);

    // Handle cookies
    try {
      await page.click('[data-testid="cookie-policy-manage-dialog-accept-button"]', { timeout: 5000 });
      await delay(2000);
    } catch (e) {
      // No cookie dialog
    }

    // Login
    console.log('🔐 Logging in...');
    await page.type('#email', email, { delay: 100 });
    await page.type('#pass', password, { delay: 100 });
    await page.click('[name="login"]');
    await delay(8000);

    // Handle notifications dialog
    try {
      const notificationButtons = await page.$$('button');
      for (const button of notificationButtons) {
        const text = await page.evaluate(el => el.textContent, button);
        if (text && (text.includes('Not Now') || text.includes('Block'))) {
          await button.click();
          await delay(2000);
          break;
        }
      }
    } catch (e) {
      // No notification dialog
    }

    // Navigate to home feed
    await page.goto('https://www.facebook.com/', { waitUntil: 'networkidle2' });
    await delay(5000);

    // Find post composer
    console.log('✍️ Finding post composer...');
    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(2000);

    // Click on "What's on your mind" area
    const composer = await page.evaluateHandle(() => {
      const elements = document.querySelectorAll('*');
      for (const element of elements) {
        const text = element.textContent || '';
        if (text.includes("What's on your mind") && 
            element.getAttribute('role') === 'button') {
          return element;
        }
      }
      return null;
    });

    if (!composer) {
      throw new Error('Could not find post composer');
    }

    await composer.click();
    await delay(5000);

    // Find text input in modal
    console.log('📝 Finding text input...');
    const textInput = await page.evaluateHandle(() => {
      const selectors = [
        'div[contenteditable="true"]',
        'div[role="textbox"]',
        'div[aria-label*="What\'s on your mind"]'
      ];
      
      for (const selector of selectors) {
        const inputs = document.querySelectorAll(selector);
        for (const input of inputs) {
          const rect = input.getBoundingClientRect();
          if (rect.width > 300 && rect.height > 20) {
            return input;
          }
        }
      }
      return null;
    });

    if (!textInput) {
      throw new Error('Could not find text input');
    }

    await textInput.click();
    await delay(1000);

    // Type content
    console.log('⌨️ Typing content...');
    await page.evaluate((text) => {
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, text);
    }, content);

    await delay(2000);

    // Add image if provided
    if (imagePath && fs.existsSync(imagePath)) {
      console.log('📎 Adding image...');
      try {
        const fileInput = await page.$('input[type="file"]');
        if (fileInput) {
          await fileInput.uploadFile(imagePath);
          await delay(5000);
        }
      } catch (e) {
        console.log('⚠️ Could not add image');
      }
    }

    // Post
    console.log('🚀 Posting to Facebook...');
    const postButton = await page.evaluateHandle(() => {
      const buttons = document.querySelectorAll('div[role="button"], button');
      for (const button of buttons) {
        const text = button.textContent?.trim();
        const ariaLabel = button.getAttribute('aria-label');
        if ((text === 'Post' || ariaLabel === 'Post') && !button.disabled) {
          return button;
        }
      }
      return null;
    });

    if (postButton) {
      await postButton.click();
      console.log('✅ Facebook post created successfully!');
      await delay(5000);
      return { success: true, message: 'Facebook post created successfully' };
    } else {
      // Try Ctrl+Enter as fallback
      await page.keyboard.down('Control');
      await page.keyboard.press('Enter');
      await page.keyboard.up('Control');
      await delay(3000);
      return { success: true, message: 'Facebook post created (fallback method)' };
    }

  } catch (error) {
    console.error('❌ Facebook automation error:', error);
    await page.screenshot({ path: 'facebook-error.png' });
    return { success: false, message: error.message };
  } finally {
    await browser.close();
  }
}