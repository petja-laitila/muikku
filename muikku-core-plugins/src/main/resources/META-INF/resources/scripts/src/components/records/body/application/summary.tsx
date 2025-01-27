import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import "~/sass/elements/empty.scss";
import "~/sass/elements/loaders.scss";
import "~/sass/elements/glyph.scss";
import "~/sass/elements/item-list.scss";
import "~/sass/elements/application-sub-panel.scss";
import { RecordsType } from "~/reducers/main-function/records";
import { SummaryType } from "~/reducers/main-function/records/summary";
import { Contacts, Contact } from "~/reducers/base/contacts";
import { HOPSType } from "~/reducers/main-function/hops";
import { StateType } from "~/reducers";
import MainChart from "~/components/general/graph/main-chart";
import CommunicatorNewMessage from "~/components/communicator/dialogs/new-message";
import { ButtonPill } from "~/components/general/button";
import moment from "~/lib/moment";
import { StatusType } from "~/reducers/base/status";
import Avatar from "~/components/general/avatar";
import { getName } from "~/util/modifiers";
import CourseCarousel from "~/components/general/carousel/course-carousel";
import {
  displayNotification,
  DisplayNotificationTriggerType,
} from "~/actions/base/notifications";
import { AnyActionType } from "~/actions";
import { bindActionCreators } from "redux";
import Notes from "~/components/general/notes/notes";
import { WhatsappButtonLink } from "~/components/general/whatsapp-link";
import { Instructions } from "~/components/general/instructions";

/**
 * SummaryProps
 */
interface SummaryProps {
  i18n: i18nType;
  records: RecordsType;
  contacts: Contacts;
  summary: SummaryType;
  status: StatusType;
  hops: HOPSType;
  displayNotification: DisplayNotificationTriggerType;
}

/**
 * SummaryState
 */
interface SummaryState {}

/**
 * Summary
 */
