/* eslint-disable react/no-string-refs */

/**
 * Depcrecated refs should be refactored
 */

import WorkspaceNavbar from "~/components/base/workspace/navbar";
import Users from "./users";
import * as React from "react";

interface WorkspaceUsersBodyProps {
  workspaceUrl: string;
}

export default class WorkspaceUsersBody extends React.Component<
  WorkspaceUsersBodyProps,
  Record<string, unknown>
> {
  constructor(props: WorkspaceUsersBodyProps) {
    super(props);

    this.onOpenNavigation = this.onOpenNavigation.bind(this);
  }
  onOpenNavigation() {
    (this.refs.content as any).getWrappedInstance().refresh();
  }
  render() {
    return (
      <div>
        <WorkspaceNavbar
          activeTrail="users"
          workspaceUrl={this.props.workspaceUrl}
        />
        <Users />
      </div>
    );
  }
}
