import { i18nType } from "~/reducers/base/i18n";
import * as React from "react";
import { Dispatch, connect } from "react-redux";
import { AnyActionType } from "~/actions";
import { bindActionCreators } from "redux";
import CKEditor from "~/components/general/ckeditor";
import {
  editContactLogEventComment,
  EditContactLogEventCommentTriggerType,
} from "~/actions/main-function/guider";
import { ContactTypes } from "~/reducers/main-function/guider";
import { StateType } from "~/reducers";
import SessionStateComponent from "~/components/general/session-state-component";
import Button from "~/components/general/button";
import * as moment from "moment";
import { StatusType } from "~/reducers/base/status";
import { ContactLogEventComment } from "~/reducers/main-function/guider";

/**
 * EditContactLogEventCommentStateProps
 */
interface EditContactLogEventCommentProps {
  i18n: i18nType;
  status: StatusType;
  comment: ContactLogEventComment;
  studentUserEntityId: number;
  editContactLogEventComment: EditContactLogEventCommentTriggerType;
  closeEditor: () => void;
}

/**
 * EditContactLogEventCommentState
 */
interface EditContactLogEventCommentState {
  text: string;
  date: Date;
  type: ContactTypes;
  locked: boolean;
}

/**
 * Editor for the contactLog entry comment
 */
class EditContactLogEventComment extends SessionStateComponent<
  EditContactLogEventCommentProps,
  EditContactLogEventCommentState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: EditContactLogEventCommentProps) {
    super(props, "contact-event-comment");
    this.state = this.getRecoverStoredState(
      {
        locked: false,
        date: new Date(this.props.comment.commentDate),
        text: this.props.comment.text,
      },
      props.comment.id + "-edit-comment"
    );
  }

  /**
   * onCKEditorChange handler
   * @param text text content
   */
  onCKEditorChange = (text: string): void => {
    this.setStateAndStore({ text }, this.props.comment.id + "-edit-comment");
  };

  /**
   * onDateChange handler
   * @param date Date
   */
  onDateChange = (date: Date): void => {
    this.setStateAndStore({ date: date }, this.props.comment.id);
  };
  /**
   * onTypeChange handler
   * @param e event
   */
  onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.setStateAndStore(
      { type: e.target.value as ContactTypes },
      this.props.comment.id + "-edit-comment"
    );
  };

  /**
   * clearUp
   */
  clearUp = (): void => {
    this.setStateAndClear(
      {
        locked: false,
        date: new Date(this.props.comment.commentDate),
        text: this.props.comment.text,
      },
      this.props.comment.id + "-edit-comment"
    );
  };

  /**
   * editContactEventComment
   */
  editContactEventComment = (): void => {
    this.setState({
      locked: true,
    });
    this.props.editContactLogEventComment(
      this.props.studentUserEntityId,
      this.props.comment.entry,
      this.props.comment.id,
      {
        creatorId: this.props.status.userId,
        text: this.state.text,
        commentDate: moment(this.state.date).format(),
      },

      /**
       * onSuccess
       */
      () => {
        this.setState({
          locked: false,
        });
        this.handleOnEditorClose();
      }
    );
  };

  /**
   * handleOnEditorClose
   */
  handleOnEditorClose = (): void => {
    this.props.closeEditor && this.props.closeEditor();
  };

  /**
   * render
   * @returns JSX.Element
   */
  render() {
    const editorTitle =
      this.props.i18n.text.get("plugin.discussion.answertomessage.topic") +
      " - " +
      this.props.i18n.text.get("plugin.discussion.createmessage.content");

    const content = (
      <div className="env-dialog__row env-dialog__row--ckeditor">
        <div className="env-dialog__form-element-container">
          <label className="env-dialog__label">
            {this.props.i18n.text.get(
              "plugin.discussion.createmessage.content"
            )}
          </label>
          <CKEditor
            editorTitle={editorTitle}
            autofocus
            onChange={this.onCKEditorChange}
          >
            {this.state.text}
          </CKEditor>
        </div>
      </div>
    );

    const footer = (
      <div className="env-dialog__actions">
        <Button
          buttonModifiers="dialog-execute"
          onClick={this.editContactEventComment}
          disabled={this.state.locked}
        >
          {this.props.i18n.text.get("plugin.discussion.createmessage.send")}
        </Button>
        <Button
          buttonModifiers="dialog-cancel"
          onClick={this.handleOnEditorClose}
          disabled={this.state.locked}
        >
          {this.props.i18n.text.get("plugin.discussion.createmessage.cancel")}
        </Button>
        {this.recovered ? (
          <Button
            buttonModifiers="dialog-clear"
            onClick={this.clearUp}
            disabled={this.state.locked}
          >
            {this.props.i18n.text.get(
              "plugin.discussion.createmessage.clearDraft"
            )}
          </Button>
        ) : null}
      </div>
    );

    return (
      <div className="env-dialog env-dialog--mainfunction env-dialog--reply-message">
        <section className="env-dialog__wrapper">
          <div className="env-dialog__content">
            <header className="env-dialog__header">
              {this.props.i18n.text.get(
                "plugin.guider.user.dialog.editContactLogComment.title"
              )}
            </header>
            <section className="env-dialog__body">{content}</section>
            <footer className="env-dialog__footer">{footer}</footer>
          </div>
        </section>
      </div>
    );
  }
}

/**
 * mapStateToProps
 * @param state state
 * @returns props from state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    status: state.status,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 * @returns dispatch function
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({ editContactLogEventComment }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContactLogEventComment);
