import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import Link from '~/components/general/link';
import {i18nType} from '~/reducers/base/i18n';
import * as queryString from 'query-string';

import '~/sass/elements/buttons.scss';
import '~/sass/elements/item-list.scss';
import { GuiderFilterType, GuiderUserLabelListType, GuiderUserLabelType, GuiderWorkspaceType } from '~/reducers/main-function/guider/guider-filters';
import { GuiderStudentsType } from '~/reducers/main-function/guider/guider-students';
import LabelUpdateDialog from './application/label-update-dialog';
import {StateType} from '~/reducers';

interface NavigationProps {
  i18n: i18nType,
  guiderFilters: GuiderFilterType,
  guiderStudents: GuiderStudentsType
}

interface NavigationState {
  
}

class Navigation extends React.Component<NavigationProps, NavigationState> {
  render(){
    let locationData = queryString.parse(document.location.hash.split("?")[1] || "", {arrayFormat: 'bracket'});
    return <div className="item-list item-list--aside-navigation">
      {this.props.guiderFilters.labels.length !== 0 ? 
        <span className="text item-list__topic">{this.props.i18n.text.get("plugin.guider.filters.flags")}</span>
      : null}
      {this.props.guiderFilters.labels.map((label: GuiderUserLabelType)=>{
        let isActive = this.props.guiderStudents.filters.labelFilters.includes(label.id);
        let hash = isActive ? 
            queryString.stringify(Object.assign({}, locationData, {c: "", l: (locationData.l || []).filter((i:string)=>parseInt(i)!==label.id)}), {arrayFormat: 'bracket'}) :
            queryString.stringify(Object.assign({}, locationData, {c: "", l: (locationData.l || []).concat(label.id)}), {arrayFormat: 'bracket'})
        return <Link key={label.id} className={`item-list__item ${isActive ? "active" : ""}`} href={"#?" + hash}>
          <span className="icon-flag" style={{color: label.color}}></span>
          <span className="item-list__text-body text">
            {label.name}
          </span>
          <LabelUpdateDialog label={label}>
            <Link disablePropagation as="span" className="button-pill button-pill--navigation-edit-label">
              <span className="item-list__icon icon-edit"/>
            </Link>
          </LabelUpdateDialog>
        </Link>
      })}
      <span className="text item-list__topic">{this.props.i18n.text.get("plugin.guider.filters.workspaces")}</span>
      {this.props.guiderFilters.workspaces.map((workspace: GuiderWorkspaceType)=>{
        let isActive = this.props.guiderStudents.filters.workspaceFilters.includes(workspace.id);
        let hash = isActive ?
            queryString.stringify(Object.assign({}, locationData, {c: "", w: (locationData.w || []).filter((w:string)=>parseInt(w)!==workspace.id)}), {arrayFormat: 'bracket'}) :
            queryString.stringify(Object.assign({}, locationData, {c: "", w: (locationData.w || []).concat(workspace.id)}), {arrayFormat: 'bracket'});
        return <Link key={workspace.id} className={`item-list__item ${isActive ? "active" : ""}`} href={"#?" + hash}>
          <span className="item-list__text-body text">
            {workspace.name}
          </span>
        </Link>
      })}
   </div>
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    guiderFilters: (state as any).guiderFilters,
    guiderStudents: (state as any).guiderStudents
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navigation);