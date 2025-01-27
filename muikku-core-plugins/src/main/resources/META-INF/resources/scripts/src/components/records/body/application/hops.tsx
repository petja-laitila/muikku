import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import "~/sass/elements/empty.scss";
import "~/sass/elements/loaders.scss";
import "~/sass/elements/form.scss";
import "~/sass/elements/application-panel.scss";
import "~/sass/elements/empty.scss";
import { RecordsType } from "~/reducers/main-function/records";
import HopsGraph from "~/components/base/hops_editable";
import { SetHopsToTriggerType, setHopsTo } from "~/actions/main-function/hops";
import { bindActionCreators } from "redux";
import { HOPSDataType, HOPSType } from "~/reducers/main-function/hops";
import { StateType } from "~/reducers";
import { StatusType } from "~/reducers/base/status";
import CompulsoryEducationHopsWizard from "../../../general/hops-compulsory-education-wizard";
import { AnyActionType } from "~/actions";

/**
 * HopsProps
 */
interface HopsProps {
  i18n: i18nType;
  records: RecordsType;
  status: StatusType;
  hops: HOPSType;
  setHopsTo: SetHopsToTriggerType;
}

/**
 * HopsState
 */
interface HopsState {}

/**
 * Hops
 */
class Hops extends React.Component<HopsProps, HopsState> {
  timeout: NodeJS.Timer;

  /**
   * constructor
   * @param props props
   */
  constructor(props: HopsProps) {
    super(props);

    this.setHopsToWithDelay = this.setHopsToWithDelay.bind(this);
  }

  /**
   * setHopsToWithDelay
   * @param hops hops
   */
  setHopsToWithDelay(hops: HOPSDataType) {
    clearTimeout(this.timeout);
    this.timeout = setTimeout(
      this.props.setHopsTo.bind(null, hops),
      1000
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
  }

  /**
   * renderUpperSecondaryHops
   * @returns JSX.Element
   */
  renderUpperSecondaryHops = () => (
    <section>
      <h2 className="application-panel__content-header">
        {this.props.i18n.text.get("plugin.records.hops.title")}
      </h2>
      <HopsGraph onHopsChange={this.setHopsToWithDelay} />
    </section>
  );

  /**
   * renderHops
   * @returns JSX.Element
   */
  renderHops = () => {
    if (
      this.props.hops.hopsPhase === null ||
      this.props.hops.hopsPhase === "0"
    ) {
      return (
        <div className="empty">
          <span>Hopsia ei ole aktivoitu ohjaajan toimesta!</span>
        </div>
      );
    }

    return (
      <CompulsoryEducationHopsWizard
        user="student"
        usePlace="studies"
        studentId={this.props.status.userSchoolDataIdentifier}
        phase={parseInt(this.props.hops.hopsPhase)}
        disabled={false}
        superVisorModifies={false}
      />
    );
  };

  /**
   * Component render method
   * @returns JSX.Element
   */
  render() {
    if (this.props.records.location !== "hops") {
      return null;
    } else if (this.props.hops.status === "ERROR") {
      // TODO: put a translation here please! this happens when messages fail to load, a notification shows with the error
      // message but here we got to put something
      return (
        <div className="empty">
          <span>{"ERROR"}</span>
        </div>
      );
    } else if (this.props.hops.status !== "READY") {
      return null;
    }

    if (
      this.props.hops.eligibility &&
      this.props.hops.eligibility.upperSecondarySchoolCurriculum
    ) {
      return this.renderUpperSecondaryHops();
    }

    return this.renderHops();
  }
}

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    records: (state as any).records,
    hops: state.hops,
    status: state.status,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({ setHopsTo }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Hops);
