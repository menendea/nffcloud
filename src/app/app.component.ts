import { Component } from '@angular/core'; 
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nffCloud';

  constructor(private electronService: ElectronService){}

  openNetoffice(){
    this.electronService.ipcRenderer.send('openNetoffice');
  }

  closeSession(){
    this.electronService.ipcRenderer.send('closeSession');
  }

  openNetofficeConfig(){
    this.electronService.ipcRenderer.send('openNetofficeConfig');
  }

  openTaskmanager(){
    this.electronService.ipcRenderer.send('openTaskmanager');
  }
}
