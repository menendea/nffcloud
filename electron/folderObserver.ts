require ('hazardous'); //soluciona problemas con .asar.unpacked

import * as chokidar from 'chokidar';
import { EventEmitter } from 'events';
import WorkDocs from './workdocs';

class FolderObserver extends EventEmitter{

    constructor(){
        super();
    }

    watch(user: string, folder: string){

        try{

            let watcher = chokidar.watch(folder, { persistent: true });
            
            watcher.on('change', async filePath => {

                const workdocs = new WorkDocs(user);

                workdocs.startUpload(filePath).then( _ => {
                    this.emit('file-updated', { 
                        message: `${filePath} : Archivo actualizado.` 
                    });
                });

            });

            watcher.on('add', async filePath => {
                
                const workdocs = new WorkDocs(user);
                
                workdocs.startUpload(filePath).then( _ => {
                    this.emit('file-added', { 
                        message: `${filePath} : Archivo creado.` 
                    });
                });
                
            });


        } catch (error) {
            console.log(error);
        }


    }
}

export default FolderObserver;