import * as React from 'react';
import { StateType } from '~/reducers';
import { Dispatch, connect } from 'react-redux';
import { i18nType } from '~/reducers/base/i18n';
import { StatusType } from '~/reducers/base/status';
import DatePicker from 'react-datepicker';
import '~/sass/elements/datepicker/datepicker.scss';
import { ProfileType } from '~/reducers/main-function/profile';
import { saveProfileProperty, SaveProfilePropertyTriggerType, updateProfileChatSettings, UpdateProfileChatSettingsTriggerType} from '~/actions/main-function/profile';
import { bindActionCreators } from 'redux';
import { displayNotification, DisplayNotificationTriggerType } from '~/actions/base/notifications';
import Button from '~/components/general/button';
import moment from "~/lib/moment";
import { SimpleActionExecutor } from '~/actions/executor';

interface IVacationSettingsProps {
  i18n: i18nType,
  profile: ProfileType;
  status: StatusType;
  displayNotification: DisplayNotificationTriggerType;
  saveProfileProperty: SaveProfilePropertyTriggerType;
  updateProfileChatSettings: UpdateProfileChatSettingsTriggerType;
}

interface IVacationSettingsState {
  profileVacationStart: any,
  profileVacationEnd: any,
  vacationAutoReply: string,
  vacationAutoReplySubject: string,
  vacationAutoReplyMsg: string,
}

class VacationSettings extends React.Component<IVacationSettingsProps, IVacationSettingsState> {
  constructor(props: IVacationSettingsProps) {
    super(props);

    this.state = {
      profileVacationStart: (props.profile.properties['profile-vacation-start'] && moment(props.profile.properties['profile-vacation-start'])) || null,
      profileVacationEnd: (props.profile.properties['profile-vacation-end'] && moment(props.profile.properties['profile-vacation-end'])) || null,
      vacationAutoReply: props.profile.properties['communicator-auto-reply'] || "",
      vacationAutoReplySubject: props.profile.properties['communicator-auto-reply-subject'] || "",
      vacationAutoReplyMsg: props.profile.properties['communicator-auto-reply-msg'] || "",
    }

    this.handleDateChange = this.handleDateChange.bind(this);
    this.onVacationAutoReplyChange = this.onVacationAutoReplyChange.bind(this);
    this.onVacationAutoReplySubjectChange = this.onVacationAutoReplySubjectChange.bind(this);
    this.onVacationAutoReplyMsgChange = this.onVacationAutoReplyMsgChange.bind(this);
    this.save = this.save.bind(this);
  }

