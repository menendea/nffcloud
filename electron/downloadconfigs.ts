import * as httpntlm from 'httpntlm';
import * as fs from 'fs';

class DownloadConfigs{
    private config:Config = null;
    
    constructor(userName: string, password: string, isProd: boolean){
        this.config = new Config(userName, password, isProd);
    }
    
    downloadFile = async (userLogged: string, companyName: string, configFileName: string, instance: string) => {
        return await this.config.download(userLogged, companyName, configFileName, instance);
    }
}

class Config{

    private username:string;
    private password:string;
    private isProd:boolean;

    constructor(userName:string, password:string, isProd: boolean){
        this.username = userName;
        this.password = password;
        this.isProd = isProd;
    }

    download = (userLogged: string, companyName: string, configFileName: string, instance: string) => {
        
        let self = this;

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

                    let path  = `D:\\Users\\${userLogged}\\AppData\\Local\\Programs\\nff-cloud\\${fileToSave}`;

                    if(!self.isProd){
                        path = fileToSave;
                    }

                    fs.writeFile(path, response.body, function (err) {
                        if(err) {
                            console.log(err);
                            rej({
                                company: companyName,
                                fileName: configFileName,
                                message: `Error al intentar descargar el archivo ${configFileName}`,
                                error: err
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
               
            });
            
        });

        return promise;
    }
}

export { Config };
export default DownloadConfigs;
