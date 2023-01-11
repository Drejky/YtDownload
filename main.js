const { app, BrowserWindow, Menu, ipcMain, dialog } = require("electron");
const fs = require("fs");

app.whenReady().then(() => {
  let settings = JSON.parse(fs.readFileSync(__dirname + "/settings.json"));
  const mainWindow = new BrowserWindow({
    x: settings.x,
    y: settings.y,
    width: settings.windowWidth,
    height: settings.windowHeight,
    title: "Whirlwind downloader",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // enableRemoteModule: true,
    },
  });
  const setNewSettings = () => {
    const newBounds = mainWindow.getBounds();
    settings.windowX = newBounds.x;
    settings.windowY = newBounds.y;
    settings.windowWidth = newBounds.width;
    settings.windowHeight = newBounds.height;
    fs.writeFileSync(__dirname + "/settings.json", JSON.stringify(settings));
  };
  mainWindow.loadFile("index.html");
  mainWindow.on("resized", setNewSettings);
  mainWindow.on("moved", setNewSettings);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  const mainMenu = Menu.buildFromTemplate(mainMenuTempelate);
  Menu.setApplicationMenu(mainMenu);
});

//Menu tempelate
const mainMenuTempelate = [
  {
    label: "File",
    submenu: [
      {
        label: "Quit",
        accelerator: "Ctrl+W",
        click() {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Dev Tools",
    submenu: [
      {
        label: "Toggle Devtools",
        accelerator: "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
    ],
  },
];

//When choosing path through "Choose path button"
ipcMain.on("request-path", (event) => {
  dialog
    .showOpenDialog({ properties: ["openDirectory"] })
    .then((file) => {
      if (!file.canceled) {
        event.reply("path-selected", file.filePaths[0].toString());
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