  handleDateChange(stateLocation: string, newDate: any){
    let nState:any = {};
    nState[stateLocation] = newDate;
    (this.setState as any)(nState);
  }
  onVacationAutoReplyChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      vacationAutoReply: e.target.checked ? "ENABLED" : ""
    });
  }
  onVacationAutoReplySubjectChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      vacationAutoReplySubject: e.target.value
    });
  }
  onVacationAutoReplyMsgChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    this.setState({
      vacationAutoReplyMsg: e.target.value
    });
  }

  save(){
    const executor = new SimpleActionExecutor();
    executor
      .addAction(
        !this.props.status.isStudent && this.props.profile.properties['profile-vacation-start'] !== this.state.profileVacationStart,
        () => {
          this.props.saveProfileProperty({
            key: 'profile-vacation-start',
            value: this.state.profileVacationStart ? this.state.profileVacationStart.toISOString() : null,
            success: executor.succeeded,
            fail: executor.failed,
          });
        }
      ).addAction(
        !this.props.status.isStudent && this.props.profile.properties['profile-vacation-end'] !== this.state.profileVacationEnd,
        () => {
          this.props.saveProfileProperty({
            key: 'profile-vacation-end',
            value: this.state.profileVacationEnd ? this.state.profileVacationEnd.toISOString() : null,
            success: executor.succeeded,
            fail: executor.failed,
          });
        }
      ).addAction(
        !this.props.status.isStudent && (this.props.profile.properties['communicator-auto-reply'] || "") !== this.state.vacationAutoReply,
        () => {
          this.props.saveProfileProperty({
            key: 'communicator-auto-reply',
            value: this.state.vacationAutoReply,
            success: executor.succeeded,
            fail: executor.failed,
          });
        }
      ).addAction(
        !this.props.status.isStudent && (this.props.profile.properties['communicator-auto-reply-subject'] || "") !== this.state.vacationAutoReplySubject,
        () => {
          this.props.saveProfileProperty({
            key: 'communicator-auto-reply-subject',
            value: this.state.vacationAutoReplySubject,
            success: executor.succeeded,
            fail: executor.failed,
          });
        }
      ).addAction(
        !this.props.status.isStudent && (this.props.profile.properties['communicator-auto-reply-msg'] || "") !== this.state.vacationAutoReplyMsg,
        () => {
          this.props.saveProfileProperty({
            key: 'communicator-auto-reply-msg',
            value: this.state.vacationAutoReplyMsg,
            success: executor.succeeded,
            fail: executor.failed,
          });
        }
      ).onAllSucceed(() => {
        this.props.displayNotification(this.props.i18n.text.get("plugin.profile.properties.saved"), 'success')
      }).onOneFails(() => {
        this.props.displayNotification(this.props.i18n.text.get("plugin.profile.properties.failed"), 'error');
      });
  }

  public render() {
    if (this.props.profile.location !== "vacation") {
      return null;
    }

    return <div className="profile-element">
      <section>
        <h3 className="profile-element__sub-title">{this.props.i18n.text.get('plugin.profile.titles.vacationSettings')}</h3>
        <div className="profile-element__item form-element">
          <label htmlFor="profileVacationStart" className="profile-element__label">{this.props.i18n.text.get('plugin.profile.awayStartDate.label')}</label>
          <DatePicker id="profileVacationStart" className="form-element__input" onChange={this.handleDateChange.bind(this, "profileVacationStart")}
            maxDate={this.state.profileVacationEnd || null}
            locale={this.props.i18n.time.getLocale()} selected={this.state.profileVacationStart} />
        </div>
        <div className="profile-element__item form-element">
          <label htmlFor="profileVacationEnd" className="profile-element__label">{this.props.i18n.text.get('plugin.profile.awayEndDate.label')}</label>
          <DatePicker id="profileVacationEnd" className="form-element__input" onChange={this.handleDateChange.bind(this, "profileVacationEnd")}
            minDate={this.state.profileVacationStart || null}
            locale={this.props.i18n.time.getLocale()} selected={this.state.profileVacationEnd} />
        </div>

        <div className={`profile-element__item profile-element__item--additional-info ${!this.state.profileVacationStart || !this.state.profileVacationEnd ? "NON-ACTIVE" : ""} form-element`}>
          <div className="profile-element__check-option-container">
            <input
              checked={this.state.vacationAutoReply === "ENABLED" ? true : false}
              value={this.state.vacationAutoReply}
              id="profileVacationAutoReply" type="checkbox"
              onChange={this.onVacationAutoReplyChange} />
            <label htmlFor="profileVacationAutoReply" className="profile-element__label">{this.props.i18n.text.get('plugin.profile.vacationAutoReply.label')}</label>
          </div>
          <div className="profile-element__description">{this.props.i18n.text.get('plugin.profile.vacationAutoReply.description')}</div>
        </div>

        {this.state.vacationAutoReply === "ENABLED" &&
          <div className={`profile-element__item profile-element__item--additional-info ${!this.state.profileVacationStart || !this.state.profileVacationEnd ? "NON-ACTIVE" : ""} form-element`}>
            <label htmlFor="profileVacationAutoReplySubject" className="profile-element__label">{this.props.i18n.text.get('plugin.profile.vacationAutoReplySubject.label')}</label>
            <input
              className="form-element__input form-element__input--profile-auto-reply" id="profileVacationAutoReplySubject"
              type="text"
              onChange={this.onVacationAutoReplySubjectChange}
              value={this.state.vacationAutoReplySubject}></input>
          </div>}

        {this.state.vacationAutoReply === "ENABLED" &&
          <div className={`profile-element__item profile-element__item--additional-info ${!this.state.profileVacationStart || !this.state.profileVacationEnd ? "NON-ACTIVE" : ""} form-element`}>
            <label htmlFor="profileVacationAutoReplyMsg" className="profile-element__label">{this.props.i18n.text.get('plugin.profile.vacationAutoReplyMsg.label')}</label>
            <textarea
              className="form-element__textarea form-element__textarea--profile-auto-reply" id="profileVacationAutoReplyMsg"
              onChange={this.onVacationAutoReplyMsgChange}
              value={this.state.vacationAutoReplyMsg}></textarea>
          </div>}

      </section>

      <div className="profile-element__item">
        <Button buttonModifiers="primary-function-save" onClick={this.save}>{this.props.i18n.text.get('plugin.profile.save.button')}</Button>
      </div>
    </div>;
  }
}

function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    profile: state.profile,
    status: state.status,
  }
};

function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators({ saveProfileProperty, displayNotification, updateProfileChatSettings }, dispatch);
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VacationSettings);