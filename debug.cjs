const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.error('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.error('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  page.on('response', response => {
    if (response.status() === 404) {
      console.error('404 NOT FOUND:', response.url());
    }
  });

  console.log("Navigating to LIVE site...");
  await page.goto('https://hemanthnanu-tech.github.io/HemiTyping/', { waitUntil: 'networkidle0' });
  
  console.log("Taking screenshot...");
  await page.screenshot({path: 'debug.png'});
  
  await browser.close();
  process.exit(0);
})();
