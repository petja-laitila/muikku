import * as React from "react";
import { connect } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import "~/sass/elements/buttons.scss";
import "~/sass/elements/item-list.scss";
import { StateType } from "~/reducers";
import "~/sass/elements/toc.scss";
import "~/sass/elements/label.scss";
import "~/sass/elements/item-list.scss";
import { AnnouncementsState } from "reducers/announcements";

/**
 * OrganizationManagementAsideProps
 */
interface OrganizationManagementAsideProps {
  i18n: i18nType;
  announcements: AnnouncementsState;
}

/**
 * OrganizationManagementAsideState
 */
interface OrganizationManagementAsideState {}

/**
 * OrganizationManagementAside
 */
class OrganizationManagementAside extends React.Component<
  OrganizationManagementAsideProps,
  OrganizationManagementAsideState
> {
  /**
   * render
   */
  render() {
    return <section className="toc"></section>;
  }
}

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    announcements: state.announcements,
  };
}

/**
 * mapDispatchToProps
 */
function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OrganizationManagementAside);
