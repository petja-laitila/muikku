/*global converse */
import * as React from 'react'
import '~/sass/elements/chat.scss';
import converse from '~/lib/converse';
import {PrivateMessage} from './privatemessage';
import mApi, { MApiError } from '~/lib/mApi';
import promisify, { promisifyNewConstructor } from '~/util/promisify';

interface Iprops{
  chat?: any,
  converse?: any,
  orderNumber?: any,
  onOpenPrivateChat?:any,
  chatObject?:any,
  openPrivateChat?: any,
  privateChat?: any,
  jid?: any,
  info?: any
}

interface Istate {
  jid?: string,
  converse?: any,
  roomJid?: string,
  minimized?: boolean,
  roomName?: string,
  minimizedChats?: any,
  messages?: any,
  minimizedClass?: string,
  jidTo?: string,
  nickTo?: string,
  fnTo?: string,
  lnTo?: string,
  chat?: any,
  chatRecipientNick?: string,
  info?: any
}

declare namespace JSX {
  interface ElementClass {
    render: any,
    converse: any;
  }
}

declare global {
  interface Window {
    MUIKKU_IS_STUDENT:boolean,
    PROFILE_DATA: any,
    MUIKKU_LOGGED_USER: string
  }
}

export class PrivateMessages extends React.Component<Iprops, Istate> {

  private myRef: any;
  private messagesEnd: any;

