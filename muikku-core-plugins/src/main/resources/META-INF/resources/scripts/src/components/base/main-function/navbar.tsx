import Navbar from '~/components/general/navbar';
import Link from '~/components/general/link';
import LoginButton from '../login-button';
import ForgotPasswordDialog from '../forgot-password-dialog';
import Dropdown from '~/components/general/dropdown';

import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {i18nType} from '~/reducers/base/i18n';
import {StatusType} from '~/reducers/base/status';
import {StateType} from '~/reducers';

import '~/sass/elements/link.scss';
import '~/sass/elements/indicator.scss';

interface ItemDataElement {
  modifier: string,
  trail: string,
  text: string,
  href: string,
  to?: boolean,
  icon: string,
  condition?: boolean,
  badge?: number,
  openInNewTab?: string,
}

interface MainFunctionNavbarProps {
  activeTrail?: string,
  i18n: i18nType,
  navigation?: React.ReactElement<any>,
  status: StatusType,
  messageCount: number,
  title: string
}

interface MainFunctionNavbarState {

}

class MainFunctionNavbar extends React.Component<MainFunctionNavbarProps, MainFunctionNavbarState> {
  render(){
    const itemData: ItemDataElement[] = [{
      modifier: "home",
      trail: "index",
      text: 'plugin.home.home',
      href: "/",
      icon: "home",
      // Go to frontpage if not logged in
      to: this.props.status.loggedIn,
      condition: true,
    }, {
      modifier: "coursepicker",
      trail: "coursepicker",
      text: 'plugin.coursepicker.coursepicker',
      href: "/coursepicker",
      icon: "books",
      to: true,
      condition: true,
    }, {
      modifier: "communicator",
      trail: "communicator",
      text: 'plugin.communicator.communicator',
      href: "/communicator",
      icon: "envelope",
      condition: this.props.status.isActiveUser && this.props.status.loggedIn,
      to: true,
      badge: this.props.messageCount,
    }, {
      modifier: "discussion",
      trail: "discussion",
      text: 'plugin.forum.forum',
      href: "/discussion",
      icon: "bubbles",
      to: true,
      condition: this.props.status.isActiveUser && this.props.status.loggedIn && this.props.status.permissions.FORUM_ACCESSENVIRONMENTFORUM,
    }, {
      modifier: "guider",
      trail: "guider",
      text: 'plugin.guider.guider',
      href: "/guider",
      icon: "users",
      to: true,
      condition: this.props.status.permissions.GUIDER_VIEW,
    }, {
      // Transcript of records is way too heavy and crazy to be its own thing, let it be here until it is refactored
      modifier: "records",
      trail: "records",
      text: 'plugin.records.records',
      href: "/records",
      icon: "profile",
      to: true,
      condition: this.props.status.permissions.TRANSCRIPT_OF_RECORDS_VIEW,
    },{
      modifier: "announcer",
      trail: "announcer",
      text: 'plugin.announcer.announcer',
      href: "/announcer",
      icon: "paper-plane",
      to: true,
      condition: this.props.status.permissions.ANNOUNCER_TOOL,
    },{
      //Evaluation is also an external
      modifier: "evaluation",
      trail: "evaluation",
      text: 'plugin.evaluation.evaluation',
      href: "/evaluation2",
      icon: "evaluate",
      condition: this.props.status.permissions.EVALUATION_VIEW_INDEX,
      openInNewTab: "_blank",
    },{
      //Evaluation is also an external
      modifier: "evaluation",
      trail: "evaluation",
      text: 'plugin.evaluation.evaluation',
      href: "/evaluation",
      icon: "evaluate",
      to: true,
      condition: this.props.status.permissions.EVALUATION_VIEW_INDEX,
    }];

    return <Navbar mobileTitle={this.props.title} isProfileContainedInThisApp={true}
      modifier="main-function" navigation={this.props.navigation} navbarItems={itemData.map((item, i)=>{
      if (!item.condition){
        return null;
      }
        return {
        modifier: item.modifier,
        item: (<Dropdown openByHover key={item.text + i} content={this.props.i18n.text.get(item.text)}>
          <Link openInNewTab={item.openInNewTab} as={this.props.activeTrail == item.trail ? "span" : null} href={this.props.activeTrail !== item.trail ? item.href : null} to={item.to && this.props.activeTrail !== item.trail ? item.href : null} className={`link link--icon link--full link--main-function-navbar ${this.props.activeTrail === item.trail ? 'active' : ''}`}
            aria-label={this.props.activeTrail == item.trail ? this.props.i18n.text.get("plugin.wcag.mainNavigation.currentPage.aria.label") + " " + this.props.i18n.text.get(item.text) : this.props.i18n.text.get(item.text)} role="menuitem">
          <span className={`link__icon icon-${item.icon}`}/>
          {item.badge ? <span className="indicator indicator--main-function">{(item.badge >= 100 ? "99+" : item.badge)}</span> : null}
        </Link></Dropdown>)
      }
    })} defaultOptions={this.props.status.loggedIn ? null : [
      (<LoginButton modifier="login-main-function" key="0"/>),
      (<ForgotPasswordDialog key="1"><Link className="link link--forgot-password link--forgot-password-main-function" aria-label={this.props.i18n.text.get('plugin.forgotpassword.forgotLink')} role="menuitem">
        <span>{this.props.i18n.text.get('plugin.forgotpassword.forgotLink')}</span>
      </Link></ForgotPasswordDialog>)
    ]} menuItems={itemData.map((item: ItemDataElement)=>{
      if (!item.condition){
        return null;
      }
      return <Link openInNewTab={item.openInNewTab} to={item.to ? item.href : null} href={item.href} className={`link link--full link--menu ${this.props.activeTrail === item.trail ? 'active' : ''}`} aria-label={this.props.i18n.text.get(item.text)} role="menuitem">
        <span className={`link__icon icon-${item.icon}`}/>
        {item.badge ? <span className="indicator indicator--main-function">{(item.badge >= 100 ? "99+" : item.badge)}</span> : null}
        <span className="link--menu__text">{this.props.i18n.text.get(item.text)}</span>
      </Link>
    })}/>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    status: state.status,
    messageCount: state.messages.unreadThreadCount,
    title: state.title
  }
};

const mapDispatchToProps = (dispatch: Dispatch<any>)=>{
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MainFunctionNavbar);
