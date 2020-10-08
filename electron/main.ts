import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as path from 'path';
import * as url from 'url';

import { spawn }  from 'child_process';

//const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const executablePath = "C:\\runNff\\run.vbs";

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
  
  // let child = exec;
  // child(executablePath, (error, stdout, stderr) => {

  //   console.log("ENTRO");
  //   console.log(executablePath);
   
  //     if(error){
  //       console.error(error);
  //       return;
  //     }
  //     //console.log(data.toString());
  // });

    // const process = spawn(executablePath);   
    // var ls = process;
    
    // ls.stdout.on('data', function (data) {
    //   console.log(data);
    // });
    
    // ls.stderr.on('data', function (data) {
    //   console.log(data);
    // });
    
    // ls.on('close', function (code) {
    //   if (code == 0)
    //         console.log('Stop');
    //   else
    //         console.log('Start');
    // });

    
    // Open a local file in the default app
    shell.openPath(executablePath);

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



