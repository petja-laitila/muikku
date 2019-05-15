import Workspace from './workspaces/workspace';
import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { i18nType } from '~/reducers/base/i18n';
import { GuiderCurrentStudentStateType, GuiderStudentUserProfileType, GuiderType } from '~/reducers/main-function/guider';
import {StateType} from '~/reducers';

import '~/sass/elements/application-list.scss';

interface CurrentStudentWorkspacesProps {
  i18n: i18nType,
  guider: GuiderType,
  locale: string
}

interface CurrentStudentWorkspacesState {
}

class CurrentStudentWorkspaces extends React.Component<CurrentStudentWorkspacesProps, CurrentStudentWorkspacesState> {
  render(){
    let reactComponent = this;
    return this.props.guider.currentStudent.workspaces ?  (this.props.guider.currentStudent.workspaces.length ? <div className="application-list">
      {this.props.guider.currentStudent.workspaces.sort(function(a, b) {
        return ('' + a.name).localeCompare(b.name, reactComponent.props.locale , {sensitivity: 'base'});
      }).map((workspace)=>{
        return <Workspace workspace={workspace} key={workspace.id}/>
      })}
    </div> : <div className="mf-content-empty cm-no-messages flex-row">
      <h3 className=" lg-flex-cell-full md-flex-cell-full sm-flex-cell-full flex-align-items-center">{this.props.i18n.text.get("plugin.guider.noWorkspaces")}</h3>
    </div>) : null;
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    guider: state.guider,
    locale: state.locales.current
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CurrentStudentWorkspaces);