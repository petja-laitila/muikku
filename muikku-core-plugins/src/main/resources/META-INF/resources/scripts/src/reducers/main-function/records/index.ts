import { UserWithSchoolDataType, UserFileType } from "~/reducers/user-index";
import { WorkspaceType } from "~/reducers/workspaces";
import { ActionType } from "actions";
import { Reducer } from "redux";
import {
  WorkspaceCurriculumFilterListType,
  WorkspaceJournalListType,
  MaterialContentNodeListType,
  MaterialCompositeRepliesType,
} from "~/reducers/workspaces";

/**
 * TransferCreditType
 */
export interface TransferCreditType {
  assessorIdentifier: string;
  courseName: string;
  courseNumber: number;
  curriculumIdentifier: string;
  date: string;
  gradeIdentifier: string;
  gradingScaleIdentifier: string;
  grade: string;
  gradingScale: string;
  passed: boolean;
  identifier: string;
  length: number;
  lengthUnitIdentifier: string;
  schoolIdentifier: string;
  studentIdentifier: string;
  subjectIdentifier: string;
  verbalAssessment: string;
}

export type RecordGroupType = {
  groupCurriculumIdentifier?: string;
  workspaces: Array<WorkspaceType>;
  transferCredits: Array<TransferCreditType>;
};

export type RecordsOrderedType = Array<RecordGroupType>;

export type AllStudentUsersDataType = Array<{
  user: UserWithSchoolDataType;
  records: RecordsOrderedType;
}>;

/**
 * GradingScaleInfoType
 */
export interface GradingScaleInfoType {
  scale: string;
  grade: string;
  passing: boolean;
}

/**
 * RecordsGradesType
 */
export interface RecordsGradesType {
  [key: string]: GradingScaleInfoType;
}

/**
 * CurrentRecordType
 */
export interface CurrentRecordType {
  workspace: WorkspaceType;
  journals: WorkspaceJournalListType;
  materials: MaterialContentNodeListType;
  compositeReplies: MaterialCompositeRepliesType[];
}

export type AllStudentUsersDataStatusType =
  | "WAIT"
  | "LOADING"
  | "READY"
  | "ERROR";
export type CurrentStudentUserAndWorkspaceStatusType =
  | "WAIT"
  | "LOADING"
  | "READY"
  | "ERROR";

/**
 * RecordsType
 */
export interface RecordsType {
  userData: AllStudentUsersDataType;
  userDataStatus: AllStudentUsersDataStatusType;
  files: Array<UserFileType>;
  currentStatus: CurrentStudentUserAndWorkspaceStatusType;
  current?: CurrentRecordType;
  location?: TranscriptOfRecordLocationType;
  curriculums: WorkspaceCurriculumFilterListType;
}

export type TranscriptOfRecordLocationType =
  | "records"
  | "hops"
  | "vops"
  | "summary"
  | "yo"
  | "info"
  | "pedagogy-form";

/**
 * initialState
 */
const initialState: RecordsType = {
  userData: [],
  userDataStatus: "WAIT",
  location: null,
  files: null,
  current: null,
  currentStatus: "WAIT",
  curriculums: [],
};

/**
 * Reducer function for records
 *
 * @param state state
 * @param action action
 * @returns State of evaluation
 */
export const records: Reducer<RecordsType> = (
  state = initialState,
  action: ActionType
) => {
  switch (action.type) {
    case "UPDATE_RECORDS_ALL_STUDENT_USERS_DATA":
      return { ...state, userData: action.payload };

    case "UPDATE_RECORDS_ALL_STUDENT_USERS_DATA_STATUS":
      return { ...state, userDataStatus: action.payload };

    case "UPDATE_RECORDS_LOCATION":
      return { ...state, location: action.payload };

    case "UPDATE_WORKSPACES_AVAILABLE_FILTERS_CURRICULUMS":
      return { ...state, curriculums: action.payload };

    case "UPDATE_RECORDS_CURRENT_STUDENT_AND_WORKSPACE_STATUS":
      return { ...state, currentStatus: action.payload };

    case "UPDATE_RECORDS_CURRENT_STUDENT_AND_WORKSPACE":
      return { ...state, current: action.payload };

    case "UPDATE_RECORDS_SET_FILES":
      return { ...state, files: action.payload };

    default:
      return state;
  }
};
