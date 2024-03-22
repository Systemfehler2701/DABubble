import { Component, ElementRef, HostListener, inject, Input } from '@angular/core';
import { GlobalFunctionsService } from 'app/services/app-services/global-functions.service';
import { GlobalVariablesService } from 'app/services/app-services/global-variables.service';
import { FirebaseChatService } from 'app/services/firebase-services/firebase-chat.service';
import { Firestore, doc, collection, onSnapshot, getDoc, updateDoc, arrayRemove } from '@angular/fire/firestore';


import { User } from 'app/models/user.class';
import { DatePipe, CommonModule } from '@angular/common';
import { ReactionsComponent } from "../../reactions/reactions.component";

interface Emoji {
  icon: string,
  iconId: string,
  userId: string,
}

@Component({
  selector: 'app-other-user-message',
  standalone: true,
  templateUrl: './other-user-message.component.html',
  styleUrl: './other-user-message.component.scss',
  imports: [
    DatePipe,
    ReactionsComponent,
    CommonModule
  ]
})


export class OtherUserMessageComponent {

  firestore: Firestore = inject(Firestore);
  globalVariables = inject(GlobalVariablesService);
  globalFunctions = inject(GlobalFunctionsService);
  firebaseChatService = inject(FirebaseChatService);
  
  openReaction: boolean = false;
  selectedMessage: string = '';
  @Input() message: any;
  @Input() isThread: boolean = false;

  emojiArray: Emoji[] = [];
  postingTime: string | null = null;
  user: User = new User;
  originalMessage = {
    message: '',
    answerto: '',
    userId: '',
    timestamp: 0,
    emoji: [{ icon: '', userId: [] as any[], iconId: '' }],
  };

  unsubUser;
  userId: string = 'guest';
  answerKey: string = '';
  answercount: number = 0;
  lastAnswerTime: number = 0;


  constructor(private elementRef: ElementRef) {
    this.unsubUser = this.getUser(this.userId);

  }


  /**
   * this function unsubscribes the containing content
   */
  ngOnDestroy() {
    this.unsubUser;
  }

  /**
   * thsi function returns the reference to the user doc
   * @param docId - id of user
   * @returns - referenz of document
   */
  getUserRef(docId: string) {
    return doc(collection(this.firestore, 'users'), docId);
  }

  /**
   * this function get data of user and saves it in lokal user object
   * @param id - id of user
   * @returns - onSnapshot object
   */
  getUser(id: string) {
    return onSnapshot(this.getUserRef(id), (user) => {
      if (user.data()) {
        this.user = new User(user.data());
      }
    });

  }


  /**
   * this function calls function getUser() for providing userdata for the post
   */
  async ngOnInit() {
  
    this.getUser(this.message.userId);
    this.postingTime = this.message.timestamp;
    this.fillAnswerVariables();
    this.cloneOriginalMessage();
  }

  /**
   * this function clones the original message object for later remove logic
   */
  cloneOriginalMessage(){
    this.originalMessage = { ...this.message }; //clone first layer
    this.originalMessage.emoji = this.message.emoji.map((emoji: any) => ({//clone second layer
      ...emoji, 
      userId: [...emoji.userId] // clone third layer
    })); 
   // console.log('clonedMessage: ', this.originalMessage);
  }

  /**
   * this function gets all information needed for answers
   */
  fillAnswerVariables(){
    let answerInfo = this.globalFunctions.getAnswerInfo(this.message);
    this.lastAnswerTime = answerInfo.lastAnswerTime;
    this.answercount = answerInfo.answerCount;
    this.answerKey = answerInfo.answerKey;
  }

//Dise Funktion macht nichts, da sie mit nichts verlinkt ist
  openEmojis() {
    let emojiDiv = document.getElementById('emojis');
    if (emojiDiv && emojiDiv.classList.contains('d-none')) {
      emojiDiv.classList.remove('d-none');
    } else if (emojiDiv && emojiDiv.classList.contains('d-none') == false) {
      emojiDiv.classList.add('d-none');
    }
  }


