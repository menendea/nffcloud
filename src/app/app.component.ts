import { Component, OnInit, ViewChild } from '@angular/core'; 
import { ElectronService } from 'ngx-electron';
import { environment } from '../environments/environment';

import * as _ from 'underscore';
import { String } from 'aws-sdk/clients/apigateway';

const { version: appVersion } = require('../../package.json')

declare const $: any;

declare interface AppInstance {
  code: string;
  name: string;
};

declare interface Process {
  name: string,
  pid: number,
  instance: AppInstance,
  instanceType: string // NFF | NCC
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'nffCloud';

  @ViewChild('company', { static: true }) company: string;
  @ViewChild('user', { static: true }) user: string;
  @ViewChild('password', { static: true }) password: string;

  ipcMainResponse:any;

  fullname:string;
  groups: string[];
  appVersion: string;
  userName: string;

  disableNFF: boolean = true;
  disableNCC: boolean = true;

  nffInstance: AppInstance[] = [];
  nccInstance: AppInstance[] = [];

  activeInstances: Process[] = [];
  activeNCCInstances: Process[] = [];
  activeNFFInstances: Process[] = [];

  nffInstanceSelected: AppInstance = {
    name: 'Instancia',
    code: '#'
  };
  nccInstanceSelected: AppInstance = {
    name: 'Instancia',
    code: '#'
  };

  lsCompany: string;
  lsUser: string;
  lsPassword: string;
  lsFolderToObserve: string;

  hasError: boolean = false;
  errorCode: number;

  loadingNFF: boolean = false;
  loadingNCC: boolean = false;

  constructor(private electronService: ElectronService){
   
    this.appVersion = appVersion;

    let reply = this.electronService.ipcRenderer.sendSync('initADSession', environment.userType);
    this.ipcMainResponse = reply;

    if(this.ipcMainResponse.ok){  

      this.fullname = this.ipcMainResponse.data.full_name;   
      this.groups = this.ipcMainResponse.groups;
      this.userName = this.ipcMainResponse.user;

      // para DEV
      if(!environment.production){
        this.groups = [
          'EXITO-NFF-ES',
          'NETACTICA-NCC-AR',
          'NETACTICA-NFF-AR',
          'NETACTICA-NFF-CO',
          'NETACTICA-NFF-UY',
          'NETACTICA-NFF-AMERICA',
          'NETACTICA-NCC-AMERICA'
        ];
      }
    } 
  }

  ngOnInit(){

    $('[data-toggle="tooltip"]').tooltip();

    $('#settingsModal').on('shown.bs.modal', function () {
      $('#settingsModal').trigger('focus')
    });
    
    this.lsCompany = localStorage.getItem('company');
    this.lsUser = localStorage.getItem('user');
    this.lsPassword = localStorage.getItem('password');
    this.lsFolderToObserve = localStorage.getItem('folderToObserve');

    if(this.lsCompany !== null){ $('#company').val(this.lsCompany); }
    if(this.lsUser !== null){ $('#user').val(this.lsUser); }
    if(this.lsPassword !== null){ $('#password').val(this.lsPassword); } 
    if(this.lsFolderToObserve !== null){ 
      $('#folderToObserve').val(this.lsFolderToObserve); 
      this.observeFolder();
    } 

    if(this.ipcMainResponse.ok){

      if(this.groups.length > 0){

        this.groups.forEach( item => {

          let instance  = item.split('-');
          
          if(instance[0] === this.lsCompany){
            switch (instance[1]) {
              case 'NFF':
                this.nffInstance.push({
                  code: instance[2],
                  name: countryListAlpha2[instance[2]] === undefined ? instance[2] : countryListAlpha2[instance[2]]
                });
                break;
              case 'NCC':
                this.nccInstance.push({
                  code: instance[2],
                  name: countryListAlpha2[instance[2]] === undefined ? instance[2] : countryListAlpha2[instance[2]]
                });
                break;
            }   
          }
        });
      }

      this.nffInstance = this.nffInstance.sort((a, b) => {
        let value = (a.name < b.name) ? -1 : ((a.name === b.name)? 0 : 2);
        return value;
      });

      this.nccInstance = this.nccInstance.sort((a, b) => {
        let value = (a.name < b.name) ? -1 : ((a.name === b.name)? 0 : 2);
        return value;
      });

    }

    this.evalAppIsRunning();

  }

  async nffSelection(instance: AppInstance){
    this.loadingNFF = false;
    this.nffInstanceSelected = instance;

    await this.selectedInstance('NFF', instance.code).then(data => {
      if(data.statusCode === 200){
        this.moveConfigFile('NFF', data.fileName);
      }
    },
    error => {
      this.disableNFF = true;
      this.hasError = true;
      this.errorCode = error.statusCode;
      console.log(error);
    });
  }

