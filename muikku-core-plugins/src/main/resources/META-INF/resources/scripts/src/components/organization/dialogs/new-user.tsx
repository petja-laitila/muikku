import * as React from "react";
import { connect, Dispatch } from "react-redux";
import Dialog, { DialogRow } from "~/components/general/dialog";
import {
  FormActionsElement,
  EmailFormElement,
  InputFormElement,
  SSNFormElement,
  SelectFormElement,
} from "~/components/general/form-element";
import {
  createStudent,
  createStaffmember,
  CreateStaffmemberTriggerType,
  CreateStudentTriggerType,
} from "~/actions/main-function/users";
import { i18nType } from "~/reducers/base/i18n";
import { StateType } from "~/reducers";
import { StatusType } from "~/reducers/base/status";
import { bindActionCreators } from "redux";
import { StudyprogrammeTypes } from "~/reducers/main-function/users";
import { CreateUserType } from "~/reducers/user-index";

/**
 * OrganizationUserProps
 */
interface OrganizationUserProps {
  children?: React.ReactElement<any>;
  i18n: i18nType;
  status: StatusType;
  data?: CreateUserType;
  studyprogrammes: StudyprogrammeTypes;
  createStudent: CreateStudentTriggerType;
  createStaffmember: CreateStaffmemberTriggerType;
}

/**
 * OrganizationUserState
 */
interface OrganizationUserState {
  user: {
    [field: string]: string;
  };
  locked: boolean;
  executing: boolean;
  firstNameValid: number;
  lastNameValid: number;
  emailValid: number;
  studyProgrammeIdentifierValid: number;
}

/**
 * OrganizationUser
 */
