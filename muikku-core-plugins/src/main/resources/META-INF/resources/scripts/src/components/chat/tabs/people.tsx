import * as React from "react";
import "~/sass/elements/chat.scss";
import { IChatContact } from "../chat";
import PromptDialog, {
  PromptDialogButtons,
} from "~/components/general/prompt-dialog";
import { handleRosterDelete } from "~/helper-functions/chat";
import { connect } from "react-redux";
import { StateType } from "~/reducers";
import { i18nType } from "~/reducers/base/i18n";

/**
 * IPeopleProps
 */
interface IPeopleProps {
  i18n: i18nType;
  modifier?: string;
  person: IChatContact;
  /** If this person is removable from the roster */
  removable?: boolean;
  /** Removable needs connection */
  connection?: Strophe.Connection;
  removePerson?: () => void;
  toggleJoinLeavePrivateChatRoom: () => void;
}

/**
 * IPeopleState
 */
interface IPeopleState {}

/**
 * People
 */
class People extends React.Component<IPeopleProps, IPeopleState> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: IPeopleProps) {
    super(props);
  }

  /**
   * handleRemove handles the removing the person from the roster
   */
  handleRemove = () => {
    handleRosterDelete(this.props.person.jid, this.props.connection);
    this.props.removePerson && this.props.removePerson();
  };

  /**
   * render
   */
  render() {
    const personModifier = this.props.modifier
      ? "chat__controlbox-person--" + this.props.modifier
      : "";
    const name = this.props.person.name
      ? this.props.person.name
      : this.props.person.nick
      ? this.props.person.nick
      : this.props.person.jid;

    const buttons: PromptDialogButtons = {
      execute: this.props.i18n.text.get(
        "plugin.chat.people.delete.prompt.execute"
      ),
      cancel: this.props.i18n.text.get(
        "plugin.chat.people.delete.prompt.cancel"
      ),
    };
    return (
      <div className={`chat__controlbox-person ${personModifier}`}>
        <div
          className="chat__controlbox-person-name"
          onClick={this.props.toggleJoinLeavePrivateChatRoom}
        >
          {name}
        </div>
        {this.props.removable ? (
          <PromptDialog
            title={this.props.i18n.text.get(
              "plugin.chat.people.delete.prompt.title"
            )}
            content={this.props.i18n.text.get(
              "plugin.chat.people.delete.prompt.content"
            )}
            modifier="chat-control-box"
            onExecute={this.handleRemove}
            buttonLocales={buttons}
          >
            <div className="chat__controlbox-action chat__controlbox-action--remove-user icon-trash"></div>
          </PromptDialog>
        ) : null}
      </div>
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

export default connect(mapStateToProps)(People);
