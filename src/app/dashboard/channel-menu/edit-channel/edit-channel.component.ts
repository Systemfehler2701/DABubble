import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GlobalFunctionsService } from 'app/services/app-services/global-functions.service';
import { GlobalVariablesService } from 'app/services/app-services/global-variables.service';
import { FirebaseUserService } from 'app/services/firebase-services/firebase-user.service';
import { ButtonComponent } from 'app/shared/button/button.component';
import { InputfieldComponent } from 'app/shared/inputfield/inputfield.component';
import { User } from 'app/models/user.class';
import { channel } from 'app/models/channel.class';
import { FirebaseChannelService } from 'app/services/firebase-services/firebase-channel.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-edit-channel',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InputfieldComponent, FormsModule],
  templateUrl: './edit-channel.component.html',
  styleUrl: './edit-channel.component.scss',
})
export class EditChannelComponent {
  [x: string]: any;

  channels: any[] = [];
  globalVariables = inject(GlobalVariablesService);
  globalFunctions = inject(GlobalFunctionsService);
  firebaseChannelService = inject(FirebaseChannelService);
  firebaseUpdate = inject(FirebaseUserService);
  firestore: Firestore = inject(Firestore);

  editMode: { channelName: boolean; description: boolean } = {
    channelName: false,
    description: false,
  };

  profile: User = { img: '', name: '', isActive: false, email: '' };

  channelBuffer = '';
  descriptionBuffer = '';

  channel: channel = {
    description: '',
    channelName: '',
    id: '',
    chatId: '',
    creator: '',
    channelMember: [],
  };

  channelId: string = '';

  editChannelDM = false;
  editChannelDES= false;
  editedName = '';
  editedDescription = '';

  creatorName: string = '';

  constructor(private channelService: FirebaseChannelService) {}

  async ngOnInit() {
    let idToSearch = this.globalVariables.channelData.id;
    const channelData = await this.firebaseChannelService.loadChannelData(
      idToSearch
    ); // Implementieren Sie diese Funktion entsprechend
    if (channelData) {
      this.channel.channelName = channelData['channelName'];
      this.channel.description= channelData ['description'];
      this.channel.creator = channelData['creator'];
    }
    this.getUserIdToName();
  }

  cancelEditChannel() {
    this.channelBuffer = '';
    this.descriptionBuffer = '';
    this.globalVariables.isEditingChannel = false;
  }

  enableEdit(field: 'channelName' | 'description') {
    this['editMode'][field] = true;
  }

  async getUserIdToName() {
    let userId = this.channel.creator;
    let x = await this.firebaseUpdate.getUserData(userId);
    if (x && x.hasOwnProperty('name')) {
      let name = x['name'];
      this.creatorName = name;
    } else {
      console.log('Kein Nutzer gefunden')
    }
  }

  editChannelName() {
    this.editChannelDM = true;
  }

  editChannelDescripition() {
    this.editChannelDES = true;

  }

  saveChannelName() {
    this.channel.channelName = this.editedName;
    this.editChannelDM = false;
  }

  saveDescription() {
    this.channel.description = this.editedDescription;
    this.editChannelDES = false;
  }

  async sumbitEdit() {
    let idToSearch = this.globalVariables.channelData.id;
    this.firebaseChannelService.updateDataChannel(this.data(), idToSearch);
    const userData = await this.firebaseChannelService.loadChannelData(
      idToSearch
    );
    this.channel = new channel(userData);
    this.saveChannelName();
  }

  async submitEdit() {
    let idToSearch = this.globalVariables.channelData.id;
    this.firebaseChannelService.updateDataChannel(this.descData(), idToSearch);
    const userData = await this.firebaseChannelService.loadChannelData(
      idToSearch
    );
    this.channel = new channel(userData);
    this.saveDescription();
  }

  data(): {} {
    const nameChanged = this.editedName !== this.channel.channelName;
    const data: { [key: string]: any } = {};
    if (nameChanged) data['channelName'] = this.editedName;
    return data;
  }

  descData(): {} {
    const nameChanged = this.editedDescription !== this.channel.description;
    const data: { [key: string]: any } = {};
    if (nameChanged) data['description'] = this.editedDescription;
    return data;
  }

  async updateChannelName(channelId: string, newName: string): Promise<void> {
    const docRef = doc(this.firestore, `channels/${channelId}`);
    return updateDoc(docRef, { name: newName });
  }

  async updateChannelDescription(channelId: string, newDescription: string): Promise<void> {
    const docRef = doc(this.firestore, `channels/${channelId}`);
    return updateDoc(docRef, { name: newDescription });
  }
  
}
