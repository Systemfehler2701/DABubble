import { Component, inject } from '@angular/core';
import { ChannelMenuComponent } from './channel-menu/channel-menu.component';
import { ChatComponent } from './chat/chat.component';
import { ThreadComponent } from './thread/thread.component';
import { GlobalVariablesService } from 'app/services/app-services/global-variables.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    ChannelMenuComponent,
    ChatComponent,
    ThreadComponent,
    CommonModule,
  ],
})
export class DashboardComponent {
  globalVariables = inject(GlobalVariablesService);

  
  constructor() {
    this.globalVariables.login = false;
  }
  ngOnInit(){
    this.globalVariables.isChatVisable = window.innerWidth > 800;
    this.globalVariables.bufferThreadOpen = this.globalVariables.showThread;
  }

  toggleChannelMenu() {
    this.globalVariables.showChannelMenu = !this.globalVariables.showChannelMenu;
    if(this.globalVariables.desktop800 && !this.globalVariables.desktop1200 && this.globalVariables.bufferThreadOpen)
    this.globalVariables.showThread = !this.globalVariables.showThread;
  }

  
}
