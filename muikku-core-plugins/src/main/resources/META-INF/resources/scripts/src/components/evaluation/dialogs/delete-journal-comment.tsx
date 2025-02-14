import "~/sass/elements/link.scss";
import "~/sass/elements/form.scss";
import "~/sass/elements/buttons.scss";
import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { AnyActionType } from "~/actions";
import { i18nType } from "~/reducers/base/i18n";
import Dialog from "~/components/general/dialog";
import Button from "~/components/general/button";
import { StateType } from "~/reducers";
import { JournalComment } from "~/@types/journal";
import {
  DeleteEvaluationJournalCommentTriggerType,
  deleteEvaluationJournalComment,
} from "../../../actions/main-function/evaluation/evaluationActions";

/**
 * DeleteJournalProps
 */
interface DeleteJournalCommentProps {
  i18n: i18nType;
  userEntityId: number;
  workspaceEntityId: number;
  journalComment: JournalComment;
  deleteEvaluationJournalComment: DeleteEvaluationJournalCommentTriggerType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  children: React.ReactElement<any>;
}

/**
 * DeleteJournalState
 */
interface DeleteJournalCommentState {
  locked: boolean;
}

/**
 * DeleteJournal
 */
class DeleteJournalComment extends React.Component<
  DeleteJournalCommentProps,
  DeleteJournalCommentState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: DeleteJournalCommentProps) {
    super(props);

    this.deleteJournalComment = this.deleteJournalComment.bind(this);

    this.state = {
      locked: false,
    };
  }

  /**
   * deleteJournal
   * @param closeDialog closeDialog
   */
  deleteJournalComment(closeDialog: () => void) {
    const { journalComment, userEntityId, workspaceEntityId } = this.props;

    this.setState({ locked: true });
    this.props.deleteEvaluationJournalComment({
      deleteCommentPayload: {
        id: this.props.journalComment.id,
        journalEntryId: this.props.journalComment.journalEntryId,
      },
      journalEntryId: this.props.journalComment.journalEntryId,
      workspaceEntityId: this.props.workspaceEntityId,
      // eslint-disable-next-line jsdoc/require-jsdoc
      success: () => {
        localStorage.removeItem(
          `diary-journalComment-edit.${userEntityId}-${workspaceEntityId}-${journalComment.journalEntryId}-${journalComment.id}.journalCommentText`
        );

        this.setState({ locked: false });
        closeDialog();
      },
      // eslint-disable-next-line jsdoc/require-jsdoc
      fail: () => {
        this.setState({ locked: false });
      },
    });
  }

  /**
   * render
   */
  render() {
    /**
     * content
     * @param closeDialog closeDialog
     */
    const content = (closeDialog: () => void) => (
      <div>
        {this.props.i18n.text.get(
          "plugin.workspace.journal.deleteComment.dialog.description"
        )}
      </div>
    );

    /**
     * footer
     * @param closeDialog closeDialog
     */
    const footer = (closeDialog: () => void) => (
      <div className="dialog__button-set">
        <Button
          buttonModifiers={["fatal", "standard-ok"]}
          onClick={this.deleteJournalComment.bind(this, closeDialog)}
          disabled={this.state.locked}
        >
          {this.props.i18n.text.get(
            "plugin.workspace.journal.deleteComment.dialog.deleteButton"
          )}
        </Button>
        <Button
          buttonModifiers={["cancel", "standard-cancel"]}
          onClick={closeDialog}
        >
          {this.props.i18n.text.get(
            "plugin.workspace.journal.deleteComment.dialog.cancelButton"
          )}
        </Button>
      </div>
    );

    return (
      <Dialog
        modifier="delete-journal"
        title={this.props.i18n.text.get(
          "plugin.workspace.journal.deleteComment.dialog.title"
        )}
        content={content}
        footer={footer}
      >
        {this.props.children}
      </Dialog>
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
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({ deleteEvaluationJournalComment }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DeleteJournalComment);
