export interface SpecificActionType<ActionType, PayloadType> {
  type: ActionType,
  payload: PayloadType | null
}

type dispatch = (action: any) => any;
type getState = () => any;
type AsyncDeferredAction = (dispatch: (arg: AnyActionType) => any, getState: () => any) => Promise<void>;
type DeferredAction = (dispatch: (arg: AnyActionType) => any, getState: () => any) => any;

import { SET_LOCALE } from './base/locales';
import { ADD_NOTIFICATION, HIDE_NOTIFICATION } from './base/notifications';
import { LOGOUT, UPDATE_STATUS_PROFILE, UPDATE_STATUS_HAS_IMAGE } from './base/status';
import { UPDATE_TITLE } from './base/title';
import {
  SET_CURRENT_MESSAGE_THREAD, UPDATE_MESSAGES_STATE, UPDATE_MESSAGES_ALL_PROPERTIES,
  UPDATE_MESSAGE_THREAD_ADD_LABEL, UPDATE_MESSAGE_THREAD_DROP_LABEL, PUSH_ONE_MESSAGE_THREAD_FIRST, LOCK_TOOLBAR, UNLOCK_TOOLBAR,
  UPDATE_ONE_MESSAGE_THREAD, DELETE_MESSAGE_THREAD, UPDATE_MESSAGES_SIGNATURE, UPDATE_SELECTED_MESSAGE_THREADS, ADD_TO_MESSAGES_SELECTED_THREADS,
  REMOVE_FROM_MESSAGES_SELECTED_THREADS,
  PUSH_MESSAGE_LAST_IN_CURRENT_THREAD
} from './main-function/messages';
import {
  UPDATE_MESSAGES_NAVIGATION_LABELS, ADD_MESSAGES_NAVIGATION_LABEL,
  UPDATE_ONE_LABEL_FROM_ALL_MESSAGE_THREADS, UPDATE_MESSAGES_NAVIGATION_LABEL,
  DELETE_MESSAGE_THREADS_NAVIGATION_LABEL, REMOVE_ONE_LABEL_FROM_ALL_MESSAGE_THREADS
} from './main-function/messages';
import { UPDATE_UNREAD_MESSAGE_THREADS_COUNT, UPDATE_MESSAGE_THREADS } from './main-function/messages';

// Do not delete this, organization stuff

