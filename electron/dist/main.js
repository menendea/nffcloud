"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var electron_updater_1 = require("electron-updater");
var electron_log_1 = require("electron-log");
var path = require("path");
var url = require("url");
var child_process_1 = require("child_process");
//const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
var executablePath = "C:\\runNff\\run.vbs";
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
electron_1.ipcMain.on('closeSession', function (e) {
    var command = child_process_1.exec;
    command('shutdown -L', function (error, stdout, stderr) { });
});
electron_1.ipcMain.on('openTaskmanager', function (e) {
    var command = child_process_1.exec;
    command('taskmgr', function (error, stdout, stderr) { });
});
electron_1.ipcMain.on('openNetofficeConfig', function (e) {
    var command = child_process_1.exec;
    command('notepad c:\\netoffice\\netofficeloader.exe.config', function (error, stdout, stderr) { });
});
electron_1.ipcMain.on('openNetoffice', function (e) {
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
    electron_1.shell.openPath(executablePath);
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