import * as React from 'react';
import {connect, Dispatch} from 'react-redux';
import ApplicationPanel from '~/components/general/application-panel';
import HoverButton from '~/components/general/hover-button';
import Dropdown from '~/components/general/dropdown';
import Link from '~/components/general/link';
import Toolbar from './application/toolbar';
import WorkspaceJournals from './application/journals';
import {i18nType} from '~/reducers/base/i18n';

import '~/sass/elements/link.scss';
import '~/sass/elements/form-elements.scss';
import '~/sass/elements/form.scss';

import {StateType} from '~/reducers';

import { WorkspaceType } from '~/reducers/workspaces';
import { StatusType } from '~/reducers/base/status';
import { getName } from '~/util/modifiers';
import Button from '~/components/general/button';
import { bindActionCreators } from 'redux';
import { loadCurrentWorkspaceJournalsFromServer, LoadCurrentWorkspaceJournalsFromServerTriggerType } from '~/actions/workspaces';

interface WorkspaceJournalApplicationProps {
  i18n: i18nType,
  workspace: WorkspaceType
  status: StatusType,
  loadCurrentWorkspaceJournalsFromServer: LoadCurrentWorkspaceJournalsFromServerTriggerType
}

interface WorkspaceJournalApplicationState {
}

class WorkspaceJournalApplication extends React.Component<WorkspaceJournalApplicationProps, WorkspaceJournalApplicationState> {
  constructor(props: WorkspaceJournalApplicationProps){
    super(props);
    
    this.onWorkspaceJournalFilterChange = this.onWorkspaceJournalFilterChange.bind(this);
  }

  onWorkspaceJournalFilterChange(e: React.ChangeEvent<HTMLSelectElement>){
    let newValue = parseInt(e.target.value) || null;
    this.props.loadCurrentWorkspaceJournalsFromServer(newValue);
  }
  render(){
    let title = <h2 className="application-panel__header-title">
      {this.props.i18n.text.get('plugin.workspace.journal.pageTitle') + " - "}
      {this.props.workspace && this.props.workspace.name}
    </h2>
    let toolbar = <Toolbar/>
    let primaryOption;
    if (this.props.workspace && this.props.workspace.students){
      primaryOption = <div className="form-element"> 
        {!this.props.status.isStudent ?
          <select className="form-element__select form-element__select--main-action"
            value={this.props.workspace.journals.userEntityId || ""} onChange={this.onWorkspaceJournalFilterChange}>
            <option value="">{this.props.i18n.text.get("plugin.workspace.journal.studentFilter.showAll")}</option>
            {this.props.workspace.students
              .filter((student, index, array)=>
                array.findIndex((otherStudent, otherIndex)=>otherStudent.userEntityId === student.userEntityId) === index
              ).map((student)=>{
              return <option key={student.userEntityId} value={student.userEntityId}>{getName(student, true)}</option>
            })}
          </select>
        : 
          <Button buttonModifiers="primary-function">
            {this.props.i18n.text.get('plugin.workspace.journal.newEntryButton.label')}
          </Button>
        }
      </div>
    }
    
    return (<div>
      <ApplicationPanel modifier="WorkspaceJournal" toolbar={toolbar} title={title} primaryOption={primaryOption}>
        <WorkspaceJournals/>
      </ApplicationPanel>
    </div>);
  }
}

function mapStateToProps(state: StateType){
  return {
    i18n: state.i18n,
    workspace: state.workspaces.currentWorkspace,
    status: state.status
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>){
  return bindActionCreators({loadCurrentWorkspaceJournalsFromServer}, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceJournalApplication);