const { ipcRenderer } = require("electron");

document.getElementById("startButton").addEventListener("click", () => {
  const url = document.getElementById("urlInput").value;

  if (url) {
    ipcRenderer.send("start-download", url);
  } else {
    alert("Please enter a URL.");
  }
});