  constructor(props: any){
    super(props);
    this.state = {
      jid: window.MUIKKU_LOGGED_USER + "@dev.muikkuverkko.fi".toLowerCase(),
      converse: this.props.converse,
      roomJid: "",
      minimized: false,
      roomName: "",
      minimizedChats: [],
      messages: [],
      minimizedClass: "",
      jidTo: "",
      nickTo: "",
      fnTo: "",
      lnTo: "",
      chat: [],
      chatRecipientNick: "",
      info: []
    }
    this.myRef = null;
    this.openConversation = this.openConversation.bind(this);
  }
  minimizeChats (roomJid: any) {
    let minimizedRoomList = this.state.minimizedChats;

    if (this.state.minimized === false){
      this.setState({
        minimized: true,
        minimizedClass: "order-minimized"
      });

      if (!minimizedRoomList.includes(roomJid)){
        minimizedRoomList.push(roomJid);

        this.setState({minimizedChats: minimizedRoomList})
        window.sessionStorage.setItem("minimizedChats", JSON.stringify(minimizedRoomList));
      }
    } else{

      if (minimizedRoomList.includes(roomJid)){
        const filteredRooms = minimizedRoomList.filter((item: any) => item !== roomJid)
        this.setState({minimizedChats: filteredRooms})

        var result = JSON.parse(window.sessionStorage.getItem('minimizedChats')) || [];

        const filteredChats = result.filter(function(item:any) {
          return item !== roomJid;
        })

        window.sessionStorage.setItem("minimizedChats", JSON.stringify(filteredChats));

        return;
      }

      this.setState({
        minimized: false,
        minimizedClass:""
      });
    }
  }
  async sendMessage (event: any){
    event.preventDefault();
    let chat = this.state.chat;
    let text = event.target.chatMessage.value;

    let __this = this;

    let spoiler_hint = "undefined";

    const attrs = chat.getOutgoingMessageAttributes(text, spoiler_hint);

    let message = chat.messages.findWhere('correcting');

    if (message) {
      const older_versions = message.get('older_versions') || [];
      older_versions.push(message.get('message'));
      message.save({
        'correcting': false,
        'edited': chat.moment().format(),
        'message': text,
        'older_versions': older_versions,
        'references': text
      });
    } else {
      message = chat.messages.create(attrs);
    }

    // TODO: null check for sending messages
    if (text !== "" || text !== null){
      __this.state.converse.api.send(chat.createMessageStanza(message));
      __this.getPrivateMessages(message);
      return true;
    }
  }
  scrollToBottom(behavior: string = "smooth") {
    const isAlreadyInBottom = this.myRef.scrollTop + this.myRef.offsetHeight === this.myRef.scrollHeight;
    if (!isAlreadyInBottom && this.messagesEnd){
      this.messagesEnd.scrollIntoView({ behavior });
    }
  }
  openConversation(jid: any){
    const { Backbone, Promise, Strophe, moment, f, sizzle, _, $build, $iq, $msg, $pres } = converse.env;

    let __this = this;
    this.state.converse.api.chats.open(jid).then(async(chat:any) => {
      this.setState({
        chat: chat,
        chatRecipientNick: chat.attributes.nickname || __this.state.nickTo
      })

      let result;
      try {
        result = await this.state.converse.api.archive.query({'with': jid});
      } catch (e) {
        console.log("Failed to load archived messages " + e.innerHTML);
      }

      let sessionResult = JSON.parse(window.sessionStorage.getItem('openChats')) || [];


      if (!sessionResult.includes(jid)){
          sessionResult.push(jid);
      }
      window.sessionStorage.setItem("openChats", JSON.stringify(sessionResult));

      let messages = this.state.messages;
      let olderMessages: any;
      olderMessages = result.messages;
      let newArrFromOldMessages: any;
      newArrFromOldMessages = new(Array);
      let i : any;
      let text: any;
      let from: any;
      let stamp: any;
      let user: any;
      let nickname: any;
      let userName: any;
      let nick: any;
      let senderClass: any;

      for (i = 0; i < olderMessages.length; i++) {
        var pathForStamp = './/*[local-name()="delay"]/@stamp';
        var pathForFrom = './/*[local-name()="message"]/@from';
        stamp = olderMessages[i].ownerDocument.evaluate(pathForStamp, olderMessages[i], null, XPathResult.STRING_TYPE, null ).stringValue;
        from = olderMessages[i].ownerDocument.evaluate(pathForFrom, olderMessages[i], null, XPathResult.STRING_TYPE, null ).stringValue;

        text =  olderMessages[i].textContent;
        from = from.split("@")[0];
        from = from.toUpperCase();

        if (from.startsWith("PYRAMUS-STAFF-") || from.startsWith("PYRAMUS-STUDENT-")){
          user = (await promisify(mApi().user.users.basicinfo.read(from,{}), 'callback')());
          nickname = (await promisify(mApi().chat.settings.read(from), 'callback')());
          userName = user.firstName + " " + user.lastName;
          nick = nickname.nick;
        } else {
          userName = from;
          nick = from;

        }

        if (from === window.MUIKKU_LOGGED_USER){
          senderClass = "sender-me";
        } else {
          senderClass = "sender-them";
        }

        if (!text.startsWith("messageID=")){
          newArrFromOldMessages.push({message: text, from: userName + " ("+ nick +")", id: "", stamp: stamp, senderClass: senderClass});
        }
      }
      this.setState({messages: newArrFromOldMessages, roomJid: jid});
    });
  }
  async getPrivateMessages (data: any) {

    const { Backbone, Promise, Strophe, moment, f, sizzle, _, $build, $iq, $msg, $pres } = converse.env;

    if (data.chatbox && data.chatbox.attributes.message_type === "chat"){
      let message = data.stanza.textContent;
      let from:any;
      let user:any;
      let nickname: any;
      let nick: any;
      let userName: any;


      let messages = this.state.messages;
      var msg = data.chatbox.messages.models[data.chatbox.messages.models.length - 1];

      from = msg.attributes.from;
      from = from.split("@")[0];
      from = from.toUpperCase();

      if (from.startsWith("PYRAMUS-STAFF-") || from.startsWith("PYRAMUS-STUDENT-")){
        user = (await promisify(mApi().user.users.basicinfo.read(from,{}), 'callback')());
        nickname = (await promisify(mApi().chat.settings.read(from), 'callback')());
        userName = user.firstName + " " + user.lastName;
        nick = nickname.nick;
      } else {
        userName = from;
        nick = from;

      }

      let newMessage = {
        message: msg.attributes.message,
        from:  userName + " '" + nick + "' ",
        id: msg.attributes.id,
        stamp: msg.attributes.time,
        senderClass: "sender-" + msg.attributes.sender
      }

      var isExists = messages.some(function(curr :any) {
          if (curr.id === msg.attributes.id) {
              return true;
          }
      });

      if (isExists !== true){
        messages.push(newMessage);
      }


      this.setState({messages: messages});

        return;
      } else if (data.attributes && data.attributes.type === "chat"){

        let message = data.attributes.message;
        let from = data.attributes.from;
        from = from.split("@")[0];
        from = from.toUpperCase();
        let senderClass ="sender-" + data.attributes.sender;
        let user:any;
        let nickname: any;
        let nick: any;
        let userName: any;

        if (from.startsWith("PYRAMUS-STAFF-") || from.startsWith("PYRAMUS-STUDENT-")){
          user = (await promisify(mApi().user.users.basicinfo.read(from,{}), 'callback')());
          nickname = (await promisify(mApi().chat.settings.read(from), 'callback')());
          userName = user.firstName + " " + user.lastName;
          nick = nickname.nick;
        } else {
          userName = from;
          nick = from;

        }

        let messages = this.state.messages;

        this.setState({messages: messages});
      }
    }
    componentDidMount (){

      let __this = this;

      const { Backbone, Promise, Strophe, moment, f, sizzle, _, $build, $iq, $msg, $pres } = converse.env;

      let chat = this.props.info;

      if (chat){
        let jid = chat.jid;
        let nick = chat.info.nick;
        let firstName = chat.info.firstName;
        let lastName = chat.info.lastName;


        this.setState({
          jidTo: jid,
          nickTo: nick,
          fnTo: firstName,
          lnTo: lastName,
          info: chat
        });

        this.openConversation(jid);

        this.props.converse.api.listen.on('message', function (messageXML: any) {
          __this.getPrivateMessages(messageXML);
        });

        this.scrollToBottom();

        let minimizedChatsFromSessionStorage = JSON.parse(window.sessionStorage.getItem("minimizedChats"));

        if (minimizedChatsFromSessionStorage){
          this.setState({
            minimizedChats: minimizedChatsFromSessionStorage
          });

          minimizedChatsFromSessionStorage.map((item: any) => {
            if (item === chat.jid){
              this.setState({
                minimized: true,
                minimizedClass: "order-minimized"
              });
            }
          })
        }
      }
    }
    componentDidUpdate(){

    }
    render() {
      return  (
        <div className={"chat__private-chat--body " + this.state.minimizedClass}>
        { (this.state.minimized === true) && <div
        onClick={() => this.minimizeChats(this.state.roomJid)}
          className="chat__minimized-chat">{this.state.fnTo + " '" + this.state.nickTo + "' " + this.state.lnTo} <span onClick={() => this.props.onOpenPrivateChat(this.state.info.info)} className="close icon-close"></span></div>}

          { (this.state.minimized === false) && <div className="chat__private-chat--container">

          <div className="chat__private-chat--header">
            <div className="chat__chatbox--room-name">{this.state.fnTo + " '" + this.state.nickTo + "' " + this.state.lnTo}</div>
            <span onClick={() => this.minimizeChats(this.state.roomJid)} className="icon-remove"></span>
            <span onClick={() => this.props.onOpenPrivateChat(this.state.info.info)} className="icon-close"></span>
          </div>
          <form onSubmit={(e)=>this.sendMessage(e)}>
            <div className="chat__private-chat--messages" ref={ (ref) => this.myRef=ref }>
              {this.state.messages.map((message: any, i:any) => <PrivateMessage key={i} message={message} />)}
              <div style={{ float:"left", clear: "both"}} ref={(el) => { this.messagesEnd = el; }}></div>
            </div>

            <input name="chatRecipient" className="chat__private-chat--recipient" value={this.state.roomJid} readOnly/>
            <textarea className="chat__private-chat--message-area" placeholder="..Kirjoita jotakin" name="chatMessage"></textarea>
            <button className="chat__private-chat--send-message" type="submit" value=""><span className="icon-announcer"></span></button>
          </form>
        </div>}
      </div>
      );
    }
  }
