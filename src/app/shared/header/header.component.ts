import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { HeaderMenuComponent } from './header-menu/header-menu.component';
import { GlobalVariablesService } from 'app/services/app-services/global-variables.service';
import { InputfieldComponent } from 'app/shared/inputfield/inputfield.component';
import { FirebaseUserService } from 'app/services/firebase-services/firebase-user.service';
import { FirebaseChannelService } from 'app/services/firebase-services/firebase-channel.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HeaderMenuComponent, InputfieldComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  globalVariables = inject(GlobalVariablesService);
  firebaseUserService = inject(FirebaseUserService);
  firebaseChannelService = inject(FirebaseChannelService);
  result: any;
  allDataWithCurrentId: any;
  allChannels: any = [];
  allMessages: any = [];
  relatedChats: any = [];
  allRelatedChatMsgs: any = [];
  info: any = [];

  constructor() {}
  openChannels() {
    this.globalVariables.showChannelMenu = true;
    this.globalVariables.isChatVisable = false;
    this.globalVariables.showThread = false;
  }

  async handleInputChange(value: string) {
    let user = await this.getDataConnectedWithID(
      this.globalVariables.currentUser.name
    ); // this will be all User Data
    if (user) {
      this.saveRelatedChats(user['relatedChats']);
      console.log(this.relatedChats);
      this.searchForWord(value);
    } else {
      console.log('Benutzer nicht gefunden oder fehlerhafte Daten');
    }
    this.result = value;
  }

  async getDataConnectedWithID(id: string) {
    let docID = await this.firebaseUserService.getUserDocIdWithName(id);
    let data = this.firebaseUserService.getUserData(docID[0]);
    return data;
  }

  async saveRelatedChats(data: any) {
    this.relatedChats = data;
  }

  async searchForWord(word: string) {
    await this.getChatMessages()
    await this.getChats();
    this.connectChannelWithChannelMsg();
    console.log(this.allRelatedChatMsgs);
  }

  /**
   * here for chahnnels to get the messages inside channels
   */
  async getChatMessages() {
    for (let i = 0; i < this.relatedChats.length; i++) {
      let messages = await this.firebaseChannelService.getChannelMessages(this.relatedChats[i]);
      this.allMessages.push(messages)
    }
    console.log('All MSG', this.allMessages);
  }

  /**
   * functions convert all data to docIds
   */
  async getChats() {
    for (let i = 0; i < this.relatedChats.length; i++) {
      let channels = await this.firebaseChannelService.loadChannelDataWithChatID(this.relatedChats[i]);
      this.allChannels.push(channels)
    }
    this.getEachChannelWithDocID()
  }

  /**
   * functions saves all connected chats in this.info
   */
  getEachChannelWithDocID(){
    for (let i = 0; i < this.allChannels.length; i++) {
      this.firebaseChannelService.loadChannelData(this.allChannels[i][0]).then(data => {
        this.info.push(data);
      });
    }
    console.log(this.info);
  }

  connectChannelWithChannelMsg() {
    if (this.allChannels && this.allChannels.length > 0) {
      this.allChannels.chatId.forEach((id: any) => {
        this.firebaseChannelService.getConnectionOfChannel(id).then(data => {
          this.allRelatedChatMsgs.push(data);
        });
      });
/*       let allChannelsId = this.allChannels[0].chatId;
      this.firebaseChannelService.getConnectionOfChannel(allChannelsId).then(data => {
        this.allRelatedChatMsgs.push(data);
      }); */
      
    } else {
      console.log('Keine Kanäle gefunden oder ungültige Daten');
    } 
  }
}
