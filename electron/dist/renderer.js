// import { ipcRenderer } from 'electron';
// import { exec }  from 'child_process';
// ipcRenderer.emit('isRunning', (e, app) => {
//     isRunning(app, (status) => {
//         e.returnValue = {
//           ok: true,
//           status
//         }
//     });
// });
// function isRunning(query, cb){
//     let platform = process.platform;
//     let cmd = '';
//     switch (platform) {
//         case 'win32' : cmd = `tasklist`; break;
//         case 'darwin' : cmd = `ps -ax | grep ${query}`; break;
//         case 'linux' : cmd = `ps -A`; break;
//         default: break;
//     }
//     exec(cmd, (err, stdout, stderr) => {
//         cb(stdout.toLowerCase().indexOf(query.toLowerCase()) > -1);
//     });
// }
//# sourceMappingURL=renderer.js.map