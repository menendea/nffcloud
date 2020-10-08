"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var child_process_1 = require("child_process");
var executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
//document.getElementById('nff').addEventListener('click', e => {
electron_1.ipcRenderer.invoke('openNetoffice').then(function (answer) {
    if (answer === 'open') {
        var child = child_process_1.execFile;
        child(executablePath, function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(data.toString());
        });
    }
});
//});
//# sourceMappingURL=renderer.js.map