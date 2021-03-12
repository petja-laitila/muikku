import Portal from './portal';
import * as React from 'react';
import '~/sass/elements/loaders.scss';
import '~/sass/elements/dialog.scss';
import '~/sass/elements/form-elements.scss';
import {SearchFormElement } from '~/components/general/form-element';
import ApplicationList, { ApplicationListItemContentWrapper, ApplicationListItem, ApplicationListItemHeader } from '~/components/general/application-list';
import { UserType } from '../../reducers/user-index';
import Tabs  from "~/components/general/tabs";
import { UiSelectItem } from '../base/input-select-autofill';
import Pager from '~/components/general/pager';

interface DialogProps {
  children?: React.ReactElement<any>,
  title: string,
  executing?: boolean,
  executeContent?: React.ReactElement<any>,
  modifier?: string | Array<string>,
  content: any,
  disableScroll?: boolean,
  footer?: (closePortal: () => any) => any,
  onOpen?: (e?: HTMLElement) => any,
  executeOnOpen?: () => any,
  onClose?: () => any,
  isOpen?: boolean,
  onKeyStroke?(keyCode: number, closePortal: () => any): any,
  closeOnOverlayClick?: boolean;
}

interface DialogState {
  visible: boolean,
}

export default class Dialog extends React.Component<DialogProps, DialogState> {
  private oldOverflow: string;

  constructor(props: DialogProps) {
    super(props);

    this.onOverlayClick = this.onOverlayClick.bind(this);
    this.onOpen = this.onOpen.bind(this);
    this.beforeClose = this.beforeClose.bind(this);
    this.oldOverflow = null;
    this.state = { visible: false }
  }

  onOverlayClick(close: () => any, e: Event) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  onOpen(element: HTMLElement) {
    setTimeout(() => {
      this.setState({
        visible: true,
      });
    }, 10);
    this.props.executeOnOpen && this.props.executeOnOpen();
    this.props.onOpen && this.props.onOpen(element);
    if (this.props.disableScroll == true) {
      document.body.style.overflow = "hidden";
    }
    if (element.childNodes && element.childNodes[0]) {
      let el = element.childNodes[0].firstChild as HTMLElement;
      let marginOffset = 20;
      document.body.style.marginBottom = el.offsetHeight - marginOffset + "px";
    }
  }

  beforeClose(DOMNode: HTMLElement, removeFromDOM: () => any) {
    this.setState({
      visible: false
    });
    if (this.props.disableScroll == true) {
      document.body.style.overflow = "scroll";
    }
    document.body.style.marginBottom = "0";
    setTimeout(removeFromDOM, 300);
  }

  render() {
    let closeOnOverlayClick = true;
    if (typeof this.props.closeOnOverlayClick !== "undefined") {
      closeOnOverlayClick = !!this.props.closeOnOverlayClick;
    }
    return (<Portal onKeyStroke={this.props.onKeyStroke} isOpen={this.props.isOpen}
        openByClickOn={this.props.children} onOpen={this.onOpen} onClose={this.props.onClose} beforeClose={this.beforeClose} closeOnEsc>
        {(closePortal: ()=>any)=>{
          let modifiers:Array<string> = typeof this.props.modifier === "string" ? [this.props.modifier] : this.props.modifier;
        return <div className={`dialog ${(modifiers || []).map(s=>`dialog--${s}`).join(" ")} ${this.state.visible ? "dialog--visible" : ""}`}
            onClick={closeOnOverlayClick ? this.onOverlayClick.bind(this, closePortal) : null}>
            {/* Execution container is missing from here */}
            <section role="dialog" aria-labelledby={`dialog-title--${modifiers[0]}`} aria-modal="true" className={`dialog__window ${(modifiers || []).map(s=>`dialog__window--${s}`).join(" ")}`}>
            <header className={`dialog__header ${(modifiers || []).map(s => `dialog__header--${s}`).join(" ")}`}>
              <div className="dialog__title" id={`dialog-title--${modifiers[0]}`}>
                {this.props.title}
              </div>
              <div className="dialog__close icon-cross" onClick={closePortal}></div>
              </header>
              <section className="dialog__content">
                {this.props.content(closePortal)}
              </section>
              {this.props.footer?
              <footer className="dialog__footer">
                {this.props.footer && this.props.footer(closePortal)}
              </footer>
              : null}
          </section>
        </div>}}
    </Portal>);
  }
}