  async nccSelection(instance: AppInstance){
    this.loadingNCC = false;
    this.nccInstanceSelected = instance;

    await this.selectedInstance('NCC', instance.code).then(data => {
      if(data.statusCode === 200){
        this.moveConfigFile('NCC', data.fileName);
      }
    },
    error => {
      this.disableNCC = true;
      this.hasError = true;
      this.errorCode = error.statusCode;
      console.log(error);
    });
    
  }

  saveConfigParams(company: string, user: string, password: string, folderToObserve: string){
    localStorage.setItem('company', company);
    localStorage.setItem('user', user);
    localStorage.setItem('password', password);
    localStorage.setItem('folderToObserve', folderToObserve)
    this.lsCompany = company;
    this.lsUser = user;
    this.lsPassword = password;
    this.lsFolderToObserve = folderToObserve;

    this.observeFolder();

    $('#settingsModal').modal('hide')
  }

  openNetoffice(){
    this.loadingNFF = true;
    let status = this.electronService.ipcRenderer.sendSync('openNetoffice');

    if(status.ok){
      this.evalProcessRunning(this.activeNFFInstances, 'NFF', 'Netoffice.exe').then(value => {
        this.activeNFFInstances = value;
        this.activeInstances = _.union(this.activeNFFInstances, this.activeNCCInstances);
      });  
    }
    else if(!status.ok){
      console.log(status.error);
    }
  }

  openNetaccounting(){
    this.loadingNCC = true;
    let status = this.electronService.ipcRenderer.sendSync('openNetaccounting');
    
    if(status.ok){
      this.evalProcessRunning(this.activeNCCInstances ,'NCC', 'Netactica.Net.Accounting.Desktop.NetAccounting.exe').then(value => {
        this.activeNCCInstances = value;
        this.activeInstances = _.union(this.activeNFFInstances, this.activeNCCInstances);
      });
    }
    else if(!status.ok){
      console.log(status.error);
    }
  }

  evalAppIsRunning(){

    const self = this;
    
    setInterval(() => {

      let runningNCC = self.isRunning('Netactica.Net.Accounting.Desktop.NetAccounting.exe');
      let runningNFF = self.isRunning('Netoffice.exe');
      let activeInstances = _.clone(self.activeInstances);
     
      _.forEach(self.activeInstances, instance => {
        switch (instance.instanceType) {
          case 'NFF':
            let prNff = _.find(runningNFF.tasks, item => { return instance.pid === item.pid; });
            if(prNff === undefined){
              activeInstances = _.filter(activeInstances, ai => { return ai.pid !== instance.pid; });
              self.activeNFFInstances = _.filter(self.activeNFFInstances, aiNff => aiNff.pid !== instance.pid);
            }
            break;
          case 'NCC':
            let prNcc = _.find(runningNCC.tasks, item => { return instance.pid === item.pid; });
            if(prNcc === undefined){
              activeInstances = _.filter(activeInstances, ai => { return ai.pid !== instance.pid; });
              self.activeNCCInstances = _.filter(self.activeNCCInstances, aiNcc => aiNcc.pid !== instance.pid);
            }
            break;
        }

      });

      self.activeInstances = activeInstances;

    }, 1000);

  }

  isRunning(app: string): any{
    let tasks = this.electronService.ipcRenderer.sendSync('isRunning', app);
    return tasks;
  }

  killProcess(pid: number){
    this.electronService.ipcRenderer.send('killProcess', pid);
    this.activeInstances = this.activeInstances.filter(item => item.pid !== pid);
    this.activeNCCInstances = this.activeNCCInstances.filter(item => item.pid !== pid);
    this.activeNFFInstances = this.activeNFFInstances.filter(item => item.pid !== pid);
  }

  maximizeApp(pid: number){
    let status = this.electronService.ipcRenderer.sendSync('maximizeApp', pid);

    if(!status.ok){
      console.log(status);
    }
    // else{
    //   console.log(status);
    // }
  }

  closeSession(){
    this.electronService.ipcRenderer.send('closeSession');
  }

  openNetofficeConfig(){
    let xml = this.electronService.ipcRenderer.sendSync('openNetofficeConfig');
    if(xml.ok){ 
      $('.xmlConfig').sspxml({ 
        xml: $.parseXML(xml.xml),
        edit: false,
        sepTextNodes: true,
        formatted: true 
      });
    }
    else if(!xml.ok){
      console.log(xml.error);
    }
  }
  
