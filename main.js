const electron = require('electron');

const {app, BrowserWindow, Menu, dialog} = electron;

let mainWindow;
let path;

app.on('ready', () =>{
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 1000,
        title: 'pistonDownloadertmnotactuallytm',
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.loadFile('index.html');

    const mainMenu = Menu.buildFromTemplate(mainMenuTempelate);
    Menu.setApplicationMenu(mainMenu);
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
