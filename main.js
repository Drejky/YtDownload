const electron = require('electron');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;

app.on('ready', () =>{
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        title: 'pistonDownloadertmnotactuallytm',
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile('index.html');

    const mainMenu = Menu.buildFromTemplate(mainMenuTempelate);
    Menu.setApplicationMenu(mainMenu);
});

//Catch name:add and link:add
ipcMain.on('name:add', (e, name) =>{
    console.log(name)
});

ipcMain.on('link:add', (e, link) =>{
    console.log(link)
});

//Menu tempelate
const mainMenuTempelate = [
    {
        label:'File',
        submenu:[
            {
                label: 'Quit',
                accelerator: 'Ctrl+W',
                click(){
                    app.quit();
                }
            }
        ]
    },
    {
        label: 'Dev Tools',
        submenu:[
            {
                label: 'Toggle Devtools',
                accelerator: 'Ctrl+I',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            }
        ]
    }
]
