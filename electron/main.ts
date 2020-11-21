require ('hazardous'); //soluciona problemas con .asar.unpacked

import { app, BrowserWindow, ipcMain, shell } from 'electron';
import {  autoUpdater } from 'electron-updater';
import log from 'electron-log';
import * as path from 'path';
import * as url from 'url';
import * as fs from 'fs';

const taskkill = require('taskkill');
const tasklist = require('win-tasklist');
var processWindows = require("node-process-windows");

import { exec, execFileSync }  from 'child_process';

import NetUser from './netuser';
import DownloadConfigs, { Config } from './downloadconfigs';

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

ipcMain.on('selectedInstance', (e, userLogged, app, company, instance, user, pass, isProd) => {

  let fileName: string = '';
  switch (app) {
    case 'NFF':
        fileName = `NetofficeLoader.exe.${instance}.xml`;
      break;
      case 'NCC':
        fileName = `Netactica.Net.Accounting.Desktop.NetAccounting.exe.${instance}.xml`;
      break;
  }

  let downloadConfigs = new DownloadConfigs(user, pass, isProd);

  try {
    downloadConfigs.downloadFile(userLogged, company, fileName, instance).then(data => {
      e.returnValue = {
        ok:true,
        data
      };
    }).catch(error => {
      console.log(error);
      e.returnValue = {
        ok:false,
        error
      };
    });  
  } catch (error) {
    console.log(error);
      e.returnValue = {
        ok:false,
        error
      };
  }

});

ipcMain.on('initADSession', (e, args) => {
  
  let userType = args;

  try {  
    Whoami(userType).then(u => {

      let netuser = new NetUser(exec);
      netuser.getUser(u, userType, (err:any, data:any) => {      
        if(err){
          e.returnValue = {
            ok:false,
            data:err,
            user:u
          };
        }
        else{

          let groups = data.global_groups.filter((item:string) => {
            return item !== 'Domain Users';
          });

          e.returnValue = {
            ok: true,
            data,
            groups,
            user: u
          };
        }
      });
    }).catch(error => {
      console.log(error);
      e.returnValue = {
        ok: false,
        data: error
      }
    });

  } catch (error) {
    console.log(error);
    e.returnValue = {
      ok: false,
      data:error
    };
  }

});

ipcMain.on('closeSession', e => {
  const command = exec;
  command('shutdown -L', (error, stdout, stderr) => {});
});

ipcMain.on('openTaskmanager', e => {
  const command = exec;
  command('taskmgr', (error, stdout, stderr) => {});
});

ipcMain.on('openNetofficeConfig', e => {

  const fileConfig = 'c:\\netoffice\\netofficeloader.exe.config';
  
  try {
    let buffer = fs.readFileSync(fileConfig);
    e.returnValue = {
      ok: true,
      xml: buffer.toString()
    };
  } catch (error) {
    e.returnValue = {
      ok: false,
      error
    };
  }
});

ipcMain.on('moveConfigFile', (e, originPath, destinationPath) => {

  try {
    fs.copyFileSync(originPath, destinationPath);
   
    e.returnValue = {
      ok:true
    };
   
  } catch (error) {
    console.log(error);
    e.returnValue = {
      ok:false,
      error
    };
  }
});

ipcMain.on('openNetAccountingConfig', e => {
  
  const fileConfig = 'c:\\netaccounting\\Netactica.Net.Accounting.Desktop.NetAccounting.exe.config';
  
  try {
    let buffer = fs.readFileSync(fileConfig);
    e.returnValue = {
      ok: true,
      xml: buffer.toString()
    };
  } catch (error) {
    e.returnValue = {
      ok: false,
      error
    };
  }

});

ipcMain.on('openWorkDocs', (e, path) => {
  const command = execFileSync;

  command(path);
});

ipcMain.on('openNetoffice', async (e) => {

  const executablePath = 'C:\\netoffice\\netofficeloader.exe';

  await shell.openPath(executablePath).then(data => {
    e.returnValue = {
      ok: true,
      data
    }
  })
  .catch(error => {
    e.returnValue = {
      ok: false,
      error
    }
  });

});

ipcMain.on('openNetaccounting', async (e) => {

  const executablePath = 'C:\\netaccounting\\Netactica.Net.Accounting.Desktop.NetAccountingUpdater.exe';

  await shell.openPath(executablePath).then(data => {
    e.returnValue = {
      ok: true,
      data
    }
  })
  .catch(error => {
    e.returnValue = {
      ok: false,
      error
    }
  });
});

ipcMain.on('openConsoleDebug', e => {
  win.webContents.openDevTools({
    mode: 'bottom'
  });
});

ipcMain.on('killProcess', (e, pid) => {
  killProcess(pid);
});

ipcMain.on('isRunning', (e, app) => {

  isRunning(app, (tasks: any[]) => {   
      e.returnValue = {
        ok: true,
        tasks
      }
  });

});

ipcMain.on('maximizeApp', (e, pid) => {

  try {
      let activeProcesses = processWindows.getProcesses(function(error, processes) {

        if(error){
          e.returnValue = {
            ok: false,
            error
          }
        }

        let appProcesses = processes.filter(p => p.pid === pid);
    
        if(appProcesses.length > 0) {
            processWindows.focusWindow(appProcesses[0]);
            e.returnValue = {
              ok: true,
              task: appProcesses
            }
        }
      });   
  } catch (error) {
    e.returnValue = {
      ok: false,
      error
    }
  }

});

function createWindow() {

  win = new BrowserWindow({ fullscreen: true,  webPreferences: {
    nodeIntegration: true
  }});

  win.setMenuBarVisibility(false);
  
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
}

async function Whoami(userType: string) : Promise<any>{
  const command = exec;

  const promise = new Promise((resolve, reject) => {  
    command('whoami', (error, stdout, stderr) => {
      if(error){
        reject("error 1");
      }
      else if(stderr){
        reject("stderr 2");
      }
    
      let user: string;
      
      if(userType === 'local'){
        user = stdout.replace('laptop-pv2vlubt\\', '');
      }
      else{
        user = stdout.replace('corp\\', '');
      }
      user = user.replace('\\r\\n','').trim().toLowerCase();
      resolve(user);
    });
  });

  return await promise;
}

async function isRunning(query: any, cb: Function){
  await tasklist.getProcessInfo(query, {verbose: false}).then((process: any)=>{
    cb(process);
  });
}

async function killProcess(pid: number){
  await taskkill(pid);
}


