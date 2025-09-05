const puppeteer = require('puppeteer');
const path = require('path');

describe.skip('Browser-based tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: "new" });
  });

  afterAll(async () => {
    if (browser) {
      await browser.close();
    }
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    if (page) {
      await page.close();
    }
  });

  it('should not have any console errors on the main page', async () => {
    const consoleErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') {
        consoleErrors.push(message.text());
      }
    });

    await page.goto('file://' + path.resolve(__dirname, '../index.html'), { waitUntil: 'networkidle0' });

    expect(consoleErrors).toEqual([]);
  });
});
