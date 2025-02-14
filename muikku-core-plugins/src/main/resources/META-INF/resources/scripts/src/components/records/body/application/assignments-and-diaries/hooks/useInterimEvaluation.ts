import * as React from "react";
import mApi from "~/lib/mApi";
import promisify from "~/util/promisify";
import { DisplayNotificationTriggerType } from "~/actions/base/notifications";
import {
  MaterialAssignmentType,
  MaterialContentNodeType,
} from "~/reducers/workspaces";
import { AssignmentsTabType } from "../assignments-and-diaries";
import { i18nType } from "~/reducers/base/i18n";

/**
 * UseFollowUpGoalsState
 */
export interface UseInterimEvaluationState {
  isLoading: boolean;
  interimEvaluationAssignments: MaterialContentNodeType[];
}

/**
 * Intial state
 */
const initialState: UseInterimEvaluationState = {
  isLoading: false,
  interimEvaluationAssignments: [],
};

/**
 * Custom hook for student study hours
 *
 * @param workspaceId workspaceId
 * @param tabOpen tabOpen
 * @param i18n i18nType
 * @param displayNotification displayNotification
 * @returns student study hours
 */
export const useInterimEvaluationAssigments = (
  workspaceId: number,
  tabOpen: AssignmentsTabType,
  i18n: i18nType,
  displayNotification: DisplayNotificationTriggerType
) => {
  const [
    interimEvaluationeAssignmentsData,
    setInterimEvaluationAssignmentsData,
  ] = React.useState(initialState);

  React.useEffect(() => {
    let isCancelled = false;

    /**
     * loadExercisenData
     * Loads student activity data
     * @param workspaceId of student
     */
    const loadInterimEvaluationData = async (workspaceId: number) => {
      if (!isCancelled) {
        setInterimEvaluationAssignmentsData(
          (interimEvaluationeAssignmentsData) => ({
            ...interimEvaluationeAssignmentsData,
            isLoading: true,
          })
        );
      }

      try {
        /**
         * Loaded and filtered student activity
         */
        const [materials] = await Promise.all([
          (async () => {
            const assignments = <Array<MaterialAssignmentType>>await promisify(
                mApi().workspace.workspaces.materials.read(workspaceId, {
                  assignmentType: "INTERIM_EVALUATION",
                }),
                "callback"
              )() || [];

            const [materials] = await Promise.all([
              Promise.all(
                assignments.map((assignment) =>
                  promisify(
                    mApi().materials.html.read(assignment.materialId),
                    "callback"
                  )().then(
                    (assignments: MaterialContentNodeType) => assignments
                  )
                )
              ),
            ]);

            return materials.map(
              (material, index) => <MaterialContentNodeType>Object.assign(
                  material,
                  {
                    assignment: assignments[index],
                    path: assignments[index].path,
                  }
                )
            );
          })(),
        ]);

        if (!isCancelled) {
          setInterimEvaluationAssignmentsData(
            (interimEvaluationeAssignmentsData) => ({
              ...interimEvaluationeAssignmentsData,
              interimEvaluationAssignments: materials,
              isLoading: false,
            })
          );
        }
      } catch (err) {
        if (!isCancelled) {
          displayNotification(
            `${i18n.text.get(
              "plugin.records.errormessage.workspaceAssignmentsExerciseLoadFailed"
            )}, ${err.message}`,
            "error"
          );
          setInterimEvaluationAssignmentsData(
            (interimEvaluationeAssignmentsData) => ({
              ...interimEvaluationeAssignmentsData,
              isLoading: false,
            })
          );
        }
      }
    };

    /**
     * Execute loading data when tab is set to evaluations and there is no
     * existing data
     */
    if (
      tabOpen === "INTERIM_EVALUATION" &&
      interimEvaluationeAssignmentsData.interimEvaluationAssignments.length ===
        0
    ) {
      loadInterimEvaluationData(workspaceId);
    }

    return () => {
      isCancelled = true;
    };
  }, [
    workspaceId,
    displayNotification,
    tabOpen,
    interimEvaluationeAssignmentsData.interimEvaluationAssignments.length,
    i18n,
  ]);

  return {
    interimEvaluationeAssignmentsData,
  };
};
