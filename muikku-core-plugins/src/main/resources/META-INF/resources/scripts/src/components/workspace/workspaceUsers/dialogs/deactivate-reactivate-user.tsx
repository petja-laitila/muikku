import Dialog from "~/components/general/dialog";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import { StateType } from "~/reducers";
import "~/sass/elements/buttons.scss";
import { bindActionCreators } from "redux";
import Button from "~/components/general/button";
import {
  toggleActiveStateOfStudentOfWorkspace,
  ToggleActiveStateOfStudentOfWorkspaceTriggerType,
} from "~/actions/workspaces";
import { ShortWorkspaceUserWithActiveStatusType } from "~/reducers/user-index";
import { getName } from "~/util/modifiers";
import { WorkspaceType } from "~/reducers/workspaces";

/**
 * DeactivateReactivateUserDialogProps
 */
interface DeactivateReactivateUserDialogProps {
  i18n: i18nType;

  user: ShortWorkspaceUserWithActiveStatusType;
  toggleActiveStateOfStudentOfWorkspace: ToggleActiveStateOfStudentOfWorkspaceTriggerType;
  workspace: WorkspaceType;

  isOpen: boolean;
  onClose: () => any;
}

/**
 * DeactivateReactivateUserDialogState
 */
interface DeactivateReactivateUserDialogState {}

/**
 * DeactivateReactivateUserDialog
 */
class DeactivateReactivateUserDialog extends React.Component<
  DeactivateReactivateUserDialogProps,
  DeactivateReactivateUserDialogState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: DeactivateReactivateUserDialogProps) {
    super(props);

    this.toggleActiveStatus = this.toggleActiveStatus.bind(this);
  }

  /**
   * toggleActiveStatus
   * @param closeDialog closeDialog
   */
  toggleActiveStatus(closeDialog: () => any) {
    this.props.toggleActiveStateOfStudentOfWorkspace({
      workspace: this.props.workspace,
      student: this.props.user,
      success: closeDialog,
    });
  }

  /**
   *
   */
  render() {
    /**
     * content
     * @param closeDialog closeDialog
     */
    const content = (closeDialog: () => any) => (
      <div>
        <span>
          {this.props.i18n.text.get(
            this.props.user.active
              ? "plugin.workspace.users.student.archiveDialog.description"
              : "plugin.workspace.users.student.unarchiveDialog.description",
            getName(this.props.user, true)
          )}
        </span>
      </div>
    );

    /**
     * footer
     * @param closeDialog closeDialog
     */
    const footer = (closeDialog: () => any) => (
      <div className="dialog__button-set">
        <Button
          buttonModifiers={
            this.props.user.active
              ? ["fatal", "standard-ok"]
              : ["execute", "standard-ok"]
          }
          onClick={this.toggleActiveStatus.bind(this, closeDialog)}
        >
          {this.props.i18n.text.get(
            this.props.user.active
              ? "plugin.workspace.users.student.archiveDialog.archiveButton"
              : "plugin.workspace.users.student.unarchiveDialog.archiveButton"
          )}
        </Button>
        <Button
          buttonModifiers={["cancel", "standard-cancel"]}
          onClick={closeDialog}
        >
          {this.props.i18n.text.get(
            this.props.user.active
              ? "plugin.workspace.users.student.archiveDialog.cancelButton"
              : "plugin.workspace.users.student.unarchiveDialog.cancelButton"
          )}
        </Button>
      </div>
    );
    return (
      <Dialog
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        title={this.props.i18n.text.get(
          this.props.user.active
            ? "plugin.workspace.users.student.archiveDialog.title"
            : "plugin.workspace.users.student.unarchiveDialog.title"
        )}
        content={content}
        footer={footer}
        modifier="deactivate-reactivate-user"
      />
    );
  }
}

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    workspace: state.workspaces.currentWorkspace,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(
    { toggleActiveStateOfStudentOfWorkspace },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeactivateReactivateUserDialog);
