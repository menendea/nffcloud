import * as AWS from 'aws-sdk';

const credentials = new AWS.SharedIniFileCredentials({ profile: 'netactica-sls' });
AWS.config.update({ region: 'us-east-1' });
AWS.config.credentials = credentials;

import * as fs from 'fs';
import * as FormData from 'form-data';

const got = require('got');

class WorkDocs{
    
    private workdocs = new AWS.WorkDocs();
    private user: string;

    constructor(user:string){
        this.user = user;
    }
    
    startUpload = async (filePath: string) => {
        try {

            let _file = filePath.substring(filePath.lastIndexOf('\\') + 1);
            let _path = filePath.substring(0, filePath.lastIndexOf('\\'));

            const user = await this.describeUsers();
            const rootFolderId = user.Users[0].RootFolderId;
            const filename = _file;    
            const path = _path;

            const {
                documentId,
                versionId,
                uploadUrl,
                signedHeaders
            } = await this.initUpload({ folderId: rootFolderId, filename });
            await this.uploadFile({ path, filename, signedHeaders, uploadUrl });
            await this.updateVersion({ documentId, versionId });
        } catch (e) {
            console.error(e);
        }
    };

    private describeUsers = async () => {
        const user = await this.workdocs
            .describeUsers({
                OrganizationId: 'd-90676107ad', 
                Query: this.user
            })
            .promise();
        return user;
    };

    private initUpload = async ({ folderId, filename }) => {
        try {
            
            let extension = filename.substring(filename.lastIndexOf('.'));
            let contentType = '';
            
            switch(extension){
                case '.txt':
                    contentType = 'text/plain';
                    break;
                case '.pdf':
                    contentType = 'application/pdf';
                    break;
                case '.doc':
                    contentType = 'application/msword';
                    break;
                case '.docx':
                    contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                    break;
                case '.csv':
                    contentType = 'text/csv';
                    break;
                case '.xls':
                    contentType = 'application/vnd.ms-excel';
                    break;
                case '.xlsx':
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    break;
                case '.xml':
                    contentType = 'application/xml';
                    break;
                default:
                    contentType = 'application/octet-stream';
                    break;
            }
            
            const initResult = await this.workdocs.initiateDocumentVersionUpload({
                ParentFolderId: folderId,
                Name: filename,
                ContentType: contentType,
                ContentCreatedTimestamp: new Date(),
                ContentModifiedTimestamp: new Date()
            })
            .promise();
            
            const documentId = initResult.Metadata.Id;
            const versionId = initResult.Metadata.LatestVersionMetadata.Id;
            const { UploadUrl, SignedHeaders } = initResult.UploadMetadata;
            
            return {
                documentId,
                versionId,
                uploadUrl: UploadUrl,
                signedHeaders: SignedHeaders,
            };
        } catch (e) {
            console.log('failed initUpload', e);
            throw e;
        }
    };

    private uploadFile = async ({ path, filename, signedHeaders, uploadUrl }) => {
        try {

            const filePath = `${path}\\${filename}`;

            if (fs.existsSync(filePath)) {
                
                const fileStream = fs.createReadStream(filePath);
                const formData = new FormData();
        
                formData.append(filename, fileStream);

                const extendParams = {
                    headers: signedHeaders,
                };
        
                const client = got.extend(extendParams);
        
                await client.put(uploadUrl, {
                    body: formData
                });

            } else {
                console.log('file does not exist');
                throw 'file does not exist';
            }
        } catch (e) {
          console.error('failed uploadFile', e);
          throw e;
        }
    };

    private updateVersion = async ({ documentId, versionId }) => {
        try {
            await this.workdocs
            .updateDocumentVersion({
                DocumentId: documentId,
                VersionId: versionId,
                VersionStatus: 'ACTIVE',
            })
            .promise();
        } catch (e) {
            console.log('failed updateVersion', e);
            throw e;
        }
    };
 
}

export default WorkDocs;