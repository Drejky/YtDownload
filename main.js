const electron = require('electron');

const {app, BrowserWindow, Menu, dialog} = electron;

let mainWindow;
let path;

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

//Menu tempelate
const mainMenuTempelate = [
    {
        label:'File',
        submenu:[
            {
                label:'Choose file path',
                click(){
                    path = dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] });
                    console.log(path);
                }
            },
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
