import LanguagePicker from './navbar/language-picker';
import ProfileItem from './navbar/profile-item';
import Menu from './navbar/menu';
import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import {i18nType} from '~/reducers/base/i18n';
import {StateType} from '~/reducers';

import '~/sass/elements/navbar.scss';

interface NavbarProps {
  modifier: string,
  navbarItems: ({
    modifier?:string,
    item: React.ReactElement<any>
  })[],
  menuItems: (React.ReactElement<any>)[],
  defaultOptions: (React.ReactElement<any>)[],
  navigation?: React.ReactElement<any> | Array<React.ReactElement<any>>,
  mobileTitle?: string,
  extraContent?: any,
  i18n: i18nType
}

interface NavbarState {
  isMenuOpen: boolean
}

class Navbar extends React.Component<NavbarProps, NavbarState> {
  constructor(props: NavbarProps){
    super(props);
    this.openMenu = this.openMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
    this.state = {
      isMenuOpen: false
    }
  }
  openMenu(){
    this.setState({
      isMenuOpen: true
    });
  }
  closeMenu(){
    this.setState({
      isMenuOpen: false
    });
  }
  render(){
    return (
      <div>
        <nav className={`navbar ${this.props.modifier ? 'navbar--' + this.props.modifier : ''}`} id="stick">
          <div className="navbar__wrapper">
            <div className="navbar__logo">
              <a href="/"><img src={`${this.props.modifier == "frontpage" ? '/gfx/oo-branded-site-logo-text.png' : '/gfx/oo-branded-site-logo-text-white.png'}`} width="175" height="67" alt={this.props.i18n.text.get("plugin.site.logo.linkBackToFrontPage")}/></a>
            </div>
            <ul className="navbar__items">
              <li className={`navbar__item navbar__item--menu-button`}>
                <a className={`link link--icon link--full ${this.props.modifier ? 'link--' + this.props.modifier : ''}`} onClick={this.openMenu}>
                  <span className="link__icon icon-navicon"></span>
                </a>
              </li>
              {this.props.navbarItems.map((item, index)=>{
                if (!item){
                  return null;
                }
                return (<li key={index} className={`navbar__item navbar__item--${item.modifier}`}>
                  {item.item}
                </li>);
              }).filter(item=>!!item)}
            </ul>
            {this.props.mobileTitle ? <div className="navbar__mobile-title">{this.props.mobileTitle}</div> : null}
            <div className="navbar__default-options">
              {this.props.defaultOptions}
              <ProfileItem modifier={this.props.modifier}/>
              <LanguagePicker />
            </div>
          </div>
        </nav>
        <Menu open={this.state.isMenuOpen} onClose={this.closeMenu}
          items={this.props.menuItems} modifier={this.props.modifier} navigation={this.props.navigation}/>
        {this.props.extraContent}
      </div>
      );
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(Navbar);