  openNetAccountingConfig(){
    let xml = this.electronService.ipcRenderer.sendSync('openNetAccountingConfig');
    if(xml.ok){
      $('.xmlConfig').sspxml({ 
        xml: $.parseXML(xml.xml),
        edit: false,
        sepTextNodes: true,
        formatted: true
      });
    }
    else if(!xml.ok){
      console.log(xml.error);
    }
  }

  openTaskmanager(){
    this.electronService.ipcRenderer.send('openTaskmanager');
  }

  openWorkDocs(){

    // let path = 'C:\\Program Files\\Amazon\\AmazonWorkDocsSetup.exe';

    // // para DEV
    // if(!environment.production){
    //   path = 'C:\\Program Files\\Adobe\\Adobe Photoshop CC 2019\\Photoshop.exe';
    // }

    const path = this.lsFolderToObserve;

    if(path !== undefined && path !== ''){
      this.electronService.ipcRenderer.send('openWorkDocs', path);
    }
    
  }
  
  observeFolder(){

    if(!environment.production){
      this.userName = 'ccekci';
    }

    const path = this.lsFolderToObserve;

    if(path !== undefined && path !== ''){
      this.electronService.ipcRenderer.send('observeFolder', this.userName, path);
    }
  }

  moveConfigFile(instance: string, fileName: String){

    let origin: string = `D:\\Users\\${this.userName}\\AppData\\Local\\Programs\\nff-cloud\\${fileName}`;
    
    if(!environment.production){
      origin = fileName;
    }
    
    let destination: string = '';
   
    switch (instance) {
      case 'NFF':
          destination = `C:\\netoffice\\${fileName}`;
          break;
        case 'NCC':
          destination = `C:\\netaccounting\\${fileName}`;
          break;
    }

    let ipcResponse = this.electronService.ipcRenderer.sendSync('moveConfigFile', origin, destination);
    if(ipcResponse.ok){
      switch (instance) {
        case 'NFF':
          this.disableNFF = false;
            break;
          case 'NCC':
            this.disableNCC = false;
            break;
      }  
      this.hasError = false;
    }
    else{
      console.log(ipcResponse.error);
      switch (instance) {
        case 'NFF':
          this.disableNFF = false;
            break;
          case 'NCC':
            this.disableNCC = false;
            break;
      }  
      this.hasError = true;
    }
  }

  openConsoleDebug(){
    this.electronService.ipcRenderer.send('openConsoleDebug');
  }

  selectedInstance(app: string, instance: string): Promise<any>{
    // puede ser NFF o NCC
    let promise = new Promise<string>((resolve, reject) => {
      
      let ipcResponse = this.electronService.ipcRenderer.sendSync('selectedInstance', 
        this.userName,
        app, 
        this.lsCompany, 
        instance, 
        this.lsUser, 
        this.lsPassword,
        environment.production);

        if(ipcResponse.ok){
          resolve(ipcResponse.data);
        }
        else{
          reject(ipcResponse.error);
        }
    });

    return promise;
  }

  private async evalProcessRunning(activeInstances: Process[], app: string, exe: string): Promise<Process[]>{

    const promise = new Promise<any>(res => {
      const self = this;
      let count = 0; 
      let intervalObject = setInterval(() => { 
        count++; 
        let isRunning = self.isRunning(exe);    
      
        if (isRunning.tasks !== null) {

          if(activeInstances.length < isRunning.tasks.length){
          
            clearInterval(intervalObject);
            res({
              loading:false,
              tasks: isRunning.tasks
            }); 
          } 

        }
        
        if(count === 60){
          clearInterval(intervalObject);
          console.log(`TIME OUT: loading tasks running when ${app}`);
          res({
            loading:false,
            tasks: isRunning.tasks
          }); 
        } 

      }, 1000);       
    });

    await promise.then(data => {

      let name: any;
      let code: any;

      activeInstances = _.map(data.tasks, element => { 
        
        let currrentInstance: Process = _.find(activeInstances, p => p.pid === element.pid); //.filter(p => p.pid === element.pid);
        
        switch (app) {
          case 'NCC':
            this.loadingNCC = data.loading; 
            name = this.nccInstanceSelected.name;
            code = this.nccInstanceSelected.code;
            break;
          case 'NFF':
            this.loadingNFF = data.loading; 
            name = this.nffInstanceSelected.name;
            code = this.nffInstanceSelected.code;
            break;
        }

        if(currrentInstance !== undefined){
          name = currrentInstance.instance.name;
          code = currrentInstance.instance.code;
        }

        return {
          pid: element.pid,
          name: element.process,
          instanceType: app,
          instance: {
            name,
            code
          }
        };
      }); 

    });

    return activeInstances;

  }

}

