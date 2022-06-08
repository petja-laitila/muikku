import * as React from "react";
import { FollowUp } from "../../../../@types/shared";
import { sleep } from "~/helper-functions/shared";
import promisify from "~/util/promisify";
import mApi from "~/lib/mApi";
import { WebsocketStateType } from "~/reducers/util/websocket";
import { DisplayNotificationTriggerType } from "~/actions/base/notifications";
import * as moment from "moment";

/**
 * UseFollowUpGoalsState
 */
export interface UseFollowUpGoalsState {
  isLoading: boolean;
  followUp: FollowUp;
}

/**
 * Intial state
 */
const initialState: UseFollowUpGoalsState = {
  isLoading: false,
  followUp: {
    graduationGoal: null,
    followUpGoal: "",
    followUpStudies: "",
    studySector: "",
    followUpStudiesElse: "",
    studySectorElse: "",
    followUpPlanExtraInfo: "",
  },
};

/**
 * Custom hook for follow up goal
 * @param studentId studentId
 * @param websocketState websocketState
 * @param displayNotification displayNotification
 * @returns follow up goal data
 */
export const useFollowUpGoal = (
  studentId: string,
  websocketState: WebsocketStateType,
  displayNotification: DisplayNotificationTriggerType
) => {
  const [followUpData, setFollowUpData] = React.useState(initialState);

  /**
   * State ref to containging studentActivity state data
   * when ever student activity state changes, so does this ref
   * This is because when websocket handler catches, it always have latest
   * state changes to use
   */
  const ref = React.useRef(followUpData);
  const componentMounted = React.useRef(true);

  React.useEffect(() => {
    ref.current = followUpData;
  }, [followUpData]);

  React.useEffect(() => {
    /**
     * loadStudentActivityListData
     * Loads student activity data
     * @param studentId of student
     */
    const loadStudentFollowUpPlans = async (studentId: string) => {
      setFollowUpData((followUpData) => ({ ...followUpData, isLoading: true }));

      try {
        /**
         * Sleeper to delay data fetching if it happens faster than 1s
         */
        const sleepPromise = await sleep(1000);

        /**
         * Loaded and filtered student activity
         */
        const [loadedFollowUp] = await Promise.all([
          (async () => {
            const followUp = (await promisify(
              mApi().hops.student.hopsGoals.read(studentId),
              "callback"
            )()) as FollowUp;

            return followUp;
          })(),
          sleepPromise,
        ]);

        if (componentMounted.current) {
          setFollowUpData((followUpData) => ({
            ...followUpData,
            isLoading: false,
            followUp: {
              ...loadedFollowUp,
              graduationGoal:
                loadedFollowUp && loadedFollowUp.graduationGoal
                  ? moment(loadedFollowUp.graduationGoal).toDate()
                  : null,
              followUpGoal:
                loadedFollowUp && loadedFollowUp.followUpGoal
                  ? loadedFollowUp.followUpGoal
                  : "",
            },
          }));
        }
      } catch (err) {
        if (componentMounted.current) {
          displayNotification(err.message, "error");
          setFollowUpData((followUpData) => ({
            ...followUpData,
            isLoading: false,
          }));
        }
      }
    };

    loadStudentFollowUpPlans(studentId);

    return () => {
      componentMounted.current = false;
    };
  }, [studentId, displayNotification]);

  React.useEffect(() => {
    /**
     * onAnswerSavedAtServer
     * @param data FollowUp. As its plain json, it needs to be parsed
     */
    const onAnswerSavedAtServer = (data: unknown) => {
      if (typeof data === "string") {
        const followUp: FollowUp = JSON.parse(data);

        setFollowUpData((followUpData) => ({
          ...followUpData,
          followUp: {
            ...followUp,
            graduationGoal: followUp.graduationGoal
              ? moment(followUp.graduationGoal).toDate()
              : null,
          },
        }));
      }
    };

    /**
     * Adding event callback to handle changes when ever
     * there has happened some changes with that message
     */
    websocketState.websocket.addEventCallback(
      "hops:hops-goals",
      onAnswerSavedAtServer
    );

    return () => {
      /**
       * Remove callback when unmounting
       */
      websocketState.websocket.removeEventCallback(
        "hops:hops-goals",
        onAnswerSavedAtServer
      );
    };
  }, [websocketState.websocket]);

  /**
   * updateFollowUpData
   * @param studentId studentId
   * @param dataToUpdate dataToUpdate
   */
  const updateFollowUpData = async (
    studentId: string,
    dataToUpdate: FollowUp
  ) => {
    try {
      await promisify(
        mApi().hops.student.hopsGoals.create(studentId, dataToUpdate),
        "callback"
      )();
    } catch (err) {
      displayNotification(err.message, "error");
    }
  };

  return {
    followUpData,
    /**
     * updateFollowUpData
     * @param studentId studentId
     * @param dataToUpdate dataToUpdate
     */
    updateFollowUpData: (studentId: string, dataToUpdate: FollowUp) =>
      updateFollowUpData(studentId, dataToUpdate),
  };
};
