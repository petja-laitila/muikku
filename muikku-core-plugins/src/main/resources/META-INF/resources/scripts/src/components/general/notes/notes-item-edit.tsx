import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { bindActionCreators } from "redux";
import EnvironmentDialog from "~/components/general/environment-dialog";
import { AnyActionType } from "~/actions";
import { i18nType } from "~/reducers/base/i18n";
import { StateType } from "~/reducers";
import SessionStateComponent from "~/components/general/session-state-component";
import Button from "~/components/general/button";
import "~/sass/elements/form.scss";
import DatePicker from "react-datepicker";
import {
  NotesItemRead,
  NotesItemUpdate,
  NotesItemPriority,
} from "~/@types/notes";
import { outputCorrectDatePickerLocale } from "~/helper-functions/locale";
import "~/sass/elements/notes.scss";
import CKEditor from "../ckeditor";

/**
 * NotesItemEditProps
 */
interface NotesItemEditProps {
  selectedNotesItem?: NotesItemRead;
  children: React.ReactElement;
  i18n: i18nType;
  onNotesItemSaveUpdateClick?: (
    journalId: number,
    updatedNotesItem: NotesItemUpdate,
    onSuccess?: () => void
  ) => void;
}

/**
 * NotesItemEditState
 */
interface NotesItemEditState {
  notesItem: NotesItemUpdate;
  locked: boolean;
}

/**
 * NotesItemEdit
 */
class NotesItemEdit extends SessionStateComponent<
  NotesItemEditProps,
  NotesItemEditState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: NotesItemEditProps) {
    super(props, "records-notes-item-edit");

    this.clearUp = this.clearUp.bind(this);

    this.state = {
      locked: false,
      notesItem: props.selectedNotesItem,
    };
  }

  /**
   * clearUp
   */
  clearUp() {
    this.setState({
      notesItem: this.props.selectedNotesItem,
    });
  }

  /**
   * Handles save click
   * @param closeDialog closeDialog
   */
  handleUpdateClick = (closeDialog: () => void) => () => {
    this.props.onNotesItemSaveUpdateClick &&
      this.props.onNotesItemSaveUpdateClick(
        this.props.selectedNotesItem.id,
        this.state.notesItem,
        () => {
          this.clearUp();
          closeDialog();
        }
      );
  };

  /**
   * Handles notes item's change
   * @param key name of updated property
   * @param value of updated property
   */
  handleNotesItemChange = <T extends keyof NotesItemUpdate>(
    key: T,
    value: NotesItemUpdate[T]
  ) => {
    const updateNotesItem = { ...this.state.notesItem };

    updateNotesItem[key] = value;

    this.setState({
      notesItem: updateNotesItem,
    });
  };

  /**
   * render
   */
  render() {
    /**
     * content
     * @param closeDialog closeDialog
     */
    const content = (closeDialog: () => void) => [
      <div
        key="edit-note-1"
        className="env-dialog__row env-dialog__row--titles"
      >
        <div className="env-dialog__form-element-container">
          <label className="env-dialog__label">
            {this.props.i18n.text.get(
              "plugin.records.tasks.createEditnote.title.label"
            )}
          </label>
          <input
            className="env-dialog__input"
            type="text"
            onChange={(e) =>
              this.handleNotesItemChange("title", e.currentTarget.value)
            }
            value={this.state.notesItem.title}
          />
        </div>

        <div className="env-dialog__form-element-container">
          <label className="env-dialog__label">
            {this.props.i18n.text.get("plugin.records.tasks.priority.label")}
          </label>
          <select
            className="env-dialog__select"
            onChange={(e) =>
              this.handleNotesItemChange(
                "priority",
                e.target.value as NotesItemPriority
              )
            }
            value={this.state.notesItem.priority}
          >
            <option value={NotesItemPriority.HIGH}>
              {" "}
              {this.props.i18n.text.get(
                "plugin.records.tasks.priority.high.label"
              )}
            </option>
            <option value={NotesItemPriority.NORMAL}>
              {this.props.i18n.text.get(
                "plugin.records.tasks.priority.normal.label"
              )}
            </option>
            <option value={NotesItemPriority.LOW}>
              {this.props.i18n.text.get(
                "plugin.records.tasks.priority.low.label"
              )}
            </option>
          </select>
        </div>
      </div>,
      <div key="edit-note-2" className="env-dialog__row env-dialog__row--dates">
        <div className="env-dialog__form-element-container">
          <label className="env-dialog__label">
            {this.props.i18n.text.get(
              "plugin.records.tasks.createEditnote.startdate.label"
            )}
          </label>
          <DatePicker
            className="env-dialog__input"
            selected={
              this.state.notesItem.startDate !== null
                ? new Date(this.state.notesItem.startDate)
                : undefined
            }
            onChange={(date, e) =>
              this.handleNotesItemChange("startDate", date)
            }
            locale={outputCorrectDatePickerLocale(
              this.props.i18n.time.getLocale()
            )}
            dateFormat="P"
            minDate={new Date()}
            maxDate={this.state.notesItem.dueDate}
          />
        </div>
        <div className="env-dialog__form-element-container">
          <label className="env-dialog__label">
            {this.props.i18n.text.get(
              "plugin.records.tasks.createEditnote.enddate.label"
            )}
          </label>
          <DatePicker
            className="env-dialog__input"
            selected={
              this.state.notesItem.dueDate !== null
                ? new Date(this.state.notesItem.dueDate)
                : undefined
            }
            onChange={(date, e) => this.handleNotesItemChange("dueDate", date)}
            locale={outputCorrectDatePickerLocale(
              this.props.i18n.time.getLocale()
            )}
            dateFormat="P"
            minDate={
              this.state.notesItem.startDate !== null
                ? new Date(this.state.notesItem.startDate)
                : new Date()
            }
          />
        </div>
      </div>,
      <div key="edit-note-3" className="env-dialog__row">
        <div className="env-dialog__form-element-container">
          <label className="env-dialog__label">
            {this.props.i18n.text.get(
              "plugin.records.tasks.createEditnote.content.label"
            )}
          </label>
          <CKEditor
            onChange={(e) => this.handleNotesItemChange("description", e)}
          >
            {this.state.notesItem.description}
          </CKEditor>
        </div>
      </div>,
    ];
    /**
     * footer
     * @param closeDialog closeDialog
     */
    const footer = (closeDialog: () => void) => (
      <div className="env-dialog__actions">
        <Button
          buttonModifiers={["dialog-execute"]}
          onClick={this.handleUpdateClick(closeDialog)}
        >
          {this.props.i18n.text.get("plugin.records.tasks.send")}
        </Button>
        <Button buttonModifiers={["dialog-cancel"]} onClick={closeDialog}>
          {this.props.i18n.text.get("plugin.records.tasks.cancel")}
        </Button>
      </div>
    );

    return (
      <EnvironmentDialog
        modifier="modify-message"
        title={this.props.i18n.text.get("plugin.records.tasks.editnote.topic")}
        content={content}
        footer={footer}
        onOpen={this.clearUp}
      >
        {this.props.children}
      </EnvironmentDialog>
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
  return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(NotesItemEdit);