class Summary extends React.Component<SummaryProps, SummaryState> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: SummaryProps) {
    super(props);
  }

  /**
   * render
   */
  render() {
    if (
      this.props.records.location !== "summary" ||
      this.props.summary.status !== "READY"
    ) {
      return null;
    } else {
      const studentBasicInfo = (
        <div className="application-sub-panel">
          <div className="application-sub-panel__header">
            {this.props.i18n.text.get("plugin.records.summary.studyInfo")}
          </div>
          <div className="application-sub-panel__body application-sub-panel__body--studies-summary-info">
            <div className="application-sub-panel__item">
              <div className="application-sub-panel__item-title">
                {this.props.i18n.text.get("plugin.records.studyStartDateLabel")}
              </div>
              <div className="application-sub-panel__item-data application-sub-panel__item-data--study-start-date">
                <span className="application-sub-panel__single-entry">
                  {this.props.summary.data.studentsDetails.studyStartDate
                    ? this.props.i18n.time.format(
                        this.props.summary.data.studentsDetails.studyStartDate
                      )
                    : this.props.i18n.text.get(
                        "plugin.records.summary.studyTime.empty"
                      )}
                </span>
              </div>
            </div>
            <div className="application-sub-panel__item">
              <div className="application-sub-panel__item-title">
                {this.props.i18n.text.get(
                  this.props.summary.data.studentsDetails.studyEndDate
                    ? "plugin.records.studyEndDateLabel"
                    : "plugin.records.studyTimeEndLabel"
                )}
              </div>
              <div className="application-sub-panel__item-data application-sub-panel__item-data--study-end-date">
                <span className="application-sub-panel__single-entry">
                  {this.props.summary.data.studentsDetails.studyEndDate ||
                  this.props.summary.data.studentsDetails.studyTimeEnd
                    ? this.props.i18n.time.format(
                        this.props.summary.data.studentsDetails.studyEndDate ||
                          this.props.summary.data.studentsDetails.studyTimeEnd
                      )
                    : this.props.i18n.text.get(
                        "plugin.records.summary.studyTime.empty"
                      )}
                </span>
              </div>
            </div>

            <div className="application-sub-panel__item application-sub-panel__item--counselors">
              <div className="application-sub-panel__item-title">
                {this.props.i18n.text.get(
                  "plugin.records.studyStudentCouncelorsLabel"
                )}
              </div>
              <div className="application-sub-panel__item-data application-sub-panel__item-data--summary-student-counselors">
                <div className="item-list item-list--student-counselors">
                  {this.props.contacts.counselors.list.length > 0 ? (
                    this.props.contacts.counselors.list.map(
                      (counselor: Contact) => {
                        let displayVacationPeriod =
                          !!counselor.properties["profile-vacation-start"];
                        if (counselor.properties["profile-vacation-end"]) {
                          // we must check for the ending
                          const vacationEndsAt = moment(
                            counselor.properties["profile-vacation-end"]
                          );
                          const today = moment();
                          // if it's before or it's today then we display, otherwise nope
                          displayVacationPeriod =
                            vacationEndsAt.isAfter(today, "day") ||
                            vacationEndsAt.isSame(today, "day");
                        }
                        return (
                          <div
                            className="item-list__item item-list__item--student-counselor"
                            key={counselor.userEntityId}
                          >
                            <div className="item-list__profile-picture">
                              <Avatar
                                id={counselor.userEntityId}
                                userCategory={3}
                                firstName={counselor.firstName}
                                hasImage={counselor.hasImage}
                              />
                            </div>
                            <div className="item-list__text-body item-list__text-body--multiline">
                              <div className="item-list__user-name">
                                {counselor.firstName} {counselor.lastName}
                              </div>
                              <div className="item-list__user-contact-info">
                                <div className="item-list__user-email">
                                  <div className="glyph icon-envelope"></div>
                                  {counselor.email}
                                </div>
                                {counselor.properties["profile-phone"] ? (
                                  <div className="item-list__user-phone">
                                    <div className="glyph icon-phone"></div>
                                    {counselor.properties["profile-phone"]}
                                  </div>
                                ) : null}
                              </div>
                              {displayVacationPeriod ? (
                                <div className="item-list__user-vacation-period">
                                  {this.props.i18n.text.get(
                                    "plugin.workspace.index.teachersVacationPeriod.label"
                                  )}
                                  &nbsp;
                                  {this.props.i18n.time.format(
                                    counselor.properties[
                                      "profile-vacation-start"
                                    ]
                                  )}
                                  {counselor.properties["profile-vacation-end"]
                                    ? "–" +
                                      this.props.i18n.time.format(
                                        counselor.properties[
                                          "profile-vacation-end"
                                        ]
                                      )
                                    : null}
                                </div>
                              ) : null}
                              <div className="item-list__user-actions">
                                <CommunicatorNewMessage
                                  extraNamespace="guidance-counselor"
                                  initialSelectedItems={[
                                    {
                                      type: "staff",
                                      value: {
                                        id: counselor.userEntityId,
                                        name: getName(counselor, true),
                                      },
                                    },
                                  ]}
                                >
                                  <ButtonPill
                                    icon="envelope"
                                    aria-label={this.props.i18n.text.get(
                                      "plugin.records.contactStudentCouncelor.message.label"
                                    )}
                                    title={this.props.i18n.text.get(
                                      "plugin.records.contactStudentCouncelor.message.label"
                                    )}
                                    buttonModifiers={[
                                      "new-message",
                                      "new-message-to-staff",
                                    ]}
                                  ></ButtonPill>
                                </CommunicatorNewMessage>
                                {counselor.properties["profile-phone"] &&
                                counselor.properties["profile-whatsapp"] ? (
                                  <WhatsappButtonLink
                                    i18n={this.props.i18n}
                                    mobileNumber={
                                      counselor.properties["profile-phone"]
                                    }
                                  />
                                ) : null}
                                {counselor.properties[
                                  "profile-appointmentCalendar"
                                ] ? (
                                  <ButtonPill
                                    aria-label={this.props.i18n.text.get(
                                      "plugin.records.contactStudentCouncelor.appointmentCalendar.label"
                                    )}
                                    title={this.props.i18n.text.get(
                                      "plugin.records.contactStudentCouncelor.appointmentCalendar.label"
                                    )}
                                    icon="clock"
                                    buttonModifiers="appointment-calendar"
                                    openInNewTab="_blank"
                                    href={
                                      counselor.properties[
                                        "profile-appointmentCalendar"
                                      ]
                                    }
                                  />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  ) : (
                    <div className="empty empty--sub-panel-data">
                      <span className="application-sub-panel__single-entry">
                        {this.props.i18n.text.get(
                          "plugin.records.summary.counselors.empty"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

      const studyStatus =
        this.props.hops.value.goalMatriculationExam === "yes" ? (
          <div className="application-sub-panel__card-item application-sub-panel__card-item--summary-evaluated">
            <div className="application-sub-panel__card-header application-sub-panel__card-header--summary-evaluated">
              {this.props.i18n.text.get(
                "plugin.records.summary.card.workspaces.title"
              )}
            </div>
            <div className="application-sub-panel__card-body">
              {this.props.i18n.text.get(
                "plugin.records.summary.card.workspaces.done.pre"
              )}
            </div>
            <div className="application-sub-panel__card-highlight application-sub-panel__card-highlight--summary-evaluated">
              {this.props.summary.data.eligibilityStatus}
            </div>
            <div className="application-sub-panel__card-body">
              {this.props.i18n.text.get(
                "plugin.records.summary.card.workspaces.done.post.matriculationEligibility"
              )}
            </div>
          </div>
        ) : (
          <div className="application-sub-panel__card-item application-sub-panel__card-item--summary-evaluated">
            <div className="application-sub-panel__card-header application-sub-panel__card-header--summary-evaluated">
              {this.props.i18n.text.get(
                "plugin.records.summary.card.workspaces.title"
              )}
            </div>
            <div className="application-sub-panel__card-body">
              {this.props.i18n.text.get(
                "plugin.records.summary.card.workspaces.done.pre"
              )}
            </div>
            <div className="application-sub-panel__card-highlight application-sub-panel__card-highlight--summary-evaluated">
              {this.props.summary.data.coursesDone}
            </div>
            <div className="application-sub-panel__card-body">
              {this.props.i18n.text.get(
                "plugin.records.summary.card.workspaces.done.post.workspace"
              )}
            </div>
          </div>
        );

      return (
        <section>
          <h2 className="application-panel__content-header">
            {this.props.i18n.text.get("plugin.records.summary.title")}
          </h2>
          {studentBasicInfo}
          {this.props.status.isActiveUser ? (
            <div className="react-container">
              {this.props.hops.eligibility &&
                !this.props.hops.eligibility.upperSecondarySchoolCurriculum && (
                  <div className="application-sub-panel">
                    <div className="application-sub-panel__header">
                      {this.props.i18n.text.get(
                        "plugin.records.suggestedCourses.sectionTitle"
                      )}
                    </div>
                    <CourseCarousel
                      studentId={this.props.status.userSchoolDataIdentifier}
                      studentUserEntityId={this.props.status.userId}
                      displayNotification={this.props.displayNotification}
                    />
                  </div>
                )}

              <div className="application-sub-panel">
                <div className="application-sub-panel__header application-sub-panel__header--with-instructions">
                  {this.props.i18n.text.get(
                    "plugin.records.tasks.sectionTitle"
                  )}
                  <Instructions
                    modifier="instructions"
                    alignSelfVertically="top"
                    openByHover={false}
                    closeOnClick={true}
                    closeOnOutsideClick={true}
                    persistent
                    content={
                      <div
                        dangerouslySetInnerHTML={{
                          __html: this.props.i18n.text.get(
                            "plugin.records.tasks.instructions"
                          ),
                        }}
                      />
                    }
                  />
                </div>
                <Notes
                  usePlace="records"
                  showHistoryPanel
                  userId={this.props.status.userId}
                  studentId={this.props.status.userId}
                />
              </div>
              <div className="application-sub-panel">
                <div className="application-sub-panel__header">
                  {this.props.i18n.text.get(
                    "plugin.records.summary.studyEvents"
                  )}
                </div>
                <div className="application-sub-panel__body application-sub-panel__body--studies-summary-cards">
                  {studyStatus}
                  <div className="application-sub-panel__card-item application-sub-panel__card-item--summary-activity">
                    <div className="application-sub-panel__card-header application-sub-panel__card-header--summary-activity">
                      {this.props.i18n.text.get(
                        "plugin.records.summary.card.activity.title"
                      )}
                    </div>
                    <div className="application-sub-panel__card-body">
                      {this.props.i18n.text.get(
                        "plugin.records.summary.card.activity.stat.pre"
                      )}
                    </div>
                    <div className="application-sub-panel__card-highlight application-sub-panel__card-highlight--summary-activity">
                      {this.props.summary.data.activity}
                    </div>
                    <div className="application-sub-panel__card-body">
                      {this.props.i18n.text.get(
                        "plugin.records.summary.card.activity.stat.post"
                      )}
                    </div>
                  </div>
                  <div className="application-sub-panel__card-item application-sub-panel__card-item--summary-returned">
                    <div className="application-sub-panel__card-header application-sub-panel__card-header--summary-returned">
                      {this.props.i18n.text.get(
                        "plugin.records.summary.card.tasks.title"
                      )}
                    </div>
                    <div className="application-sub-panel__card-body">
                      {this.props.i18n.text.get(
                        "plugin.records.summary.card.tasks.stat.pre"
                      )}
                    </div>
                    <div className="application-sub-panel__card-highlight application-sub-panel__card-highlight--summary-returned">
                      {this.props.summary.data.returnedExercises}
                    </div>
                    <div className="application-sub-panel__card-body">
                      {this.props.i18n.text.get(
                        "plugin.records.summary.card.tasks.stat.post"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="application-sub-panel">
                <div className="application-sub-panel__header">
                  {this.props.i18n.text.get(
                    "plugin.guider.user.details.statistics"
                  )}
                </div>
                {this.props.summary.data.graphData.activity &&
                this.props.summary.data.graphData.workspaces ? (
                  <MainChart
                    workspaces={this.props.summary.data.graphData.workspaces}
                    activityLogs={this.props.summary.data.graphData.activity}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      );
    }
  }
}

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    records: state.records,
    contacts: state.contacts,
    summary: state.summary,
    status: state.status,
    hops: state.hops,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({ displayNotification }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Summary);
