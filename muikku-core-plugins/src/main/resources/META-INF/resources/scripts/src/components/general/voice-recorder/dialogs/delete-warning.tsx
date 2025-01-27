import * as React from "react";
import Dialog from "~/components/general/dialog";
import { connect, Dispatch } from "react-redux";
import { bindActionCreators } from "redux";
import Button from "~/components/general/button";
import { AnyActionType } from "~/actions";
import { StateType } from "~/reducers";
import "~/sass/elements/form.scss";
import { i18nType } from "~/reducers/base/i18n";

/**
 * DeleteDialogProps
 */
interface DeleteDialogProps {
  i18n: i18nType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any>;
  isOpen?: boolean;
  onDeleteAudio: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClose?: () => any;
}

/**
 * DeleteDialogState
 */
interface DeleteDialogState {}

/**
 * DeleteDialog
 */
class DeleteDialog extends React.Component<
  DeleteDialogProps,
  DeleteDialogState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: DeleteDialogProps) {
    super(props);

    this.handleDeleteAudioFieldClick =
      this.handleDeleteAudioFieldClick.bind(this);
  }

  /**
   * handleDeleteEventClick
   * @param closeDialog closeDialog
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDeleteAudioFieldClick(closeDialog: () => any) {
    this.props.onDeleteAudio();
    closeDialog();
  }

  /**
   * Component render method
   * @returns JSX.Element
   */
  render() {
    /**
     * footer
     * @param closeDialog closeDialog
     * @returns JSX.Element
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const footer = (closeDialog: () => any) => (
      <div className="dialog__button-set">
        <Button
          buttonModifiers={["fatal", "standard-ok"]}
          onClick={this.handleDeleteAudioFieldClick.bind(this, closeDialog)}
        >
          {this.props.i18n.text.get(
            "plugin.evaluation.evaluationModal.audioAssessments.removeDialog.removeButton"
          )}
        </Button>
        <Button
          buttonModifiers={["cancel", "standard-cancel"]}
          onClick={closeDialog}
        >
          {this.props.i18n.text.get(
            "plugin.evaluation.evaluationModal.audioAssessments.removeDialog.cancelButton"
          )}
        </Button>
      </div>
    );

    /**
     * content
     * @param closeDialog closeDialog
     * @returns JSX.Element
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const content = (closeDialog: () => any) => (
      <div>
        {this.props.i18n.text.get(
          "plugin.evaluation.evaluationModal.audioAssessments.removeDialog.description"
        )}
      </div>
    );
    return (
      <Dialog
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        modifier="evaluation-remove-assessment"
        title={this.props.i18n.text.get(
          "plugin.evaluation.evaluationModal.audioAssessments.removeDialog.title"
        )}
        content={content}
        footer={footer}
      >
        {this.props.children}
      </Dialog>
    );
  }
}

/* localStorage.getItem(`workspace-editor-edit.${draftId}.`)
 */
/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteDialog);
