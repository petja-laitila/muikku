import * as React from "react";
import { connect, Dispatch } from "react-redux";
import Link from "~/components/general/link";
import Dialog from "~/components/general/dialog";
import { AnyActionType } from "~/actions";
import { i18nType } from "~/reducers/base/i18n";

import "~/sass/elements/link.scss";
import "~/sass/elements/form-elements.scss";
import "~/sass/elements/form.scss";

import "~/sass/elements/buttons.scss";
import { StateType } from "~/reducers";
import Button from "~/components/general/button";
import {
  signupIntoWorkspace,
  SignupIntoWorkspaceTriggerType,
} from "~/actions/workspaces";
import { bindActionCreators } from "redux";
import { WorkspaceSignUpDetails, WorkspaceType } from "~/reducers/workspaces";

/**
 * WorkspaceSignupDialogProps
 */
interface WorkspaceSignupDialogProps {
  i18n: i18nType;
  children?: React.ReactElement<any>;
  isOpen?: boolean;
  onClose?: () => void;
  workspaceSignUpDetails?: WorkspaceSignUpDetails;
  currentWorkspace: WorkspaceType;
  signupIntoWorkspace: SignupIntoWorkspaceTriggerType;
}

/**
 * WorkspaceSignupDialogState
 */
interface WorkspaceSignupDialogState {
  locked: boolean;
  message: string;
}

/**
 * WorkspaceSignupDialog
 */
class WorkspaceSignupDialog extends React.Component<
  WorkspaceSignupDialogProps,
  WorkspaceSignupDialogState
> {
  /**
   * constructor
   * @param props
   */
  constructor(props: WorkspaceSignupDialogProps) {
    super(props);
    this.state = {
      locked: false,
      message: "",
    };

    this.updateMessage = this.updateMessage.bind(this);
    this.signup = this.signup.bind(this);
  }

  /**
   * updateMessage
   * @param e
   */
  updateMessage(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({ message: e.target.value });
  }

  /**
   * signup
   * @param closeDialog
   */
  signup(closeDialog: () => any) {
    this.setState({ locked: true });
    const workspaceSignUpDetails =
      this.props.workspaceSignUpDetails || this.props.currentWorkspace;

    this.props.signupIntoWorkspace({
      workspace: {
        id: workspaceSignUpDetails.id,
        name: workspaceSignUpDetails.name,
        nameExtension: workspaceSignUpDetails.nameExtension,
        urlName: workspaceSignUpDetails.urlName,
      },
      success: () => {
        this.setState({ locked: false, message: "" });
        closeDialog();
      },
      fail: () => {
        this.setState({ locked: false });
      },
      message: this.state.message,
    });
  }

  /**
   * Component render method
   * @returns JSX.Element
   */
  render() {
    const workspaceSignUpDetails =
      this.props.workspaceSignUpDetails || this.props.currentWorkspace;

    const hasFees = JSON.parse(
      document
        .querySelector('meta[name="muikku:hasFees"]')
        .getAttribute("value")
    );

    let content = (closeDialog: () => any) => (
      <div>
        <div>
          <div className="dialog__content-row">
            {this.props.i18n.text.get(
              "plugin.workspaceSignUp.courseDescription",
              workspaceSignUpDetails.name,
              workspaceSignUpDetails.nameExtension || ""
            )}
          </div>
          {hasFees ? (
            <div className="form-element dialog__content-row">
              <p>
                <label>
                  {this.props.i18n.text.get("plugin.workspaceSignUp.fee.label")}
                </label>
              </p>
              <p>
                {this.props.i18n.text.get("plugin.workspaceSignUp.fee.content")}
              </p>
            </div>
          ) : null}
          <div className="form-element dialog__content-row">
            <p>
              <label htmlFor="signUpMessage">
                {this.props.i18n.text.get(
                  "plugin.workspaceSignUp.messageLabel"
                )}
              </label>
              <textarea
                id="signUpMessage"
                className="form-element__textarea"
                value={this.state.message}
                onChange={this.updateMessage}
              />
            </p>
          </div>
        </div>
      </div>
    );

    let footer = (closeDialog: () => any) => {
      return (
        <div className="dialog__button-set">
          <Button
            buttonModifiers={["standard-ok", "info"]}
            onClick={this.signup.bind(this, closeDialog)}
            disabled={this.state.locked}
          >
            {this.props.i18n.text.get(
              "plugin.workspaceSignUp.signupButtonLabel"
            )}
          </Button>
        </div>
      );
    };

    return (
      <Dialog
        modifier="workspace-signup-dialog"
        title={this.props.i18n.text.get("plugin.workspaceSignUp.title")}
        content={content}
        footer={footer}
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
      >
        {this.props.children}
      </Dialog>
    );
  }
}

function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    currentWorkspace: state.workspaces.currentWorkspace,
  };
}

function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({ signupIntoWorkspace }, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceSignupDialog);