class OrganizationUser extends React.Component<
  OrganizationUserProps,
  OrganizationUserState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: OrganizationUserProps) {
    super(props);
    this.state = {
      user: {
        role: "STUDENT",
      },
      locked: false,
      executing: false,
      firstNameValid: 2,
      lastNameValid: 2,
      emailValid: 2,
      studyProgrammeIdentifierValid: 2,
    };
    this.updateField = this.updateField.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.clearComponentState = this.clearComponentState.bind(this);
  }

  /**
   * updateField
   * @param value value
   * @param valid valid
   * @param name name
   */
  updateField(value: string, valid: boolean, name: string) {
    const fieldName = name;
    const fieldValue = valid ? value : "";
    const newState = Object.assign(this.state.user, {
      [fieldName]: fieldValue,
    });
    this.setState({ user: newState });
  }

  /**
   * clearComponentState
   */
  clearComponentState() {
    this.setState({
      user: {
        role: "STUDENT",
        studyProgrammeIdentifier: this.props.studyprogrammes.list[0].identifier,
      },
      firstNameValid: 2,
      lastNameValid: 2,
      emailValid: 2,
      studyProgrammeIdentifierValid: 2,
      locked: false,
      executing: false,
    });
  }

  /**
   * cancelDialog
   * @param closeDialog closeDialog
   */
  cancelDialog(closeDialog: () => any) {
    closeDialog();
  }

  /**
   * saveUser
   * @param closeDialog closeDialog
   */
  saveUser(closeDialog: () => any) {
    let valid = true;

    if (
      this.state.user.firstName == "" ||
      this.state.user.firstName == undefined
    ) {
      this.setState({ firstNameValid: 0 });
      valid = false;
    }

    if (
      this.state.user.lastName == "" ||
      this.state.user.lastName == undefined
    ) {
      this.setState({ lastNameValid: 0 });
      valid = false;
    }

    if (this.state.user.email == "" || this.state.user.email == undefined) {
      this.setState({ emailValid: 0 });
      valid = false;
    }

    if (this.state.user.role == "STUDENT") {
      if (
        this.state.user.studyProgrammeIdentifier == "" ||
        this.state.user.studyProgrammeIdentifier == undefined
      ) {
        this.setState({ studyProgrammeIdentifierValid: 0 });
        valid = false;
      }

      // SSN for user is optional at this point, so we don't validate. Only we do is set it to "" if it's not a valid SSN

      if (valid) {
        this.setState({
          locked: true,
          executing: true,
        });

        const data = {
          firstName: this.state.user.firstName,
          lastName: this.state.user.lastName,
          email: this.state.user.email,
          ssn: this.state.user.ssn ? this.state.user.ssn : "",
          studyProgrammeIdentifier: this.state.user.studyProgrammeIdentifier,
        };

        this.props.createStudent({
          student: data,
          /**
           * success
           */
          success: () => {
            closeDialog();
          },
          /**
           * fail
           */
          fail: () => {
            closeDialog();
          },
        });
      }
    } else {
      if (valid) {
        this.setState({
          locked: true,
          executing: true,
        });

        const data = {
          firstName: this.state.user.firstName,
          lastName: this.state.user.lastName,
          email: this.state.user.email,
          role: this.state.user.role,
        };

        this.props.createStaffmember({
          staffmember: data,
          /**
           * success
           */
          success: () => {
            this.setState({
              user: { role: "STUDENT" },
              firstNameValid: 2,
              lastNameValid: 2,
              emailValid: 2,
              studyProgrammeIdentifierValid: 2,
            });
            closeDialog();
          },
          /**
           * fail
           */
          fail: () => {
            closeDialog();
          },
        });
      }
    }
  }

  /**
   * render
   */
  render() {
    /**
     * content
     * @param closeDialog closeDialog
     */
    const content = (closeDialog: () => any) => (
      <div>
        <DialogRow modifiers="new-user">
          <SelectFormElement
            id="userRole"
            name="role"
            modifiers="new-user"
            label={this.props.i18n.text.get(
              "plugin.organization.users.addUser.label.role"
            )}
            updateField={this.updateField}
          >
            <option value="STUDENT">
              {this.props.i18n.text.get(
                "plugin.organization.users.role.STUDENT"
              )}
            </option>
            <option value="MANAGER">
              {this.props.i18n.text.get(
                "plugin.organization.users.role.MANAGER"
              )}
            </option>
            <option value="TEACHER">
              {this.props.i18n.text.get(
                "plugin.organization.users.role.TEACHER"
              )}
            </option>
          </SelectFormElement>
        </DialogRow>
        <DialogRow modifiers="new-user">
          <InputFormElement
            id="userFirstName"
            value={this.state.user.firstName}
            name="firstName"
            modifiers="new-user"
            valid={this.state.firstNameValid}
            mandatory={true}
            label={this.props.i18n.text.get(
              "plugin.organization.users.addUser.label.firstName"
            )}
            updateField={this.updateField}
          />
          <InputFormElement
            id="userLastName"
            value={this.state.user.lastName}
            name="lastName"
            modifiers="new-user"
            valid={this.state.lastNameValid}
            mandatory={true}
            label={this.props.i18n.text.get(
              "plugin.organization.users.addUser.label.lastName"
            )}
            updateField={this.updateField}
          />
        </DialogRow>
        <DialogRow modifiers="new-user">
          <EmailFormElement
            value={this.state.user.email}
            modifiers={["new-user", "new-user-email"]}
            valid={this.state.emailValid}
            mandatory={true}
            updateField={this.updateField}
            label={this.props.i18n.text.get(
              "plugin.organization.users.addUser.label.email"
            )}
          />
        </DialogRow>
        {this.state.user.role == "STUDENT" ? (
          <>
            <DialogRow modifiers="new-user">
              <SSNFormElement
                modifiers="new-user"
                label={this.props.i18n.text.get(
                  "plugin.organization.users.addUser.label.SSN"
                )}
                updateField={this.updateField}
              />
            </DialogRow>
            <DialogRow modifiers="new-user">
              <SelectFormElement
                id="studyProgramme"
                valid={this.state.studyProgrammeIdentifierValid}
                mandatory={true}
                name="studyProgrammeIdentifier"
                modifiers="new-user"
                label={this.props.i18n.text.get(
                  "plugin.organization.users.addUser.label.studyprogramme"
                )}
                updateField={this.updateField}
              >
                {this.props.studyprogrammes &&
                  this.props.studyprogrammes.list.map((studyprogramme) => (
                    <option
                      key={studyprogramme.identifier}
                      value={studyprogramme.identifier}
                    >
                      {studyprogramme.name}
                    </option>
                  ))}
              </SelectFormElement>
            </DialogRow>
          </>
        ) : null}
      </div>
    );

    /**
     * footer
     * @param closePortal closePortal
     */
    const footer = (closePortal: () => any) => (
      <FormActionsElement
        locked={this.state.locked}
        executeLabel={this.props.i18n.text.get(
          "plugin.organization.users.addUser.execute"
        )}
        cancelLabel={this.props.i18n.text.get(
          "plugin.organization.users.addUser.cancel"
        )}
        executeClick={this.saveUser.bind(this, closePortal)}
        cancelClick={this.cancelDialog.bind(this, closePortal)}
      />
    );

    return (
      <Dialog
        onClose={this.clearComponentState}
        executing={this.state.executing}
        modifier="new-user"
        title={this.props.i18n.text.get(
          "plugin.organization.users.addUser.title"
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
    status: state.status,
    studyprogrammes: state.studyprogrammes,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators({ createStudent, createStaffmember }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(OrganizationUser);
