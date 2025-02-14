import { i18nType } from "~/reducers/base/i18n";
import * as React from "react";
import { Dispatch, connect } from "react-redux";
import { AnyActionType } from "~/actions";
import { bindActionCreators } from "redux";
import CKEditor from "~/components/general/ckeditor";
import {
  editContactLogEvent,
  EditContactLogEventTriggerType,
} from "~/actions/main-function/guider";
import {
  ContactTypes,
  contactTypesArray,
} from "~/reducers/main-function/guider";
import { StateType } from "~/reducers";
import SessionStateComponent from "~/components/general/session-state-component";
import Button from "~/components/general/button";
import DatePicker from "react-datepicker";
import { outputCorrectDatePickerLocale } from "~/helper-functions/locale";
import * as moment from "moment";
import { StatusType } from "~/reducers/base/status";
import { ContactLogEvent } from "~/reducers/main-function/guider";

/**
 * TODO: maybe make this more generic,
 * since there is need for this kind of a reply outside discussion,
 * for example in the communicator and the guider
 */

/**
 * ReplyThreadDrawerProps
 */
interface EditContactLogEventProps {
  i18n: i18nType;
  status: StatusType;
  contactEvent: ContactLogEvent;
  studentUserEntityId: number;
  editContactLogEvent: EditContactLogEventTriggerType;
  closeEditor: () => void;
}

/**
 * EditContactLogEventEventState
 */
interface EditContactLogEventState {
  text: string;
  date: Date;
  type: ContactTypes;
  locked: boolean;
}

/**
 * EditContactLogEventEvent
 */
class EditContactLogEventEvent extends SessionStateComponent<
  EditContactLogEventProps,
  EditContactLogEventState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: EditContactLogEventProps) {
    super(props, "contact-event-comment");

    this.state = this.getRecoverStoredState(
      {
        locked: false,
        date: props.i18n.time
          .getLocalizedMoment(this.props.contactEvent.entryDate)
          .toDate(),
        text: this.props.contactEvent.text,
        type: this.props.contactEvent.type,
      },
      props.contactEvent.id + "-edit-contact-event"
    );
  }

  /**
   * onCKEditorChange
   * @param text text
   */
  onCKEditorChange = (text: string) => {
    this.setStateAndStore(
      { text },
      this.props.contactEvent.id + "-edit-contact-event"
    );
  };

  /**
   * onDateChange
   * @param date a Date
   */
  onDateChange = (date: Date) => {
    this.setStateAndStore({ date: date }, this.props.contactEvent.id);
  };

  /**
   * onTypeChange
   * @param e event
   */
  onTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setStateAndStore(
      { type: e.target.value as ContactTypes },
      this.props.contactEvent.id + "-edit-contact-event"
    );
  };

  /**
   * clearUp
   */
  clearUp = () => {
    this.setStateAndClear(
      {
        date: this.props.i18n.time
          .getLocalizedMoment(this.props.contactEvent.entryDate)
          .toDate(),
        text: this.props.contactEvent.text,
        type: this.props.contactEvent.type,
      },
      this.props.contactEvent.id + "-edit-contact-event"
    );
  };

  /**
   * editContactEvent
   */
  editContactEvent = () => {
    this.setState({
      locked: true,
    });
    this.props.editContactLogEvent(
      this.props.studentUserEntityId,
      this.props.contactEvent.id,
      /**
       * payload
       */
      {
        creatorId: this.props.status.userId,
        text: this.state.text,
        entryDate: moment(this.state.date).format(),
        type: this.state.type,
      },
      /**
       * onSuccess
       */
      () => {
        this.setState({
          locked: false,
        });
        this.handleOnEditorClose();
        this.clearUp();
      }
    );
  };

  /**
   * handleCloseEditor
   */
  handleOnEditorClose = () => {
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
      <>
        <div className="env-dialog__row env-dialog__row--new-contact-event">
          <div className="env-dialog__form-element-container env-dialog__form-element-container--new-contact-event">
            <label htmlFor="contactEventdate" className="env-dialog__label">
              {this.props.i18n.text.get(
                "plugin.guider.user.dialog.createContactEvent.date"
              )}
            </label>
            <DatePicker
              className="env-dialog__input"
              id="contactEventdate"
              onChange={this.onDateChange}
              locale={outputCorrectDatePickerLocale(
                this.props.i18n.time.getLocale()
              )}
              dateFormat="P"
              selected={this.state.date}
            ></DatePicker>
          </div>
          <div className="env-dialog__form-element-container">
            <label htmlFor="contactEventTypes" className="env-dialog__label">
              {this.props.i18n.text.get(
                "plugin.guider.user.dialog.createContactEvent.type"
              )}
            </label>
            <select
              id="contactEventTypes"
              className="env-dialog__select"
              onChange={this.onTypeChange}
              value={this.state.type}
            >
              {contactTypesArray.map((contactType) => (
                <option key={contactType} value={contactType}>
                  {this.props.i18n.text.get(
                    "plugin.guider.contact.type." + contactType
                  )}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="env-dialog__row"></div>
        <div className="env-dialog__row env-dialog__row--ckeditor">
          <div className="env-dialog__form-element-container">
            <label className="env-dialog__label">
              {this.props.i18n.text.get(
                "plugin.guider.user.dialog.createContactEvent.text"
              )}
            </label>
            <CKEditor
              editorTitle={editorTitle}
              onChange={this.onCKEditorChange}
            >
              {this.state.text}
            </CKEditor>
          </div>
        </div>
      </>
    );

    const footer = (
      <div className="env-dialog__actions">
        <Button
          buttonModifiers="dialog-execute"
          onClick={this.editContactEvent}
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
                "plugin.guider.user.dialog.editContactLog.title"
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
 * @returns dispatch functions
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({ editContactLogEvent }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(EditContactLogEventEvent);
