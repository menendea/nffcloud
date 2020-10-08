import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as path from 'path';
import * as url from 'url';
import { execFile }  from 'child_process';

//const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const executablePath = "C:\\netoffice\\netofficeloader.exe";

let win: BrowserWindow

delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';

autoUpdater.logger = log;
autoUpdater.on('checking-for-update', () => {});
autoUpdater.on('update-available', (info) => {});
autoUpdater.on('update-not-available', (info) => {});
autoUpdater.on('error', (err) => {});
autoUpdater.on('download-progress', (progressObj) => {});
autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.quitAndInstall();  
});

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

ipcMain.on('openNetoffice', e => {
  let child = execFile;
  child(executablePath, function(err, data) {
      if(err){
      console.error(err);
      return;
      }
      console.log(data.toString());
  });
});

function createWindow() {

  win = new BrowserWindow({ fullscreen: true,  webPreferences: {
    nodeIntegration: true
  }});

  win.setMenuBarVisibility(false);
  // win.webContents.openDevTools();
  
  win.loadURL(
      url.format({
          pathname: path.join(__dirname, `../../dist/nffCloud/index.html`),
          protocol: 'file:',
          slashes: true
      })
  );

  win.on('closed', () => {
      win = null;
  });

  autoUpdater.checkForUpdates();
};