  openAnswers() {
    this.globalVariables.showThread = !this.globalVariables.showThread;
    //console.log('showThread: ',this.globalVariables.showThread);
    this.globalVariables.answerKey = this.answerKey;
    console.log('answerKex: ', this.answerKey);
    this.globalVariables.answerCount = this.answercount;
    this.fillInitialUserObj();
    this.globalVariables.openChat = 'isChatVisable';
    this.globalVariables.messageData.answerto = this.message.userId + '_' + this.message.timestamp.toString();
    this.globalFunctions.showDashboardElement(1200);
    if (window.innerWidth < 800) {
      this.globalVariables.showChannelMenu = false;
      this.globalVariables.isChatVisable = false;
    }
  }

  fillInitialUserObj() {
    this.globalVariables.messageThreadStart.message = this.message.message;
    this.globalVariables.messageThreadStart.userId = this.message.userId;
    this.globalVariables.messageThreadStart.timestamp = this.message.timestamp;
    this.globalVariables.messageThreadStart.userName = this.user.name;
    this.globalVariables.messageThreadStart.img = this.user.img;
  }

  onSelectMessage(message: string) {
    this.selectedMessage = message; //hier wird die messageId übergeben.
    this.openReaction = !this.openReaction; //geändert, damit man es auch wieder schließen kann, wenn mannochmal auf das Element klickt
  }

  /**
   * this listener is for closing the emoji container
   * @param event - click event
   */
  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.onCloseReactions();
    }
  }
/**
 * just set flags for closing emoji container
 */
  onCloseReactions() {
    this.openReaction = false;
    this.selectedMessage = '';
  }

  addUserIdToEmoji(emoji: any): void {
    if (emoji && emoji.userId && Array.isArray(emoji.userId)) { // Ich habe Fragen
      const activeID = this.globalVariables.activeID;
      if (emoji.userId.includes(activeID)) {
        emoji.userId = emoji.userId.filter((id: any) => id !== activeID);
      } else {
        emoji.userId.push(activeID);
      }
    }
    this.emojiCount(emoji);
    this.globalVariables.messageData = this.message;
    this.firebaseChatService.sendMessage(this.globalVariables.openChannel.chatId, 'chatchannels');
    //if (this.originalMessage.message !== this.message.message)
      this.remove(this.globalVariables.openChannel.chatId);
  }

  emojiCount(emoji: any): number {
    return emoji.userId.length;
  }

  //just a test function
  test(emojiArray: Emoji[]) {
    const groupedByIconId = new Map<string, Emoji[]>();

    emojiArray.forEach(emoji => {
      if (!groupedByIconId.has(emoji.iconId)) {
        groupedByIconId.set(emoji.iconId, []);
      }
      groupedByIconId.get(emoji.iconId)!.push(emoji);
    });

    console.log(groupedByIconId);
  }

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ///<-- das hab ich hier zum Test mit rein genommen Gruß Alex 18.3.
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  copyHelper() {
    this.originalMessage.message = this.message.message;
    this.originalMessage.answerto = this.message.answerto;
    this.originalMessage.timestamp = this.message.timestamp;
    this.originalMessage.userId = this.message.userId;
    this.originalMessage.emoji = [];

    this.message.emoji.forEach((element: any) => {
      this.originalMessage.emoji.push({
        icon: element.icon,
        userId: [element.userId],
        iconId: element.iconId,
      });
    }); 
   
  }

  remove(chatId: string) {
   // debugger;
    return updateDoc(doc(this.firestore, 'chatchannels', chatId), {
      messages: arrayRemove(this.originalMessage),
    });
  }

  addEmoji() {
    this.globalVariables.messageData = this.message;
    console.log('Das ist die Nachricht die hochgeladen wird: ', this.message);
    this.firebaseChatService.sendMessage(this.globalVariables.openChannel.chatId, 'chatchannels');
    this.remove(this.globalVariables.openChannel.chatId);
  }
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
}
