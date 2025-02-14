import { easyToUse } from "./easy-to-use-functions/index";
import { notifications } from "./base/notifications";
import { locales } from "./base/locales";
import status from "./base/status";
import i18n from "./base/i18n";
import { title } from "./base/title";
import websocket from "./util/websocket";
import { messages } from "./main-function/messages";
import { workspaces } from "./workspaces";
import { announcements } from "./announcements";
import { userIndex } from "./user-index";
import {
  organizationUsers,
  studyprogrammes,
  userSelect,
  userGroups,
} from "./main-function/users";
import { discussion } from "~/reducers/discussion";
import { guider } from "./main-function/guider";
import { profile } from "./main-function/profile";
import { records } from "~/reducers/main-function/records";
import { hops } from "~/reducers/main-function/hops";
import { yo, eligibilitySubjects } from "~/reducers/main-function/records/yo";
import { summary } from "~/reducers/main-function/records/summary";
import { organizationSummary } from "~/reducers/organization/summary";
import { combineReducers } from "redux";
import { evaluations } from "./main-function/evaluation/index";
import { ceepos } from "./main-function/ceepos";
import { calendar } from "./main-function/calendar";
import { organizationWorkspaces } from "./workspaces/organization";
import { contacts } from "./base/contacts";

export default combineReducers({
  announcements,
  calendar,
  ceepos,
  contacts,
  discussion,
  easyToUse,
  eligibilitySubjects,
  evaluations,
  guider,
  hops,
  i18n,
  locales,
  messages,
  notifications,
  organizationSummary,
  organizationUsers,
  organizationWorkspaces,
  profile,
  records,
  status,
  studyprogrammes,
  summary,
  title,
  userGroups,
  userIndex,
  userSelect,
  websocket,
  workspaces,
  yo,
});
