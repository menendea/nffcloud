import { ipcRenderer } from 'electron';
import {execFile}  from 'child_process';

//const executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const executablePath = "C:\\runNff\\load-netoffice.bat";

//document.getElementById('nff').addEventListener('click', e => {
ipcRenderer.invoke( 'openNetoffice' ).then( answer => {
    if(answer === 'open'){
        let child = execFile;
        child(executablePath, function(err, data) {
            if(err){
            console.error(err);
            return;
            }
            console.log(data.toString());
        });
    }  
});
//});