import { UPDATE_STUDENT_USERS, UPDATE_STAFF_USERS, UPDATE_STUDENT_SELECTOR, UPDATE_STAFF_SELECTOR, UPDATE_GROUP_SELECTOR, UPDATE_USERS_STATE, UPDATE_STUDYPROGRAMME_TYPES, UPDATE_STUDYPROGRAMME_STATUS_TYPE } from './main-function/users';
import {
  UPDATE_ANNOUNCEMENTS, UPDATE_ANNOUNCEMENTS_STATE, UPDATE_ANNOUNCEMENTS_ALL_PROPERTIES, UPDATE_SELECTED_ANNOUNCEMENTS,
  ADD_TO_ANNOUNCEMENTS_SELECTED, REMOVE_FROM_ANNOUNCEMENTS_SELECTED,
  UPDATE_ONE_ANNOUNCEMENT, DELETE_ANNOUNCEMENT, SET_CURRENT_ANNOUNCEMENT
} from './announcements';
import { UPDATE_DISCUSSION_AREAS, PUSH_DISCUSSION_AREA_LAST, UPDATE_DISCUSSION_AREA, DELETE_DISCUSSION_AREA } from './discussion';
import {
  UPDATE_DISCUSSION_THREADS_STATE, UPDATE_DISCUSSION_THREADS_ALL_PROPERTIES, PUSH_DISCUSSION_THREAD_FIRST,
  UPDATE_DISCUSSION_CURRENT_THREAD_STATE, SET_CURRENT_DISCUSSION_THREAD, SET_TOTAL_DISCUSSION_PAGES, SET_TOTAL_DISCUSSION_THREAD_PAGES, UPDATE_DISCUSSION_THREAD, UPDATE_DISCUSSION_THREAD_REPLY, SET_DISCUSSION_WORKSPACE_ID
} from './discussion';
import { SET_USER_INDEX, SET_USER_GROUP_INDEX, SET_USER_BY_SCHOOL_DATA_INDEX } from './user-index';
import {
  UPDATE_USER_WORKSPACES, UPDATE_LAST_WORKSPACE, SET_CURRENT_WORKSPACE, UPDATE_WORKSPACE_ASSESSMENT_STATE,
  UPDATE_WORKSPACES_AVAILABLE_FILTERS_CURRICULUMS, UPDATE_WORKSPACES_AVAILABLE_FILTERS_EDUCATION_TYPES, UPDATE_WORKSPACES_STATE,
  UPDATE_WORKSPACES_ALL_PROPS, UPDATE_WORKSPACES_ACTIVE_FILTERS, UPDATE_WORKSPACE, UPDATE_WORKSPACES_SET_CURRENT_MATERIALS,
  UPDATE_WORKSPACES_SET_CURRENT_MATERIALS_ACTIVE_NODE_ID, UPDATE_WORKSPACES_SET_CURRENT_MATERIALS_REPLIES,
  UPDATE_ORGANIZATION_WORKSPACES_AVAILABLE_FILTERS_EDUCATION_TYPES, UPDATE_ORGANIZATION_WORKSPACES_AVAILABLE_FILTERS_CURRICULUMS, UPDATE_ORGANIZATION_WORKSPACES_ALL_PROPS,
  UPDATE_ORGANIZATION_WORKSPACES_ACTIVE_FILTERS, UPDATE_ORGANIZATION_WORKSPACES_STATE,
  UPDATE_CURRENT_COMPOSITE_REPLIES_UPDATE_OR_CREATE_COMPOSITE_REPLY_STATE_VIA_ID_NO_ANSWER,
  UPDATE_MATERIAL_CONTENT_NODE,
  DELETE_MATERIAL_CONTENT_NODE,
  INSERT_MATERIAL_CONTENT_NODE,
  UPDATE_PATH_FROM_MATERIAL_CONTENT_NODES,
  UPDATE_WORKSPACES_EDIT_MODE_STATE,
  UPDATE_WORKSPACES_SET_CURRENT_HELP,
  UPDATE_ORGANIZATION_TEMPLATES,
  UPDATE_WORKSPACES_AVAILABLE_FILTERS_ORGANIZATIONS
} from './workspaces';
import {
  UPDATE_GUIDER_AVAILABLE_FILTERS_LABELS, UPDATE_GUIDER_AVAILABLE_FILTERS_WORKSPACES, UPDATE_GUIDER_AVAILABLE_FILTERS_ADD_LABEL,
  UPDATE_GUIDER_AVAILABLE_FILTER_LABEL, UPDATE_ONE_GUIDER_LABEL_FROM_ALL_STUDENTS, DELETE_GUIDER_AVAILABLE_FILTER_LABEL,
  DELETE_ONE_GUIDER_LABEL_FROM_ALL_STUDENTS, UPDATE_GUIDER_ACTIVE_FILTERS, UPDATE_GUIDER_ALL_PROPS, UPDATE_GUIDER_STATE,
  ADD_TO_GUIDER_SELECTED_STUDENTS, REMOVE_FROM_GUIDER_SELECTED_STUDENTS, SET_CURRENT_GUIDER_STUDENT, SET_CURRENT_GUIDER_STUDENT_EMPTY_LOAD,
  SET_CURRENT_GUIDER_STUDENT_PROP, UPDATE_CURRENT_GUIDER_STUDENT_STATE, ADD_GUIDER_LABEL_TO_USER, REMOVE_GUIDER_LABEL_FROM_USER, ADD_FILE_TO_CURRENT_STUDENT,
  REMOVE_FILE_FROM_CURRENT_STUDENT
} from './main-function/guider';
import {
  UPDATE_RECORDS_ALL_STUDENT_USERS_DATA, UPDATE_RECORDS_ALL_STUDENT_USERS_DATA_STATUS,
  UPDATE_RECORDS_LOCATION, UPDATE_RECORDS_CURRENT_STUDENT_AND_WORKSPACE_STATUS,
  UPDATE_RECORDS_CURRENT_STUDENT_AND_WORKSPACE, UPDATE_RECORDS_SET_FILES
} from './main-function/records';
import { UPDATE_STUDIES_SUMMARY, UPDATE_STUDIES_SUMMARY_STATUS } from './main-function/records/summary';
import { UPDATE_STUDIES_STATISTICS, UPDATE_STUDIES_STATISTICS_STATUS } from './main-function/records/statistics';
import { UPDATE_STUDIES_SUBJECT_ELIGIBILITY, UPDATE_STUDIES_SUBJECT_ELIGIBILITY_STATUS, UPDATE_STUDIES_YO, UPDATE_STUDIES_YO_STATUS, UPDATE_STUDIES_YO_SUBJECTS, UPDATE_STUDIES_YO_ELIGIBILITY_STATUS, UPDATE_STUDIES_YO_ELIGIBILITY } from './main-function/records/yo';
import { UPDATE_VOPS, UPDATE_VOPS_STATUS } from './main-function/vops';
import { UPDATE_HOPS, UPDATE_HOPS_STATUS, UPDATE_HOPS_ELIGIBILITY } from './main-function/hops';
import { LOAD_CREDENTIALS, CREDENTIALS_STATE } from './base/credentials';
import { UPDATE_ERROR } from './base/error';
import { SET_PROFILE_USER_PROPERTY, SET_PROFILE_USERNAME, SET_PROFILE_ADDRESSES, SET_PROFILE_STUDENT } from './main-function/profile';
import { WEBSOCKET_EVENT, INITIALIZE_WEBSOCKET } from '~/reducers/util/websocket';

