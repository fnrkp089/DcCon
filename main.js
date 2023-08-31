const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { fetchImageUrls, openTabsAndDownload } = require("./downloader.js");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.on("closed", function () {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", function () {
  if (mainWindow === null) createWindow();
});

ipcMain.on("start-fetching", async (event, inputUrl) => {
  const imgURLs = await fetchImageUrls(inputUrl);

  // 스크래핑된 이미지 URL들을 TXT 파일에 저장
  const fs = require("fs");
  fs.writeFileSync(
    "image_urls.txt",
    imgURLs.map((url, index) => `Image ${index + 1} : ${url}`).join("\n")
  );

  // 저장된 txt 파일의 내용을 읽어서 다운로드
  const urlsFromFile = fs
    .readFileSync("image_urls.txt", "utf-8")
    .split("\n")
    .map((line) => line.split(": ")[1]);
  await openTabsAndDownload(urlsFromFile);

  // 모든 주소를 방문한 후 다운로드 완료 팝업을 표시
  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Download Complete",
    message: "모든 파일이 다운로드되었습니다!",
  });
  try {
    fs.unlinkSync("./image_urls.txt");
  } catch (err) {
    console.error("Error deleting the file:", err);
  }
});
