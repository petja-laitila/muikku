import * as React from "react";
import { connect, Dispatch } from "react-redux";
import Dialog from "~/components/general/dialog";
import { AnyActionType } from "~/actions";
import { i18nType } from "~/reducers/base/i18n";
import "~/sass/elements/link.scss";
import { StateType } from "~/reducers";
import Button from "~/components/general/button";
import { bindActionCreators } from "redux";
import { WorkspaceMaterialEditorType } from "~/reducers/workspaces";
import {
  setWorkspaceMaterialEditorState,
  updateWorkspaceMaterialContentNode,
  SetWorkspaceMaterialEditorStateTriggerType,
  UpdateWorkspaceMaterialContentNodeTriggerType,
} from "~/actions/workspaces/material";

/**
 * ConfirmPublishRemovePageWithLinkedAnswersDialogProps
 */
interface ConfirmPublishRemovePageWithLinkedAnswersDialogProps {
  i18n: i18nType;
  materialEditor: WorkspaceMaterialEditorType;
  setWorkspaceMaterialEditorState: SetWorkspaceMaterialEditorStateTriggerType;
  updateWorkspaceMaterialContentNode: UpdateWorkspaceMaterialContentNodeTriggerType;
}

/**
 * ConfirmPublishRemovePageWithLinkedAnswersDialogState
 */
interface ConfirmPublishRemovePageWithLinkedAnswersDialogState {
  locked: boolean;
}

/**
 * ConfirmPublishRemovePageWithLinkedAnswersDialog
 */
class ConfirmPublishRemovePageWithLinkedAnswersDialog extends React.Component<
  ConfirmPublishRemovePageWithLinkedAnswersDialogProps,
  ConfirmPublishRemovePageWithLinkedAnswersDialogState
> {
  /**
   * Constructor method
   *
   * @param props props
   */
  constructor(props: ConfirmPublishRemovePageWithLinkedAnswersDialogProps) {
    super(props);
    this.state = {
      locked: false,
    };

    this.cancel = this.cancel.bind(this);
    this.confirm = this.confirm.bind(this);
  }

  /**
   * confirm
   *
   * @param closeDialog closeDialog
   */
  confirm(closeDialog: () => any) {
    this.setState({
      locked: true,
    });

    this.props.updateWorkspaceMaterialContentNode({
      workspace: this.props.materialEditor.currentNodeWorkspace,
      material: this.props.materialEditor.currentNodeValue,
      update: this.props.materialEditor.currentDraftNodeValue,
      removeAnswers: true,
      updateLinked: true,
      /**
       * success
       */
      success: () => {
        this.setState({
          locked: false,
        });
        closeDialog();
      },
      /**
       * fail
       */
      fail: () => {
        this.setState({
          locked: false,
        });
      },
    });
  }

  /**
   * cancel
   *
   * @param closeDialog closeDialog
   */
  cancel(closeDialog?: () => any) {
    closeDialog && closeDialog();
    this.props.setWorkspaceMaterialEditorState({
      ...this.props.materialEditor,
      showRemoveAnswersDialogForPublish: false,
    });
  }

  /**
   * Component render method
   *
   * @returns JSX.Element
   */
  render() {
    /**
     * content
     *
     * @param closeDialog closeDialog
     * @returns JSX.Element
     */
    const content = (closeDialog: () => any) => (
      <div>
        <span>
          {this.props.i18n.text.get(
            "plugin.workspace.materialsManagement.confirmPublishPageWithAnswers.text"
          )}
        </span>
      </div>
    );

    /**
     * footer
     *
     * @param closeDialog closeDialog
     * @returns JSX.Element
     */
    const footer = (closeDialog: () => any) => (
      <div className="dialog__button-set">
        <Button
          buttonModifiers={["standard-ok", "fatal"]}
          onClick={this.confirm.bind(this, closeDialog)}
          disabled={this.state.locked}
        >
          {this.props.i18n.text.get(
            "plugin.workspace.materialsManagement.confirmPublishPageWithAnswers.confirmButton"
          )}
        </Button>
        <Button
          buttonModifiers={["cancel", "standard-cancel"]}
          onClick={this.cancel.bind(this, closeDialog)}
          disabled={this.state.locked}
        >
          {this.props.i18n.text.get(
            "plugin.workspace.materialsManagement.confirmPublishPageWithAnswers.cancelButton"
          )}
        </Button>
      </div>
    );

    return (
      <Dialog
        modifier="confirm-remove-answer-dialog"
        isOpen={
          this.props.materialEditor.showRemoveLinkedAnswersDialogForPublish
        }
        onClose={this.cancel}
        title={this.props.i18n.text.get(
          "plugin.workspace.materialsManagement.confirmPublishPageWithAnswers.title"
        )}
        content={content}
        footer={footer}
      />
    );
  }
}

/**
 * mapStateToProps
 *
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    materialEditor: state.workspaces.materialEditor,
  };
}

/**
 * mapDispatchToProps
 *
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators(
    { setWorkspaceMaterialEditorState, updateWorkspaceMaterialContentNode },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConfirmPublishRemovePageWithLinkedAnswersDialog);
