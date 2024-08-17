const {
  app,
  BrowserWindow,
  systemPreferences,
  desktopCapturer,
} = require("electron");
const path = require("node:path");
const { session } = require("electron");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const askMediaAccess = async () => {
  console.log("Asking for media access");

  const camera = await systemPreferences
    .askForMediaAccess("camera")
    .then((allowed) => console.log("Camera is allowed"));

  const microphone = await systemPreferences.askForMediaAccess("microphone");
  return camera === "granted" && microphone === "granted";
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false,
      backgroundThrottling: false,
    },
    titleBarStyle: "hidden",
    titleBarOverlay:
      process.platform == "darwin"
        ? false
        : { color: "#5a9dd1", symbolColor: "#21526e" },
    transparency: true,
    backgroundColor: "#00000000",
    vibrancy: "fullscreen-ui",
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();
  askMediaAccess();

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        "Content-Security-Policy": [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' * data:; object-src 'self'",
        ],
      },
    });
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