const countryListAlpha2 = {
  "AF": "Afghanistan",
  "AL": "Albania",
  "DZ": "Algeria",
  "AS": "American Samoa",
  "AD": "Andorra",
  "AO": "Angola",
  "AI": "Anguilla",
  "AQ": "Antarctica",
  "AG": "Antigua and Barbuda",
  "AR": "Argentina",
  "AM": "Armenia",
  "AW": "Aruba",
  "AU": "Australia",
  "AT": "Austria",
  "AZ": "Azerbaijan",
  "BS": "Bahamas (the)",
  "BH": "Bahrain",
  "BD": "Bangladesh",
  "BB": "Barbados",
  "BY": "Belarus",
  "BE": "Belgium",
  "BZ": "Belize",
  "BJ": "Benin",
  "BM": "Bermuda",
  "BT": "Bhutan",
  "BO": "Bolivia (Plurinational State of)",
  "BQ": "Bonaire, Sint Eustatius and Saba",
  "BA": "Bosnia and Herzegovina",
  "BW": "Botswana",
  "BV": "Bouvet Island",
  "BR": "Brazil",
  "IO": "British Indian Ocean Territory (the)",
  "BN": "Brunei Darussalam",
  "BG": "Bulgaria",
  "BF": "Burkina Faso",
  "BI": "Burundi",
  "CV": "Cabo Verde",
  "KH": "Cambodia",
  "CM": "Cameroon",
  "CA": "Canada",
  "KY": "Cayman Islands (the)",
  "CF": "Central African Republic (the)",
  "TD": "Chad",
  "CL": "Chile",
  "CN": "China",
  "CX": "Christmas Island",
  "CC": "Cocos (Keeling) Islands (the)",
  "CO": "Colombia",
  "KM": "Comoros (the)",
  "CD": "Congo (the Democratic Republic of the)",
  "CG": "Congo (the)",
  "CK": "Cook Islands (the)",
  "CR": "Costa Rica",
  "HR": "Croatia",
  "CU": "Cuba",
  "CW": "Curaçao",
  "CY": "Cyprus",
  "CZ": "Czechia",
  "CI": "Côte d'Ivoire",
  "DK": "Denmark",
  "DJ": "Djibouti",
  "DM": "Dominica",
  "DO": "Dominican Republic (the)",
  "EC": "Ecuador",
  "EG": "Egypt",
  "SV": "El Salvador",
  "GQ": "Equatorial Guinea",
  "ER": "Eritrea",
  "EE": "Estonia",
  "SZ": "Eswatini",
  "ET": "Ethiopia",
  "FK": "Falkland Islands (the) [Malvinas]",
  "FO": "Faroe Islands (the)",
  "FJ": "Fiji",
  "FI": "Finland",
  "FR": "France",
  "GF": "French Guiana",
  "PF": "French Polynesia",
  "TF": "French Southern Territories (the)",
  "GA": "Gabon",
  "GM": "Gambia (the)",
  "GE": "Georgia",
  "DE": "Germany",
  "GH": "Ghana",
  "GI": "Gibraltar",
  "GR": "Greece",
  "GL": "Greenland",
  "GD": "Grenada",
  "GP": "Guadeloupe",
  "GU": "Guam",
  "GT": "Guatemala",
  "GG": "Guernsey",
  "GN": "Guinea",
  "GW": "Guinea-Bissau",
  "GY": "Guyana",
  "HT": "Haiti",
  "HM": "Heard Island and McDonald Islands",
  "VA": "Holy See (the)",
  "HN": "Honduras",
  "HK": "Hong Kong",
  "HU": "Hungary",
  "IS": "Iceland",
  "IN": "India",
  "ID": "Indonesia",
  "IR": "Iran (Islamic Republic of)",
  "IQ": "Iraq",
  "IE": "Ireland",
  "IM": "Isle of Man",
  "IL": "Israel",
  "IT": "Italy",
  "JM": "Jamaica",
  "JP": "Japan",
  "JE": "Jersey",
  "JO": "Jordan",
  "KZ": "Kazakhstan",
  "KE": "Kenya",
  "KI": "Kiribati",
  "KP": "Korea (the Democratic People's Republic of)",
  "KR": "Korea (the Republic of)",
  "KW": "Kuwait",
  "KG": "Kyrgyzstan",
  "LA": "Lao People's Democratic Republic (the)",
  "LV": "Latvia",
  "LB": "Lebanon",
  "LS": "Lesotho",
  "LR": "Liberia",
  "LY": "Libya",
  "LI": "Liechtenstein",
  "LT": "Lithuania",
  "LU": "Luxembourg",
  "MO": "Macao",
  "MG": "Madagascar",
  "MW": "Malawi",
  "MY": "Malaysia",
  "MV": "Maldives",
  "ML": "Mali",
  "MT": "Malta",
  "MH": "Marshall Islands (the)",
  "MQ": "Martinique",
  "MR": "Mauritania",
  "MU": "Mauritius",
  "YT": "Mayotte",
  "MX": "Mexico",
  "FM": "Micronesia (Federated States of)",
  "MD": "Moldova (the Republic of)",
  "MC": "Monaco",
  "MN": "Mongolia",
  "ME": "Montenegro",
  "MS": "Montserrat",
  "MA": "Morocco",
  "MZ": "Mozambique",
  "MM": "Myanmar",
  "NA": "Namibia",
  "NR": "Nauru",
  "NP": "Nepal",
  "NL": "Netherlands (the)",
  "NC": "New Caledonia",
  "NZ": "New Zealand",
  "NI": "Nicaragua",
  "NE": "Niger (the)",
  "NG": "Nigeria",
  "NU": "Niue",
  "NF": "Norfolk Island",
  "MP": "Northern Mariana Islands (the)",
  "NO": "Norway",
  "OM": "Oman",
  "PK": "Pakistan",
  "PW": "Palau",
  "PS": "Palestine, State of",
  "PA": "Panama",
  "PG": "Papua New Guinea",
  "PY": "Paraguay",
  "PE": "Peru",
  "PH": "Philippines (the)",
  "PN": "Pitcairn",
  "PL": "Poland",
  "PT": "Portugal",
  "PR": "Puerto Rico",
  "QA": "Qatar",
  "MK": "Republic of North Macedonia",
  "RO": "Romania",
  "RU": "Russian Federation (the)",
  "RW": "Rwanda",
  "RE": "Réunion",
  "BL": "Saint Barthélemy",
  "SH": "Saint Helena, Ascension and Tristan da Cunha",
  "KN": "Saint Kitts and Nevis",
  "LC": "Saint Lucia",
  "MF": "Saint Martin (French part)",
  "PM": "Saint Pierre and Miquelon",
  "VC": "Saint Vincent and the Grenadines",
  "WS": "Samoa",
  "SM": "San Marino",
  "ST": "Sao Tome and Principe",
  "SA": "Saudi Arabia",
  "SN": "Senegal",
  "RS": "Serbia",
  "SC": "Seychelles",
  "SL": "Sierra Leone",
  "SG": "Singapore",
  "SX": "Sint Maarten (Dutch part)",
  "SK": "Slovakia",
  "SI": "Slovenia",
  "SB": "Solomon Islands",
  "SO": "Somalia",
  "ZA": "South Africa",
  "GS": "South Georgia and the South Sandwich Islands",
  "SS": "South Sudan",
  "ES": "Spain",
  "LK": "Sri Lanka",
  "SD": "Sudan (the)",
  "SR": "Suriname",
  "SJ": "Svalbard and Jan Mayen",
  "SE": "Sweden",
  "CH": "Switzerland",
  "SY": "Syrian Arab Republic",
  "TW": "Taiwan",
  "TJ": "Tajikistan",
  "TZ": "Tanzania, United Republic of",
  "TH": "Thailand",
  "TL": "Timor-Leste",
  "TG": "Togo",
  "TK": "Tokelau",
  "TO": "Tonga",
  "TT": "Trinidad and Tobago",
  "TN": "Tunisia",
  "TR": "Turkey",
  "TM": "Turkmenistan",
  "TC": "Turks and Caicos Islands (the)",
  "TV": "Tuvalu",
  "UG": "Uganda",
  "UA": "Ukraine",
  "AE": "United Arab Emirates (the)",
  "GB": "United Kingdom of Great Britain and Northern Ireland (the)",
  "UM": "United States Minor Outlying Islands (the)",
  "US": "United States of America (the)",
  "UY": "Uruguay",
  "UZ": "Uzbekistan",
  "VU": "Vanuatu",
  "VE": "Venezuela (Bolivarian Republic of)",
  "VN": "Viet Nam",
  "VG": "Virgin Islands (British)",
  "VI": "Virgin Islands (U.S.)",
  "WF": "Wallis and Futuna",
  "EH": "Western Sahara",
  "YE": "Yemen",
  "ZM": "Zambia",
  "ZW": "Zimbabwe",
  "AX": "Åland Islands"
};