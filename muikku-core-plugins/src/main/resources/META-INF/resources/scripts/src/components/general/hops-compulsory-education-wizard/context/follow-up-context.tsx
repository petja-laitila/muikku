import * as React from "react";
import { FollowUp } from "~/@types/shared";
import * as moment from "moment";
import { WebsocketStateType } from "~/reducers/util/websocket";
import promisify from "~/util/promisify";
import mApi from "~/lib/mApi";
import { DisplayNotificationTriggerType } from "~/actions/base/notifications";
import { sleep } from "~/helper-functions/shared";

/**
 * FollowUpGoalsState
 */
export interface FollowUpGoalsState {
  isLoading: boolean;
  followUp: FollowUp;
}

/**
 * FollowUpProviderProps
 */
interface FollowUpProviderProps {
  children: React.ReactNode;
  websocketState: WebsocketStateType;
  studentId: string;
  displayNotification: DisplayNotificationTriggerType;
}

/**
 * Intial state
 */
const initialState: FollowUpGoalsState = {
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

const FollowUpStateContext = React.createContext<
  FollowUpGoalsState | undefined
>(undefined);

/**
 * Provider for FollowUpData
 *
 * @param providerProps providerProps
 */
function FollowUpProvider(providerProps: FollowUpProviderProps) {
  const { children, websocketState, studentId, displayNotification } =
    providerProps;

  const [followUpData, setFollowUpData] = React.useState(initialState);

  const componentMounted = React.useRef(true);

  React.useEffect(() => {
    /**
     * Loads student activity data
     *
     * @param studentId of student
     */
    const loadStudentFollowUpPlans = async (studentId: string) => {
      setFollowUpData((followUpData) => ({ ...followUpData, isLoading: true }));

      try {
        // Sleeper to delay data fetching if it happens faster than 1s
        const sleepPromise = await sleep(1000);

        // Loaded and filtered student activity
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
  }, [displayNotification, studentId]);

  React.useEffect(() => {
    /**
     * Handles changes when ever there has happened some changes with defined message
     *
     * @param data FollowUp. As its plain json, it needs to be parsed
     */
    const onAnswerSavedAtServer = (data: unknown) => {
      if (typeof data === "string") {
        const followUp: FollowUp = JSON.parse(data);

        if (componentMounted.current) {
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
      }
    };

    // Adding event callback to handle changes when ever
    // there has happened some changes with that message
    websocketState.websocket.addEventCallback(
      "hops:hops-goals",
      onAnswerSavedAtServer
    );

    return () => {
      // Remove callback when unmounting
      websocketState.websocket.removeEventCallback(
        "hops:hops-goals",
        onAnswerSavedAtServer
      );
    };
  }, [websocketState.websocket]);

  return (
    <FollowUpStateContext.Provider value={followUpData}>
      {children}
    </FollowUpStateContext.Provider>
  );
}

/**
 * Updates follow up data to server which is then updated to websocket
 *
 * @param studentId studentId
 * @param dataToUpdate dataToUpdate
 * @param displayNotification displayNotification
 */
const updateFollowUpData = async (
  studentId: string,
  dataToUpdate: FollowUp,
  displayNotification: DisplayNotificationTriggerType
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

/**
 * Method to returns context of follow up.
 * Check if context is defined and if not, throw an error
 */
function useFollowUp() {
  const context = React.useContext(FollowUpStateContext);
  if (context === undefined) {
    throw new Error("useFollowUp must be used within a FollowUpProvider");
  }
  return context;
}

export { FollowUpProvider, useFollowUp, updateFollowUpData };
