import * as httpntlm from 'httpntlm';
import * as fs from 'fs';

class DownloadConfigs{
    private config:Config = null;
    
    constructor(userName: string, password: string){
        this.config = new Config(userName, password);
    }
    
    downloadFile = async (companyName: string, configFileName: string, instance: string) => {
        return await this.config.download(companyName, configFileName, instance);
    }
}

class Config{

    private username:string;
    private password:string;

    constructor(userName:string, password:string){
        this.username = userName;
        this.password = password;
    }

    download = (companyName: string, configFileName: string, instance: string) => {
        
        let promise =  new Promise(async (res, rej) => {

            await httpntlm.get({
                url: `http://nff-v.netactica.net/${companyName}/${configFileName}`,
                username: this.username,
                password: this.password,
                workstation: '',
                domain: '',
                binary: true
            }, function (err:any, response:any){
          
                if(response.statusCode === 200){
                    let fileToSave = configFileName.replace(`.${instance}.xml`, '.config');
                    fs.writeFile(fileToSave, response.body, function (err) {
                        if(err) {
                            console.log(err);
                            rej({
                                company: companyName,
                                fileName: configFileName,
                                message: `Error al intentar descargar el archivo ${configFileName}`
                            });   
                        }
                        else{
                            res({
                                company: companyName,
                                fileName: fileToSave,
                                message: `${configFileName} descargado`,
                                statusCode: 200
                            });
                        }
                    });
                }
                else if(response.statusCode === 404){
                    rej({
                        company: companyName,
                        fileName: configFileName,
                        message: `Error al intentar descargar el archivo ${configFileName}`,
                        statusCode: 404
                    });
                }
                else if(response.statusCode === 401){
                    rej({
                        company: companyName,
                        fileName: configFileName,
                        message: `Error al intentar descargar el archivo ${configFileName}`,
                        statusCode: 401
                    });
                }
                else{
                    console.log(err);
                    console.log(response);
                }

            });
            
        });

        return promise;
    }
}

export { Config };
export default DownloadConfigs;
