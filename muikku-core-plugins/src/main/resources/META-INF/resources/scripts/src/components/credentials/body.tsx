import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import { CredentialsType } from "~/reducers/base/credentials";
import ReturnCredentials from "./body/return-credentials";
import CredentialsContainer from "./body/credentials-container";
import CredentialsHero from "./body/credentials-hero";
import { StateType } from "~/reducers";

/**
 * CredentialsBodyProps
 */
interface CredentialsBodyProps {
  i18n: i18nType;
  credentials: CredentialsType;
}

/**
 * CredentialsBodyState
 */
interface CredentialsBodyState {}

/**
 * CredentialsBody
 */
class CredentialsBody extends React.Component<
  CredentialsBodyProps,
  CredentialsBodyState
> {
  /**
   * render
   */
  render() {
    return (
      <div className="credentials">
        <CredentialsHero i18n={this.props.i18n} />
        <CredentialsContainer i18n={this.props.i18n}>
          <ReturnCredentials credentials={this.props.credentials} />
        </CredentialsContainer>
      </div>
    );
  }
}

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    credentials: state.credentials,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(CredentialsBody);
