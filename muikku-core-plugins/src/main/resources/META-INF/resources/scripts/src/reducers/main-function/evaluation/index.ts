import { ActionType } from "../../../actions/index";
import { MaterialCompositeRepliesType } from "../../workspaces/index";
import {
  EvaluationWorkspace,
  EvaluationStateType,
  EvaluationGradeSystem,
  AssessmentRequest,
  EvaluationSort,
  EvaluationAssigmentData,
  EvaluationEvent,
  EvaluationStudyDiaryEvent,
  EvaluationBasePriceById,
  EvaluationFilters,
  EvaluationJournalCommentsByJournal,
} from "../../../@types/evaluation";
import { Reducer } from "redux";
import { EvaluationJournalFeedback } from "../../../@types/evaluation";

/**
 * EvaluationStateAndData
 */
interface EvaluationStateAndData<T> {
  state: EvaluationStateType;
  data?: T;
}

/**
 * Interface for evaluation redux state
 */
export interface EvaluationState {
  status: EvaluationStateType;
  importantRequests: number[];
  unimportantRequests: number[];
  evaluationGradeSystem: EvaluationGradeSystem[];
  evaluationRequests: EvaluationStateAndData<AssessmentRequest[]>;
  evaluationWorkspaces: EvaluationWorkspace[];
  selectedWorkspaceId?: number;
  evaluationSearch: string;
  evaluationSort?: EvaluationSort;
  evaluationFilters: EvaluationFilters;
  evaluationSelectedAssessmentId?: AssessmentRequest;
  evaluationAssessmentEvents?: EvaluationStateAndData<EvaluationEvent[]>;
  evaluationJournalFeedback?: EvaluationStateAndData<EvaluationJournalFeedback>;
  evaluationDiaryEntries?: EvaluationStateAndData<EvaluationStudyDiaryEvent[]>;
  evaluationJournalComments: {
    comments: EvaluationJournalCommentsByJournal;
    commentsLoaded: number[];
  };
  evaluationCurrentStudentAssigments?: EvaluationStateAndData<EvaluationAssigmentData>;
  evaluationCompositeReplies?: EvaluationStateAndData<
    MaterialCompositeRepliesType[]
  >;
  openedAssignmentEvaluationId?: number;
  evaluationBilledPrice?: number;
  needsReloadEvaluationRequests: boolean;
  basePrice: EvaluationStateAndData<EvaluationBasePriceById>;
}

/**
 * Initial state
 */
export const initialState: EvaluationState = {
  status: "LOADING",
  importantRequests: [],
  unimportantRequests: [],
  evaluationGradeSystem: [],
  evaluationRequests: {
    state: "LOADING",
    data: undefined,
  },
  evaluationWorkspaces: [],
  selectedWorkspaceId: undefined,
  evaluationSearch: "",
  evaluationSort: undefined,
  evaluationFilters: {
    evaluated: false,
    notEvaluated: false,
    assessmentRequest: false,
    supplementationRequest: false,
  },
  evaluationAssessmentEvents: {
    state: "LOADING",
    data: undefined,
  },
  evaluationSelectedAssessmentId: undefined,
  evaluationCurrentStudentAssigments: { state: "LOADING", data: undefined },
  openedAssignmentEvaluationId: undefined,
  evaluationBilledPrice: undefined,
  evaluationJournalComments: { comments: {}, commentsLoaded: [] },
  evaluationJournalFeedback: { state: "LOADING", data: undefined },
  evaluationDiaryEntries: {
    state: "LOADING",
    data: undefined,
  },
  evaluationCompositeReplies: { state: "LOADING", data: undefined },
  needsReloadEvaluationRequests: false,
  basePrice: {
    state: "LOADING",
    data: undefined,
  },
};

/**
 * Reducer function for evaluation
 *
 * @param state state
 * @param action action
 * @returns State of evaluation
 */
