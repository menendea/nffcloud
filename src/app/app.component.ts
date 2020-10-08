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
    this.electronService.ipcRenderer.sendSync('openNetoffice');
  }
}
