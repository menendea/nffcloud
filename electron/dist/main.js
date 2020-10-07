"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_log_1 = require("electron-log");
var electron_updater_1 = require("electron-updater");
var path = require("path");
var url = require("url");
electron_updater_1.autoUpdater.logger = electron_log_1.default;
electron_updater_1.autoUpdater.on('checking-for-update', function () {
});
electron_updater_1.autoUpdater.on('update-available', function (info) {
});
electron_updater_1.autoUpdater.on('update-not-available', function (info) {
});
electron_updater_1.autoUpdater.on('error', function (err) {
});
electron_updater_1.autoUpdater.on('download-progress', function (progressObj) {
});
electron_updater_1.autoUpdater.on('update-downloaded', function (info) {
    electron_updater_1.autoUpdater.quitAndInstall();
});
var win;
function createWindow() {
    win = new electron_1.BrowserWindow({ fullscreen: true });
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../../dist/nffCloud/index.html"),
        protocol: 'file:',
        slashes: true
    }));
    win.webContents.openDevTools();
    win.on('closed', function () {
        win = null;
    });
    electron_updater_1.autoUpdater.checkForUpdates();
}
;
electron_1.app.on('ready', createWindow);
electron_1.app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
//# sourceMappingURL=main.js.map