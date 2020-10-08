"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_updater_1 = require("electron-updater");
var electron_log_1 = require("electron-log");
var path = require("path");
var url = require("url");
var child_process_1 = require("child_process");
var executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
var win;
delete process.env.ELECTRON_ENABLE_SECURITY_WARNINGS;
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
electron_updater_1.autoUpdater.logger = electron_log_1.default;
electron_updater_1.autoUpdater.on('checking-for-update', function () { });
electron_updater_1.autoUpdater.on('update-available', function (info) { });
electron_updater_1.autoUpdater.on('update-not-available', function (info) { });
electron_updater_1.autoUpdater.on('error', function (err) { });
electron_updater_1.autoUpdater.on('download-progress', function (progressObj) { });
electron_updater_1.autoUpdater.on('update-downloaded', function (info) {
    electron_updater_1.autoUpdater.quitAndInstall();
});
electron_1.app.on('ready', createWindow);
electron_1.app.on('activate', function () {
    if (win === null) {
        createWindow();
    }
});
electron_1.ipcMain.on('openNetoffice', function (e) {
    var child = child_process_1.execFile;
    child(executablePath, function (err, data) {
        if (err) {
            console.error(err);
            return;
        }
        console.log(data.toString());
    });
});
function createWindow() {
    win = new electron_1.BrowserWindow({ fullscreen: true, webPreferences: {
            nodeIntegration: true
        } });
    win.setMenuBarVisibility(false);
    // win.webContents.openDevTools();
    win.loadURL(url.format({
        pathname: path.join(__dirname, "../../dist/nffCloud/index.html"),
        protocol: 'file:',
        slashes: true
    }));
    win.on('closed', function () {
        win = null;
    });
    electron_updater_1.autoUpdater.checkForUpdates();
}
;
//# sourceMappingURL=main.js.map