export const evaluations: Reducer<EvaluationState> = (
  state = initialState,
  action: ActionType
) => {
  switch (action.type) {
    case "EVALUATION_STATE_UPDATE":
      return {
        ...state,
        status: action.payload,
      };

    case "EVALUATION_IMPORTANT_ASSESSMENTS_LOAD":
      return {
        ...state,
        importantRequests: action.payload.value
          ? action.payload.value.split(",").map((item) => parseInt(item))
          : [],
      };

    case "EVALUATION_UNIMPORTANT_ASSESSMENTS_LOAD":
      return {
        ...state,
        unimportantRequests: action.payload.value
          ? action.payload.value.split(",").map((item) => parseInt(item))
          : [],
      };

    case "EVALUATION_WORKSPACES_LOAD":
      return {
        ...state,
        evaluationWorkspaces: action.payload,
      };

    case "EVALUATION_GRADE_SYSTEM_LOAD":
      return {
        ...state,
        evaluationGradeSystem: action.payload,
      };

    case "EVALUATION_SELECTED_WORKSPACE_CHANGE":
      return {
        ...state,
        selectedWorkspaceId: action.payload,
        evaluationFilters:
          action.payload === undefined
            ? initialState.evaluationFilters
            : state.evaluationFilters,
      };

    case "EVALUATION_SEARCH_CHANGE":
      return {
        ...state,
        evaluationSearch: action.payload,
      };

    case "EVALUATION_SORT_FUNCTION_CHANGE":
      return {
        ...state,
        evaluationSort: action.payload,
      };

    case "EVALUATION_FILTERS_CHANGE":
      return {
        ...state,
        evaluationFilters: action.payload,
      };

    case "EVALUATION_IMPORTANCE_UPDATE":
      return {
        ...state,
        importantRequests: action.payload.importantAssessments.value
          ? action.payload.importantAssessments.value
              .split(",")
              .map((item) => parseInt(item))
          : [],
        unimportantRequests: action.payload.unimportantAssessments.value
          ? action.payload.unimportantAssessments.value
              .split(",")
              .map((item) => parseInt(item))
          : [],
      };

    case "EVALUATION_ASSESSMENT_UPDATE":
      return {
        ...state,
        evaluationSelectedAssessmentId: action.payload,
      };

    case "EVALUATION_OPENED_ASSIGNMENT_UPDATE":
      return {
        ...state,
        openedAssignmentEvaluationId: action.payload,
      };

    case "EVALUATION_BILLED_PRICE_LOAD":
      return {
        ...state,
        openedAssignmentEvaluationId: action.payload,
      };

    case "EVALUATION_COMPOSITE_REPLIES_LOAD":
      return {
        ...state,
        evaluationCompositeReplies: {
          state: state.evaluationCompositeReplies.state,
          data: action.payload,
        },
      };

    case "EVALUATION_COMPOSITE_REPLIES_STATE_UPDATE":
      return {
        ...state,
        evaluationCompositeReplies: {
          state: action.payload,
          data: state.evaluationCompositeReplies.data,
        },
      };

    case "EVALUATION_ASSESSMENT_EVENTS_LOAD":
      return {
        ...state,
        evaluationAssessmentEvents: {
          state: state.evaluationAssessmentEvents.state,
          data: action.payload,
        },
      };

    case "EVALUATION_ASSESSMENT_EVENTS_STATE_UPDATE":
      return {
        ...state,
        evaluationAssessmentEvents: {
          state: action.payload,
          data: state.evaluationAssessmentEvents.data,
        },
      };

    case "EVALUATION_JOURNAL_FEEDBACK_LOAD":
      return {
        ...state,
        evaluationJournalFeedback: {
          state: state.evaluationJournalFeedback.state,
          data: action.payload,
        },
      };

    case "EVALUATION_JOURNAL_FEEDBACK_STATE_UPDATE":
      return {
        ...state,
        evaluationJournalFeedback: {
          state: action.payload,
          data: state.evaluationJournalFeedback.data,
        },
      };

    case "EVALUATION_JOURNAL_FEEDBACK_CREATE_OR_UPDATE":
      return {
        ...state,
        evaluationJournalFeedback: {
          state: state.evaluationJournalFeedback.state,
          data: action.payload,
        },
      };

    case "EVALUATION_JOURNAL_FEEDBACK_DELETE":
      return {
        ...state,
        evaluationJournalFeedback: {
          state: state.evaluationJournalFeedback.state,
          data: undefined,
        },
      };

    case "EVALUATION_JOURNAL_EVENTS_LOAD":
      return {
        ...state,
        evaluationDiaryEntries: {
          state: state.evaluationDiaryEntries.state,
          data: action.payload,
        },
      };

    case "EVALUATION_JOURNAL_STATE_UPDATE":
      return {
        ...state,
        evaluationDiaryEntries: {
          state: action.payload,
          data: state.evaluationDiaryEntries.data,
        },
      };

    case "EVALUATION_ASSESSMENT_ASSIGNMENTS_LOAD":
      return {
        ...state,
        evaluationCurrentStudentAssigments: {
          state: state.evaluationCurrentStudentAssigments.state,
          data: action.payload,
        },
      };

    case "EVALUATION_ASSESSMENT_ASSIGNMENTS_STATE_UPDATE":
      return {
        ...state,
        evaluationCurrentStudentAssigments: {
          state: action.payload,
          data: state.evaluationCurrentStudentAssigments.data,
        },
      };

    case "EVALUATION_REQUESTS_LOAD":
      return {
        ...state,
        evaluationRequests: {
          state: state.evaluationRequests.state,
          data: action.payload,
        },
      };

    case "EVALUATION_REQUESTS_STATE_UPDATE":
      return {
        ...state,
        needsReloadEvaluationRequests: false,
        evaluationRequests: {
          state: action.payload,
          data: state.evaluationRequests.data,
        },
      };

    case "EVALUATION_NEEDS_RELOAD_REQUESTS_UPDATE":
      return {
        ...state,
        needsReloadEvaluationRequests: action.payload,
      };

    case "EVALUATION_BASE_PRICE_LOAD":
      return {
        ...state,
        basePrice: { state: state.basePrice.state, data: action.payload },
      };

    case "EVALUATION_BASE_PRICE_STATE_UPDATE":
      return {
        ...state,
        basePrice: { state: action.payload, data: state.basePrice.data },
      };

    case "EVALUATION_JOURNAL_COMMENTS_INITIALIZED":
      return {
        ...state,
        evaluationJournalComments: {
          ...state.evaluationJournalComments,
          comments: action.payload,
        },
      };

    case "EVALUATION_JOURNAL_COMMENTS_LOAD":
      return {
        ...state,
        evaluationJournalComments: {
          comments: action.payload.comments,
          commentsLoaded: action.payload.commentsLoaded,
        },
      };

    case "EVALUATION_JOURNAL_COMMENTS_CREATE":
      return {
        ...state,
        evaluationDiaryEntries: {
          state: state.evaluationDiaryEntries.state,
          data: action.payload.updatedJournalEntryList,
        },
        evaluationJournalComments: {
          ...state.evaluationJournalComments,
          comments: action.payload.updatedCommentsList,
        },
      };

    case "EVALUATION_JOURNAL_COMMENTS_UPDATE":
      return {
        ...state,
        evaluationJournalComments: {
          ...state.evaluationJournalComments,
          comments: action.payload.updatedCommentsList,
        },
      };

    case "EVALUATION_JOURNAL_COMMENTS_DELETE":
      return {
        ...state,
        evaluationDiaryEntries: {
          state: state.evaluationDiaryEntries.state,
          data: action.payload.updatedJournalEntryList,
        },
        evaluationJournalComments: {
          ...state.evaluationJournalComments,
          comments: action.payload.updatedCommentsList,
        },
      };

    default:
      return state;
  }
};
