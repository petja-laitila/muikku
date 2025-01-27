import * as React from "react";
import { connect, Dispatch } from "react-redux";
import ApplicationPanel from "~/components/general/application-panel/application-panel";
import HoverButton from "~/components/general/hover-button";
import Toolbar from "./application/workspace-journals-toolbar";
import WorkspaceJournalsList from "./application/workspace-journals-list";
import { i18nType } from "~/reducers/base/i18n";
import "~/sass/elements/link.scss";
import "~/sass/elements/form.scss";
import "~/sass/elements/wcag.scss";
import "~/sass/elements/react-select-override.scss";
import { StateType } from "~/reducers";
import { WorkspaceType } from "~/reducers/workspaces";
import { StatusType } from "~/reducers/base/status";
import { getName } from "~/util/modifiers";
import Button from "~/components/general/button";
import { bindActionCreators } from "redux";
import NewJournal from "~/components/workspace/workspaceJournal/dialogs/new-edit-journal";
import { AnyActionType } from "~/actions";
import {
  LoadCurrentWorkspaceJournalsFromServerTriggerType,
  loadCurrentWorkspaceJournalsFromServer,
} from "~/actions/workspaces/journals";
import WorkspaceJournalView from "./application/workspace-journal-view";
import { JournalsState } from "~/reducers/workspaces/journals";
import { OptionDefault } from "~/components/general/react-select/types";
import { ShortWorkspaceUserWithActiveStatusType } from "~/reducers/user-index";
import Select from "react-select";

type JournalStudentFilterOption = OptionDefault<
  ShortWorkspaceUserWithActiveStatusType | string
>;
import WorkspaceJournalFeedback from "./application/workspace-journal-feedback";

/**
 * WorkspaceJournalApplicationProps
 */
interface WorkspaceJournalApplicationProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  aside?: React.ReactElement<any>;
  i18n: i18nType;
  workspace: WorkspaceType;
  journalsState: JournalsState;
  status: StatusType;
  loadCurrentWorkspaceJournalsFromServer: LoadCurrentWorkspaceJournalsFromServerTriggerType;
}

/**
 * WorkspaceJournalApplicationState
 */
interface WorkspaceJournalApplicationState {}

/**
 * WorkspaceJournalApplication
 */
class WorkspaceJournalApplication extends React.Component<
  WorkspaceJournalApplicationProps,
  WorkspaceJournalApplicationState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: WorkspaceJournalApplicationProps) {
    super(props);

    this.handleWorkspaceJournalFilterChange =
      this.handleWorkspaceJournalFilterChange.bind(this);
  }

  /**
   * Handles workspace journal filter change
   * @param selectedOption selectedOption which can be either a string or a ShortWorkspaceUserWithActiveStatusType
   */
  handleWorkspaceJournalFilterChange(
    selectedOption: JournalStudentFilterOption
  ) {
    const newValue =
      typeof selectedOption.value === "string"
        ? null
        : selectedOption.value.userEntityId;
    this.props.loadCurrentWorkspaceJournalsFromServer(newValue);
  }

  /**
   * render
   */
  render() {
    const title = this.props.i18n.text.get(
      "plugin.workspace.journal.pageTitle"
    );
    const toolbar = <Toolbar />;

    let primaryOption = (
      <NewJournal>
        <Button buttonModifiers="primary-function">
          {this.props.i18n.text.get(
            "plugin.workspace.journal.newEntryButton.label"
          )}
        </Button>
      </NewJournal>
    );

    if (
      this.props.workspace &&
      !this.props.status.isStudent &&
      this.props.journalsState &&
      this.props.workspace.students
    ) {
      const studentFilterOptions = (this.props.workspace.students.results || [])
        .filter(
          (student, index, array) =>
            array.findIndex(
              (otherStudent) =>
                otherStudent.userEntityId === student.userEntityId
            ) === index
        )
        .filter((student) => student.active)
        .map(
          (student) =>
            ({
              value: student,
              label: getName(student, true),
            } as JournalStudentFilterOption)
        );

      const allOptions = [
        {
          value: "",
          label: this.props.i18n.text.get(
            "plugin.workspace.journal.studentFilter.showAll"
          ),
        } as JournalStudentFilterOption,
        ...studentFilterOptions,
      ];

      const selectedOption = allOptions.find((option) => {
        const valueToFind = this.props.journalsState.userEntityId || "";

        if (typeof option.value === "string") {
          return option.value === valueToFind;
        } else {
          return option.value.userEntityId === valueToFind;
        }
      });

      primaryOption = (
        <div className="form-element form-element--main-action">
          <label htmlFor="selectJournal" className="visually-hidden">
            {this.props.i18n.text.get("plugin.wcag.journalSelect.label")}
          </label>
          <Select
            className="react-select-override"
            classNamePrefix="react-select-override"
            id="selectJournal"
            options={allOptions}
            value={selectedOption}
            onChange={this.handleWorkspaceJournalFilterChange}
            styles={{
              // eslint-disable-next-line jsdoc/require-jsdoc
              container: (baseStyles, state) => ({
                ...baseStyles,
                width: "100%",
              }),
            }}
          />
        </div>
      );
    }

    return (
      <>
        <ApplicationPanel
          asideBefore={this.props.aside}
          toolbar={toolbar}
          title={title}
          primaryOption={primaryOption}
        >
          <WorkspaceJournalView />

          {this.props.journalsState.journalFeedback && (
            <WorkspaceJournalFeedback
              i18n={this.props.i18n}
              journalFeedback={this.props.journalsState.journalFeedback}
            />
          )}

          <WorkspaceJournalsList />
        </ApplicationPanel>
        {this.props.status.isStudent ? (
          <NewJournal>
            <HoverButton icon="plus" modifier="new-message" />
          </NewJournal>
        ) : null}
      </>
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
    journalsState: state.journals,
    status: state.status,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators(
    { loadCurrentWorkspaceJournalsFromServer },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceJournalApplication);