export type ActionType = SET_CURRENT_MESSAGE_THREAD | UPDATE_MESSAGES_STATE |
  UPDATE_MESSAGES_ALL_PROPERTIES | UPDATE_MESSAGE_THREAD_ADD_LABEL | UPDATE_MESSAGE_THREAD_DROP_LABEL | PUSH_ONE_MESSAGE_THREAD_FIRST |
  LOCK_TOOLBAR | UNLOCK_TOOLBAR | UPDATE_ONE_MESSAGE_THREAD | DELETE_MESSAGE_THREAD | UPDATE_MESSAGES_SIGNATURE |
  SET_LOCALE | ADD_NOTIFICATION | HIDE_NOTIFICATION | LOGOUT | UPDATE_TITLE | UPDATE_SELECTED_MESSAGE_THREADS | ADD_TO_MESSAGES_SELECTED_THREADS |
  REMOVE_FROM_MESSAGES_SELECTED_THREADS | UPDATE_UNREAD_MESSAGE_THREADS_COUNT | UPDATE_LAST_WORKSPACE | SET_CURRENT_WORKSPACE | UPDATE_USER_WORKSPACES | UPDATE_MESSAGE_THREADS |
  UPDATE_ANNOUNCEMENTS | UPDATE_MESSAGES_NAVIGATION_LABELS | ADD_MESSAGES_NAVIGATION_LABEL | UPDATE_ONE_LABEL_FROM_ALL_MESSAGE_THREADS
  | UPDATE_MESSAGES_NAVIGATION_LABEL | DELETE_MESSAGE_THREADS_NAVIGATION_LABEL | REMOVE_ONE_LABEL_FROM_ALL_MESSAGE_THREADS | WEBSOCKET_EVENT | INITIALIZE_WEBSOCKET |
  UPDATE_ANNOUNCEMENTS_STATE | UPDATE_ANNOUNCEMENTS_ALL_PROPERTIES | UPDATE_SELECTED_ANNOUNCEMENTS | ADD_TO_ANNOUNCEMENTS_SELECTED |
  REMOVE_FROM_ANNOUNCEMENTS_SELECTED | UPDATE_ONE_ANNOUNCEMENT | SET_CURRENT_ANNOUNCEMENT | DELETE_ANNOUNCEMENT | UPDATE_DISCUSSION_AREAS |
  UPDATE_DISCUSSION_THREADS_STATE | UPDATE_DISCUSSION_THREADS_ALL_PROPERTIES | PUSH_DISCUSSION_AREA_LAST | UPDATE_DISCUSSION_AREA |
  DELETE_DISCUSSION_AREA | SET_USER_INDEX | PUSH_DISCUSSION_THREAD_FIRST | UPDATE_DISCUSSION_CURRENT_THREAD_STATE |
  SET_CURRENT_DISCUSSION_THREAD | SET_TOTAL_DISCUSSION_PAGES | SET_TOTAL_DISCUSSION_THREAD_PAGES | UPDATE_DISCUSSION_THREAD |
  UPDATE_DISCUSSION_THREAD_REPLY | PUSH_MESSAGE_LAST_IN_CURRENT_THREAD | SET_USER_GROUP_INDEX | SET_USER_BY_SCHOOL_DATA_INDEX |
  UPDATE_ORGANIZATION_WORKSPACES_AVAILABLE_FILTERS_EDUCATION_TYPES | UPDATE_ORGANIZATION_WORKSPACES_AVAILABLE_FILTERS_CURRICULUMS | UPDATE_ORGANIZATION_WORKSPACES_ALL_PROPS |
  UPDATE_ORGANIZATION_WORKSPACES_ACTIVE_FILTERS | UPDATE_ORGANIZATION_WORKSPACES_STATE | UPDATE_ORGANIZATION_TEMPLATES |
  UPDATE_WORKSPACES_AVAILABLE_FILTERS_EDUCATION_TYPES | UPDATE_WORKSPACES_AVAILABLE_FILTERS_CURRICULUMS | UPDATE_WORKSPACES_STATE |
  UPDATE_WORKSPACES_ALL_PROPS | UPDATE_WORKSPACES_ACTIVE_FILTERS | UPDATE_GUIDER_AVAILABLE_FILTERS_LABELS |
  UPDATE_GUIDER_AVAILABLE_FILTERS_WORKSPACES | UPDATE_GUIDER_ACTIVE_FILTERS | UPDATE_GUIDER_ALL_PROPS | UPDATE_GUIDER_STATE |
  ADD_TO_GUIDER_SELECTED_STUDENTS | REMOVE_FROM_GUIDER_SELECTED_STUDENTS | SET_CURRENT_GUIDER_STUDENT | SET_CURRENT_GUIDER_STUDENT_EMPTY_LOAD |
  SET_CURRENT_GUIDER_STUDENT_PROP | UPDATE_CURRENT_GUIDER_STUDENT_STATE | ADD_GUIDER_LABEL_TO_USER | REMOVE_GUIDER_LABEL_FROM_USER |
  UPDATE_GUIDER_AVAILABLE_FILTERS_ADD_LABEL | UPDATE_GUIDER_AVAILABLE_FILTER_LABEL | UPDATE_ONE_GUIDER_LABEL_FROM_ALL_STUDENTS |
  DELETE_GUIDER_AVAILABLE_FILTER_LABEL | DELETE_ONE_GUIDER_LABEL_FROM_ALL_STUDENTS | ADD_FILE_TO_CURRENT_STUDENT | REMOVE_FILE_FROM_CURRENT_STUDENT |
  UPDATE_RECORDS_ALL_STUDENT_USERS_DATA | UPDATE_RECORDS_ALL_STUDENT_USERS_DATA_STATUS | UPDATE_RECORDS_LOCATION | UPDATE_RECORDS_SET_FILES | UPDATE_STATUS_PROFILE | UPDATE_STATUS_HAS_IMAGE |
  UPDATE_RECORDS_CURRENT_STUDENT_AND_WORKSPACE_STATUS | UPDATE_RECORDS_CURRENT_STUDENT_AND_WORKSPACE | UPDATE_WORKSPACE_ASSESSMENT_STATE | UPDATE_VOPS | UPDATE_VOPS_STATUS |
  UPDATE_STUDIES_SUMMARY | UPDATE_STUDIES_SUMMARY_STATUS | UPDATE_STUDIES_STATISTICS | UPDATE_STUDIES_STATISTICS_STATUS | UPDATE_STUDIES_YO | UPDATE_STUDIES_YO_STATUS | UPDATE_STUDIES_YO_SUBJECTS |
  UPDATE_STUDIES_YO_ELIGIBILITY_STATUS | UPDATE_STUDIES_YO_ELIGIBILITY | UPDATE_STUDIES_SUBJECT_ELIGIBILITY | UPDATE_STUDIES_SUBJECT_ELIGIBILITY_STATUS | UPDATE_HOPS_ELIGIBILITY |
  SET_DISCUSSION_WORKSPACE_ID | UPDATE_HOPS | UPDATE_HOPS_STATUS | UPDATE_ERROR | SET_PROFILE_USER_PROPERTY | SET_PROFILE_USERNAME | SET_PROFILE_ADDRESSES | SET_PROFILE_STUDENT |
  LOAD_CREDENTIALS | CREDENTIALS_STATE | UPDATE_WORKSPACES_AVAILABLE_FILTERS_ORGANIZATIONS |
  UPDATE_STUDENT_USERS | UPDATE_STAFF_USERS | UPDATE_STUDENT_SELECTOR | UPDATE_STAFF_SELECTOR | UPDATE_GROUP_SELECTOR | UPDATE_STUDYPROGRAMME_TYPES | UPDATE_STUDYPROGRAMME_STATUS_TYPE | UPDATE_USERS_STATE | SET_CURRENT_WORKSPACE | UPDATE_WORKSPACE_ASSESSMENT_STATE | UPDATE_WORKSPACE | UPDATE_WORKSPACES_SET_CURRENT_MATERIALS |
  UPDATE_WORKSPACES_SET_CURRENT_MATERIALS_ACTIVE_NODE_ID | UPDATE_WORKSPACES_SET_CURRENT_MATERIALS_REPLIES |
  UPDATE_CURRENT_COMPOSITE_REPLIES_UPDATE_OR_CREATE_COMPOSITE_REPLY_STATE_VIA_ID_NO_ANSWER | UPDATE_MATERIAL_CONTENT_NODE | DELETE_MATERIAL_CONTENT_NODE |
  INSERT_MATERIAL_CONTENT_NODE | UPDATE_PATH_FROM_MATERIAL_CONTENT_NODES | UPDATE_WORKSPACES_EDIT_MODE_STATE | UPDATE_WORKSPACES_SET_CURRENT_HELP

export type AnyActionType = ActionType | DeferredAction | AsyncDeferredAction
