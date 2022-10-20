import * as React from "react";
import { i18nType } from "~/reducers/base/i18n";
import { StatusType } from "~/reducers/base/status";
import { StateType } from "~/reducers";
import { connect } from "react-redux";
import { Panel } from "~/components/general/panel";

/**
 * Wall properties
 */
export interface WallProps {
  i18n: i18nType;
  status: StatusType;
}

/**
 * Wall component
 * @param props WallProps
 */
const WallPanel: React.FC<WallProps> = (props) => {
  const { i18n, status } = props;
  return (
    <Panel header="Muu" modifier="wall" icon="icon-star-empty">
      <Panel.BodyTitle>Lappusii</Panel.BodyTitle>
      <Panel.BodyContent>Sisällysztä</Panel.BodyContent>
      <Panel.BodyTitle>Lappusii</Panel.BodyTitle>
      <Panel.BodyContent>Sisällysztä</Panel.BodyContent>
      <Panel.BodyTitle>Lappusii</Panel.BodyTitle>
      <Panel.BodyContent>Sisällysztä</Panel.BodyContent>
      <Panel.BodyTitle>Lappusii</Panel.BodyTitle>
      <Panel.BodyContent>Sisällysztä</Panel.BodyContent>
      <Panel.BodyTitle>Lappusii</Panel.BodyTitle>
      <Panel.BodyContent>Sisällysztä</Panel.BodyContent>
    </Panel>
  );
};

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    status: state.status,
    i18n: state.i18n,
  };
}

export default connect(mapStateToProps)(WallPanel);
