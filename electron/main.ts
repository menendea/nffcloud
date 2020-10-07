import { app, BrowserWindow } from 'electron';
import log from 'electron-log';
import {autoUpdater} from 'electron-updater';

import * as path from 'path';
import * as url from 'url';

autoUpdater.logger = log;

autoUpdater.on('checking-for-update', () => {
})
autoUpdater.on('update-available', (info) => {
})
autoUpdater.on('update-not-available', (info) => {
})
autoUpdater.on('error', (err) => {
})
autoUpdater.on('download-progress', (progressObj) => {
})
autoUpdater.on('update-downloaded', (info) => {
  autoUpdater.quitAndInstall();  
})




let win: BrowserWindow

function createWindow() {
    win = new BrowserWindow({ fullscreen: true });

    win.loadURL(
        url.format({
            pathname: path.join(__dirname, `../../dist/nffCloud/index.html`),
            protocol: 'file:',
            slashes: true
        })
    );

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null;
    });

    autoUpdater.checkForUpdates();
};

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
