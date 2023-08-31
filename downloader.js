const puppeteer = require("puppeteer");
const fs = require("fs");

async function fetchImageUrls(inputUrl) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    Referer: "https://www.dcinside.com",
  });

  await page.goto(inputUrl, { waitUntil: "networkidle2" });

  const imgURLs = await page.$$eval(
    ".pop_content.dccon_popinfo .dccon_list_wrap.clear .dccon_list_box.popinfo .dccon_list.clear li span.img_dccon img",
    (images) => images.map((img) => img.src)
  );

  await browser.close();
  return imgURLs;
}

async function openTabsAndDownload(urls) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    Referer: "https://www.dcinside.com",
  });

  for (let url of urls) {
    if (url && url.trim()) {
      await page.waitForTimeout(500);
      try {
        const response = await page.goto(url, {
          timeout: 60000,
          waitUntil: "networkidle2",
        });

        if (!response.ok()) {
          console.error(
            `Failed to navigate to ${url}. Status: ${response.status()}`
          );
        }

        // 새 탭을 생성
        const newPage = await browser.newPage();
        await newPage.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );
        await newPage.setExtraHTTPHeaders({
          Referer: "https://www.dcinside.com",
        });
      } catch (error) {
        console.error(`Error while navigating to ${url}:`, error.message);
      }
    }
  }

  await browser.close();
}

module.exports = { fetchImageUrls, openTabsAndDownload };
