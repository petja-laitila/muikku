import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { i18nType } from "~/reducers/base/i18n";
import "~/sass/elements/empty.scss";
import "~/sass/elements/loaders.scss";
import "~/sass/elements/journal.scss";
import BodyScrollLoader from "~/components/general/body-scroll-loader";
import WorkspaceJournalsListItem from "./workspace-journals-list-item";
import { StateType } from "~/reducers";
import { StatusType } from "~/reducers/base/status";
import ApplicationList, {
  ApplicationListItem,
} from "~/components/general/application-list";
import { WorkspacesStateType, WorkspaceType } from "~/reducers/workspaces";
import { AnyActionType } from "~/actions";
import {
  LoadMoreCurrentWorkspaceJournalsFromServerTriggerType,
  loadMoreCurrentWorkspaceJournalsFromServer,
} from "~/actions/workspaces/journals";
import { JournalsState } from "~/reducers/workspaces/journals";

/**
 * WorkspaceJournalsProps
 */
interface WorkspaceJournalsListProps {
  i18n: i18nType;
  workspaceJournalsState: WorkspacesStateType;
  workspaceJournalsHasMore: boolean;
  loadMoreCurrentWorkspaceJournalsFromServer: LoadMoreCurrentWorkspaceJournalsFromServerTriggerType;
  workspace: WorkspaceType;
  journalsState: JournalsState;
  status: StatusType;
}

/**
 * WorkspaceJournalsState
 */
interface WorkspaceJournalsListState {}

/**
 * WorkspaceJournals
 */
class WorkspaceJournalsList extends BodyScrollLoader<
  WorkspaceJournalsListProps,
  WorkspaceJournalsListState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: WorkspaceJournalsListProps) {
    super(props);

    //once this is in state READY only then a loading more event can be triggered
    this.statePropertyLocation = "workspaceJournalsState";
    //it will only call the function if this is true
    this.hasMorePropertyLocation = "workspaceJournalsHasMore";
    //this is the function that will be called
    this.loadMoreTriggerFunctionLocation =
      "loadMoreCurrentWorkspaceJournalsFromServer";
  }

  /**
   * filterJournals
   * @returns filtered journals
   */
  filterJournals = () => {
    const { journals, filters } = this.props.journalsState;
    const { showMandatory, showOthers } = filters;

    // Return all if both filters are true or false
    if ((showMandatory && showOthers) || (!showMandatory && !showOthers)) {
      return journals;
    }

    // If only one of the other
    if (showMandatory) {
      return journals.filter((j) => j.isMaterialField);
    }
    if (showOthers) {
      return journals.filter((j) => !j.isMaterialField);
    }
  };

  /**
   * render
   */
  render() {
    if (
      !this.props.workspace ||
      !this.props.journalsState ||
      this.props.journalsState.state === "LOADING" ||
      (this.props.journalsState && this.props.journalsState.currentJournal)
    ) {
      return null;
    } else if (this.props.journalsState.state === "ERROR") {
      //TODO ERRORMSG: put a translation here please! this happens when messages fail to load, a notification shows with the error
      //message but here we got to put something
      return (
        <div className="empty">
          <span>{"ERROR"}</span>
        </div>
      );
    } else if (this.props.journalsState.journals.length === 0) {
      return (
        <div className="empty">
          <span>
            {this.props.status.isStudent
              ? this.props.i18n.text.get("plugin.workspace.journal.noEntries")
              : this.props.i18n.text.get(
                  "plugin.workspace.journal.studentHasNoEntries"
                )}
          </span>
        </div>
      );
    }

    const itemsToRender = this.filterJournals();

    return (
      <ApplicationList>
        {itemsToRender.map((journal) => (
          <WorkspaceJournalsListItem
            key={journal.id}
            journal={journal}
            showCommentList={false}
            asCurrent={false}
          />
        ))}
        {this.props.workspaceJournalsState === "LOADING_MORE" ? (
          <ApplicationListItem className="loader-empty" />
        ) : null}
      </ApplicationList>
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
    workspaceJournalsState: state.journals && state.journals.state,
    workspaceJournalsHasMore: state.journals && state.journals.hasMore,
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
    { loadMoreCurrentWorkspaceJournalsFromServer },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WorkspaceJournalsList);
