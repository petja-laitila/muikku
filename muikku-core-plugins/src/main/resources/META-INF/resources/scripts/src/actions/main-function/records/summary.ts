import actions from "../../base/notifications";
import promisify from "~/util/promisify";
import mApi, { MApiError } from "~/lib/mApi";
import { AnyActionType, SpecificActionType } from "~/actions";
import {
  SummarStudentDetails,
  SummaryDataType,
  SummaryStatusType,
} from "~/reducers/main-function/records/summary";
import {
  WorkspaceForumStatisticsType,
  ActivityLogType,
  WorkspaceActivityType,
  WorkspaceType,
} from "~/reducers/workspaces";
import { StateType } from "~/reducers";
import { GuiderUserGroupListType } from "~/reducers/main-function/guider";

export type UPDATE_STUDIES_SUMMARY = SpecificActionType<
  "UPDATE_STUDIES_SUMMARY",
  SummaryDataType
>;
export type UPDATE_STUDIES_SUMMARY_STATUS = SpecificActionType<
  "UPDATE_STUDIES_SUMMARY_STATUS",
  SummaryStatusType
>;
/**
 * UpdateSummaryTriggerType
 */
export interface UpdateSummaryTriggerType {
  (): AnyActionType;
}

/**
 * UpdateSummaryTriggerType
 */
const updateSummary: UpdateSummaryTriggerType = function updateSummary() {
  return async (
    dispatch: (arg: AnyActionType) => any,
    getState: () => StateType
  ) => {
    try {
      dispatch({
        type: "UPDATE_STUDIES_SUMMARY_STATUS",
        payload: <SummaryStatusType>"LOADING",
      });

      /* Get user id */
      const pyramusId = getState().status.userSchoolDataIdentifier;

      /* We need completed courses from Eligibility */
      const eligibility: any = await promisify(
        mApi().records.studentMatriculationEligibility.read(pyramusId),
        "callback"
      )();

      /* We need past month activity */
      const activityLogs: any = await promisify(
        mApi().activitylogs.user.read(pyramusId, {
          from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
          to: new Date(),
        }),
        "callback"
      )();

      /* We need returned exercises and evaluated courses */
      const assignmentsDone: Record<string, unknown>[] = [];
      const coursesDone: Record<string, unknown>[] = [];

      /* Student's study time */
      const studentsDetails = <SummarStudentDetails>(
        await promisify(mApi().user.students.read(pyramusId), "callback")()
      );

      /* Getting past the object with keys */
      const activityArrays: Record<string, unknown>[] = Object.keys(
        activityLogs
      ).map((key) => activityLogs[key]);

      /* Picking the done exercises and evaluated courses from the objects */
      activityArrays.forEach((element: any) => {
        element.find(function (param: any) {
          param["type"] == "MATERIAL_ASSIGNMENTDONE"
            ? assignmentsDone.push(param["type"])
            : param["type"] == "EVALUATION_GOTPASSED"
            ? coursesDone.push(param["type"])
            : null;
        });
      });

      /* User workspaces */
      const workspaces = <WorkspaceType[]>await promisify(
        mApi().workspace.workspaces.read({
          userIdentifier: pyramusId,
          includeInactiveWorkspaces: true,
        }),
        "callback"
      )();

      if (workspaces && workspaces.length) {
        await Promise.all([
          Promise.all(
            workspaces.map(async (workspace, index) => {
              const activity = <WorkspaceActivityType>(
                await promisify(
                  mApi().evaluation.workspaces.students.activity.read(
                    workspace.id,
                    pyramusId
                  ),
                  "callback"
                )()
              );
              workspaces[index].activity = activity;
            })
          ),
          Promise.all(
            workspaces.map(async (workspace, index) => {
              const statistics: WorkspaceForumStatisticsType = <
                WorkspaceForumStatisticsType
              >await promisify(
                mApi().workspace.workspaces.forumStatistics.read(workspace.id, {
                  userIdentifier: pyramusId,
                }),
                "callback"
              )();
              workspaces[index].forumStatistics = statistics;
            })
          ),
          Promise.all(
            workspaces.map(async (workspace, index) => {
              const courseActivity: ActivityLogType[] = <ActivityLogType[]>(
                await promisify(
                  mApi().activitylogs.user.workspace.read(pyramusId, {
                    workspaceEntityId: workspace.id,
                    from: new Date(new Date().getFullYear() - 2, 0),
                    to: new Date(),
                  }),
                  "callback"
                )()
              );
              workspaces[index].activityLogs = courseActivity;
            })
          ),
        ]);
      }

      const graphData = {
        activity: activityLogs.general,
        workspaces: workspaces,
      };

      /* Does have matriculation examination in goals? */
      const summaryData: SummaryDataType = {
        eligibilityStatus: eligibility.coursesCompleted,
        activity: activityLogs.general.length,
        returnedExercises: assignmentsDone.length,
        coursesDone: coursesDone.length,
        graphData: graphData,
        studentsDetails: studentsDetails,
      };

      dispatch({
        type: "UPDATE_STUDIES_SUMMARY",
        payload: summaryData,
      });

      dispatch({
        type: "UPDATE_STUDIES_SUMMARY_STATUS",
        payload: <SummaryStatusType>"READY",
      });
    } catch (err) {
      if (!(err instanceof MApiError)) {
        throw err;
      }
      dispatch(
        actions.displayNotification(
          getState().i18n.text.get(
            "plugin.records.summary.errormessage.summaryUpdateFailed"
          ),
          "error"
        )
      );
    }
  };
};

export default { updateSummary };
export { updateSummary };
