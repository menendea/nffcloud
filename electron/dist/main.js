"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require('hazardous'); //soluciona problemas con .asar.unpacked
var electron_1 = require("electron");
var electron_updater_1 = require("electron-updater");
var electron_log_1 = require("electron-log");
var path = require("path");
var url = require("url");
var fs = require("fs");
var taskkill = require('taskkill');
var tasklist = require('win-tasklist');
var processWindows = require("node-process-windows");
var child_process_1 = require("child_process");
var netuser_1 = require("./netuser");
var downloadconfigs_1 = require("./downloadconfigs");
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
electron_1.ipcMain.on('selectedInstance', function (e, userLogged, app, company, instance, user, pass, isProd) {
    var fileName = '';
    switch (app) {
        case 'NFF':
            fileName = "NetofficeLoader.exe." + instance + ".xml";
            break;
        case 'NCC':
            fileName = "Netactica.Net.Accounting.Desktop.NetAccounting.exe." + instance + ".xml";
            break;
    }
    var downloadConfigs = new downloadconfigs_1.default(user, pass, isProd);
    try {
        downloadConfigs.downloadFile(userLogged, company, fileName, instance).then(function (data) {
            e.returnValue = {
                ok: true,
                data: data
            };
        }).catch(function (error) {
            console.log(error);
            e.returnValue = {
                ok: false,
                error: error
            };
        });
    }
    catch (error) {
        console.log(error);
        e.returnValue = {
            ok: false,
            error: error
        };
    }
});
electron_1.ipcMain.on('initADSession', function (e, args) {
    var userType = args;
    try {
        Whoami(userType).then(function (u) {
            var netuser = new netuser_1.default(child_process_1.exec);
            netuser.getUser(u, userType, function (err, data) {
                if (err) {
                    e.returnValue = {
                        ok: false,
                        data: err,
                        user: u
                    };
                }
                else {
                    var groups = data.global_groups.filter(function (item) {
                        return item !== 'Domain Users';
                    });
                    e.returnValue = {
                        ok: true,
                        data: data,
                        groups: groups,
                        user: u
                    };
                }
            });
        }).catch(function (error) {
            console.log(error);
            e.returnValue = {
                ok: false,
                data: error
            };
        });
    }
    catch (error) {
        console.log(error);
        e.returnValue = {
            ok: false,
            data: error
        };
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
    var fileConfig = 'c:\\netoffice\\netofficeloader.exe.config';
    try {
        var buffer = fs.readFileSync(fileConfig);
        e.returnValue = {
            ok: true,
            xml: buffer.toString()
        };
    }
    catch (error) {
        e.returnValue = {
            ok: false,
            error: error
        };
    }
});
electron_1.ipcMain.on('moveConfigFile', function (e, originPath, destinationPath) {
    try {
        fs.copyFileSync(originPath, destinationPath);
        e.returnValue = {
            ok: true
        };
    }
    catch (error) {
        console.log(error);
        e.returnValue = {
            ok: false,
            error: error
        };
    }
});
electron_1.ipcMain.on('openNetAccountingConfig', function (e) {
    var fileConfig = 'c:\\netaccounting\\Netactica.Net.Accounting.Desktop.NetAccounting.exe.config';
    try {
        var buffer = fs.readFileSync(fileConfig);
        e.returnValue = {
            ok: true,
            xml: buffer.toString()
        };
    }
    catch (error) {
        e.returnValue = {
            ok: false,
            error: error
        };
    }
});
electron_1.ipcMain.on('openWorkDocs', function (e, path) {
    var command = child_process_1.execFileSync;
    command(path);
});
electron_1.ipcMain.on('openNetoffice', function (e) { return __awaiter(void 0, void 0, void 0, function () {
    var executablePath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                executablePath = 'C:\\netoffice\\netofficeloader.exe';
                return [4 /*yield*/, electron_1.shell.openPath(executablePath).then(function (data) {
                        e.returnValue = {
                            ok: true,
                            data: data
                        };
                    })
                        .catch(function (error) {
                        e.returnValue = {
                            ok: false,
                            error: error
                        };
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('openNetaccounting', function (e) { return __awaiter(void 0, void 0, void 0, function () {
    var executablePath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                executablePath = 'C:\\netaccounting\\Netactica.Net.Accounting.Desktop.NetAccountingUpdater.exe';
                return [4 /*yield*/, electron_1.shell.openPath(executablePath).then(function (data) {
                        e.returnValue = {
                            ok: true,
                            data: data
                        };
                    })
                        .catch(function (error) {
                        e.returnValue = {
                            ok: false,
                            error: error
                        };
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
electron_1.ipcMain.on('openConsoleDebug', function (e) {
    win.webContents.openDevTools({
        mode: 'bottom'
    });
});
electron_1.ipcMain.on('killProcess', function (e, pid) {
    killProcess(pid);
});
electron_1.ipcMain.on('isRunning', function (e, app) {
    isRunning(app, function (tasks) {
        e.returnValue = {
            ok: true,
            tasks: tasks
        };
    });
});
electron_1.ipcMain.on('maximizeApp', function (e, pid) {
    try {
        var activeProcesses = processWindows.getProcesses(function (error, processes) {
            if (error) {
                e.returnValue = {
                    ok: false,
                    error: error
                };
            }
            var appProcesses = processes.filter(function (p) { return p.pid === pid; });
            if (appProcesses.length > 0) {
                processWindows.focusWindow(appProcesses[0]);
                e.returnValue = {
                    ok: true,
                    task: appProcesses
                };
            }
        });
    }
    catch (error) {
        e.returnValue = {
            ok: false,
            error: error
        };
    }
});
function createWindow() {
    win = new electron_1.BrowserWindow({ fullscreen: true, webPreferences: {
            nodeIntegration: true
        } });
    win.setMenuBarVisibility(false);
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
function Whoami(userType) {
    return __awaiter(this, void 0, void 0, function () {
        var command, promise;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    command = child_process_1.exec;
                    promise = new Promise(function (resolve, reject) {
                        command('whoami', function (error, stdout, stderr) {
                            if (error) {
                                reject("error 1");
                            }
                            else if (stderr) {
                                reject("stderr 2");
                            }
                            var user;
                            if (userType === 'local') {
                                user = stdout.replace('laptop-pv2vlubt\\', '');
                            }
                            else {
                                user = stdout.replace('corp\\', '');
                            }
                            user = user.replace('\\r\\n', '').trim().toLowerCase();
                            resolve(user);
                        });
                    });
                    return [4 /*yield*/, promise];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
function isRunning(query, cb) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tasklist.getProcessInfo(query, { verbose: false }).then(function (process) {
                        cb(process);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function killProcess(pid) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, taskkill(pid)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=main.js.map