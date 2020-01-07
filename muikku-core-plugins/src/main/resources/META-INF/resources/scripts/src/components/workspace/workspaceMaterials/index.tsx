import WorkspaceNavbar from '~/components/base/workspace/navbar';
import ScreenContainer from '~/components/general/screen-container';

import * as React from 'react';

import Materials from './materials';
import MaterialEditor from '~/components/base/material-editor';
import TableOfContentsComponent from './content';

import EnrollmentDialog from "../enrollment-dialog";

interface WorkspaceMaterialsBodyProps {
  workspaceUrl: string,
  onActiveNodeIdChange: (newId: number)=>any;
  enrollmentDialogOpen: boolean;
  onCloseEnrollmentDialog: () => void;
}

interface WorkspaceMaterialsBodyState {
}

export default class WorkspaceMaterialsBody extends React.Component<WorkspaceMaterialsBodyProps, WorkspaceMaterialsBodyState> {
  constructor(props: WorkspaceMaterialsBodyProps){
    super(props);

    this.onOpenNavigation = this.onOpenNavigation.bind(this);
  }
  onOpenNavigation(){
    (this.refs.content as any).getWrappedInstance().refresh();
  }
  render(){
    let navigationComponent = <TableOfContentsComponent ref="content"/>;
    return (<div>
      <WorkspaceNavbar activeTrail="materials" workspaceUrl={this.props.workspaceUrl}/>
      <EnrollmentDialog
        isOpen={this.props.enrollmentDialogOpen} onClose={this.props.onCloseEnrollmentDialog}/>
      <MaterialEditor/>
      <Materials onOpenNavigation={this.onOpenNavigation}
        navigation={navigationComponent} ref="materials" onActiveNodeIdChange={this.props.onActiveNodeIdChange}/>
    </div>);
  }
}