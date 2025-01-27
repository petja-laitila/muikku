import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { i18nType } from "~/reducers/base/i18n";
import * as queryString from "query-string";
import "~/sass/elements/buttons.scss";
import "~/sass/elements/form.scss";
import "~/sass/elements/wcag.scss";
import { StateType } from "~/reducers";
import {
  ApplicationPanelToolbar,
  ApplicationPanelToolbarActionsMain,
  ApplicationPanelToolsContainer,
} from "~/components/general/application-panel/application-panel";
import { WorkspacesType } from "~/reducers/workspaces";
import { SearchFormElement } from "~/components/general/form-element";

/**
 * CoursepickerToolbarProps
 */
interface CoursepickerToolbarProps {
  i18n: i18nType;
  workspaces: WorkspacesType;
}

/**
 * CoursepickerToolbarState
 */
interface CoursepickerToolbarState {
  searchquery: string;
  focused: boolean;
}

/**
 * CoursepickerToolbar
 */
class CoursepickerToolbar extends React.Component<
  CoursepickerToolbarProps,
  CoursepickerToolbarState
> {
  private focused: boolean;
  /**
   * constructor
   * @param props props
   */
  constructor(props: CoursepickerToolbarProps) {
    super(props);

    this.state = {
      searchquery: this.props.workspaces.activeFilters.query || "",
      focused: false,
    };

    this.updateSearchWithQuery = this.updateSearchWithQuery.bind(this);
    this.onInputFocus = this.onInputFocus.bind(this);
    this.onInputBlur = this.onInputBlur.bind(this);
    this.focused = false;
  }

  /**
   * componentWillReceiveProps
   * @param nextProps nextProps
   */
  componentWillReceiveProps(nextProps: CoursepickerToolbarProps) {
    if (
      !this.focused &&
      (nextProps.workspaces.activeFilters.query || "") !==
        this.state.searchquery
    ) {
      this.setState({
        searchquery: nextProps.workspaces.activeFilters.query || "",
      });
    }
  }

  /**
   * updateSearchWithQuery
   * @param query query
   */
  updateSearchWithQuery(query: string) {
    this.setState({
      searchquery: query,
    });
    const locationData = queryString.parse(
      document.location.hash.split("?")[1] || "",
      { arrayFormat: "bracket" }
    );
    locationData.q = query;
    window.location.hash =
      "#?" + queryString.stringify(locationData, { arrayFormat: "bracket" });
  }

  /**
   * onInputFocus
   */
  onInputFocus() {
    this.setState({ focused: true });
  }

  /**
   * onInputBlur
   */
  onInputBlur() {
    this.setState({ focused: false });
  }

  /**
   * render
   */
  render() {
    return (
      <ApplicationPanelToolbar>
        <ApplicationPanelToolbarActionsMain>
          <ApplicationPanelToolsContainer>
            <SearchFormElement
              updateField={this.updateSearchWithQuery}
              name="workspace-search"
              id="searchCourses"
              onFocus={this.onInputFocus}
              onBlur={this.onInputBlur}
              placeholder={this.props.i18n.text.get(
                "plugin.coursepicker.search.placeholder"
              )}
              value={this.state.searchquery}
            />
          </ApplicationPanelToolsContainer>
        </ApplicationPanelToolbarActionsMain>
      </ApplicationPanelToolbar>
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
    workspaces: state.workspaces,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<any>) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CoursepickerToolbar);