interface DialogRowProps {
  modifiers?: string | Array<string>,
}

interface DialogRowState {
}

export class DialogRow extends React.Component<DialogRowProps, DialogRowState> {
  render() {
    let modifiers = this.props.modifiers && this.props.modifiers instanceof Array ? this.props.modifiers : [this.props.modifiers];
    return (
      <div className={`dialog__content-row ${this.props.modifiers ? modifiers.map(m => `dialog__content-row--${m}`).join(" ") : ""}`}>
        {this.props.children}
      </div>
    );

  }
}

interface DialogRowHeaderProps {
  modifiers?: string | Array<string>,
  label: string,
}

interface DialogRowHeaderState {
}

export class DialogRowHeader extends React.Component<DialogRowHeaderProps, DialogRowHeaderState> {
  render() {
    let modifiers = this.props.modifiers && this.props.modifiers instanceof Array ? this.props.modifiers : [this.props.modifiers];
    return (
      <div className={`dialog__content-row-label ${this.props.modifiers ? modifiers.map(m => `dialog__content-row-label--${m}`).join(" ") : ""}`}>
        {this.props.label}
      </div>
    );

  }
}

interface DialogRowContentProps {
  modifiers?: string | Array<string>,
}

interface DialogRowContentState {
}

export class DialogRowContent extends React.Component<DialogRowContentProps, DialogRowContentState> {
  render() {
    let modifiers = this.props.modifiers && this.props.modifiers instanceof Array ? this.props.modifiers : [this.props.modifiers];
    return (
      <div className={`dialog__content-row-content ${this.props.modifiers ? modifiers.map(m => `dialog__content-row-content--${m}`).join(" ") : ""}`}>
        {this.props.children}
      </div>
    );

  }
}


interface DialogRemoveUsersProps {
  users: UserType[],
  removeUsers: UiSelectItem[],
  pages: number,
  placeholder: string,
  identifier: string,
  allTabTitle: string,
  removeTabTitle: string,
  onEmptyTitle: string,
  searchValue: string,
  maxUsersPerPage?: number,
  searchUsers: (q:string) => any,
  changePage: (n: number) => any,
  setRemoved: (u:UiSelectItem) => any,
}

interface DialogRemoveUsersState {
  activeTab: string,
  removeUsersPage: UiSelectItem[],
  currentAllPage: number,
  currentRemovePage: number,
}

export class DialogRemoveUsers extends React.Component<DialogRemoveUsersProps, DialogRemoveUsersState> {
  private maxUsersPerPage: number;

  constructor(props: DialogRemoveUsersProps) {
    super(props);
    this.maxUsersPerPage = this.props.maxUsersPerPage ? this.props.maxUsersPerPage : 5;
    this.state = {
      removeUsersPage: [],
      activeTab: this.props.identifier + "-ALL",
      currentAllPage: 1,
      currentRemovePage: 1,
    }

    this.onTabChange = this.onTabChange.bind(this);
    this.goToAllUsersPage = this.goToAllUsersPage.bind(this);
    this.goToRemovePage = this.goToRemovePage.bind(this);
    this.turnUserToUiSelectItem = this.turnUserToUiSelectItem.bind(this);
    this.toggleUserRemoved = this.toggleUserRemoved.bind(this);
    this.refreshRemoveUserpage = this.refreshRemoveUserpage.bind(this);
    this.checkUserInRemoveList = this.checkUserInRemoveList.bind(this);
  }

  onTabChange(identifier: string) {
    this.setState({
      activeTab: identifier
    });
  }

  goToAllUsersPage(n: number){
    this.setState({ currentAllPage: n});
    this.props.changePage(n);
  }

  goToRemovePage(n: number){
    this.setState({currentRemovePage: n});
   this.refreshRemoveUserpage(n, this.props.removeUsers);
  }

  turnUserToUiSelectItem (user: UserType){
    return {
      label: user.firstName + " " + user.lastName,
      id: user.id,
      icon: "user",
    } as UiSelectItem;
  }

  refreshRemoveUserpage(page: number, removeUsers: UiSelectItem[]) {
    let pageStart: number = (page - 1) * this.maxUsersPerPage;
    let pageEnd: number = pageStart + this.maxUsersPerPage;
    let newRemoveUsers: UiSelectItem[] = [];

    for(let i = pageStart; i < pageEnd; i ++ ) {
      if(removeUsers[i]) {
       newRemoveUsers = newRemoveUsers.concat(removeUsers[i]);
      }
    }
    this.setState({removeUsersPage: newRemoveUsers});
    if(newRemoveUsers.length === 0 && this.state.currentRemovePage !== 1) {
      this.goToRemovePage(this.state.currentRemovePage -1);
    }

  }

  toggleUserRemoved(user: UserType) {
    this.props.setRemoved(this.turnUserToUiSelectItem(user));
  }

  UNSAFE_componentWillReceiveProps(nextProps:DialogRemoveUsersProps, nextState:DialogRemoveUsersState ) {
    if(this.props.removeUsers.length !== nextProps.removeUsers.length ) {
      this.refreshRemoveUserpage(this.state.currentRemovePage, nextProps.removeUsers);
    }
  }

  checkUserInRemoveList(user: UserType, removedListUsers: UiSelectItem[]) {
    for(let i = 0; i < removedListUsers.length; i++) {
      if(user.id === removedListUsers[i].id) {
        return true;
      }
    }
    return false;
  }

  componentDidMount() {
    this.refreshRemoveUserpage(this.state.currentRemovePage, this.props.removeUsers);
    this.goToAllUsersPage(this.state.currentAllPage);
  }

  render(){
    return(
    <Tabs onTabChange={this.onTabChange} renderAllComponents activeTab={this.state.activeTab} tabs={[
      {
        id: this.props.identifier + "-ALL",
        name: this.props.allTabTitle,
        component: ()=>{
          return <DialogRow modifiers="user-search">
            <DialogRow>
              <SearchFormElement name="search-user-group-users" placeholder={this.props.placeholder} value={this.props.searchValue} id="searchUserGroupUsers"  updateField={this.props.searchUsers} />
            </DialogRow>
            <DialogRow>
              <ApplicationList modifiers="dialog-users">
                {this.props.users.length > 0 ?
                  this.props.users.map((user: UserType) => {
                    return <ApplicationListItem className="course" classState={this.checkUserInRemoveList(user, this.props.removeUsers) ? "disabled" : ""} key={"all-" + user.id}>
                      <ApplicationListItemContentWrapper>
                        <ApplicationListItemHeader onClick={this.toggleUserRemoved.bind(this, user)} modifiers="course">
                          <span className="application-list__header-primary">{user.firstName + " " + user.lastName}</span>
                          <span className="application-list__header-secondary"></span>
                        </ApplicationListItemHeader>
                      </ApplicationListItemContentWrapper>
                    </ApplicationListItem>
                  })
                  : <div className="empty">{this.props.onEmptyTitle}</div>}
              </ApplicationList>
            </DialogRow>
            <DialogRow>
            <Pager identifier={this.props.identifier + "All"} current={this.state.currentAllPage} onClick={this.goToAllUsersPage} pages={this.props.pages}></Pager>
            </DialogRow>
          </DialogRow>
        }
      },
      {
        id: this.props.identifier + "-REMOVE",
        name: this.props.removeTabTitle,
        component: ()=>{
          let removePages = Math.ceil(this.props.removeUsers.length / this.maxUsersPerPage);
          return <DialogRow>
            <DialogRow>
              <ApplicationList modifiers="dialog-users">
                {this.state.removeUsersPage.length > 0 ?
                  this.state.removeUsersPage.map((user: UiSelectItem) => {
                    return <ApplicationListItem className="course" key={"remove-" + user.id}>
                      <ApplicationListItemContentWrapper>
                        <ApplicationListItemHeader onClick={this.toggleUserRemoved.bind(this, user)} modifiers="course">
                          <span className="application-list__header-primary">{user.label}</span>
                          <span className="application-list__header-secondary"></span>
                        </ApplicationListItemHeader>
                      </ApplicationListItemContentWrapper>
                    </ApplicationListItem>
                  })
                  : <div className="empty">{this.props.onEmptyTitle}</div>}
              </ApplicationList>
            </DialogRow>
            <DialogRow>
              {this.props.removeUsers.length > 0 ?
              <Pager identifier={this.props.identifier + "Remove"} current={this.state.currentRemovePage} onClick={this.goToRemovePage} pages={removePages}></Pager> : null }
            </DialogRow>
          </DialogRow>
        }
      }
    ]} />
    )
  }
}
