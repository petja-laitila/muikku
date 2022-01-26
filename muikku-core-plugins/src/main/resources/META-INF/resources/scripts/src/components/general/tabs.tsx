import "~/sass/elements/tabs.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/scss";
import "swiper/scss/a11y";
import "swiper/scss/pagination";
import { A11y, Pagination } from "swiper";
import { i18nType } from "~/reducers/base/i18n";
import { StateType } from "~/reducers";
import variables from "~/sass/_exports.scss";
import useIsAtBreakpoint from "~/hooks/useIsMobileWidth";

/**
 * Tab
 */
export interface Tab {
  id: string;
  name: string;
  type?: string;
  mobileAction?: JSX.Element | JSX.Element[];
  component: () => JSX.Element;
}
/**
 * TabsProps
 *
 */
interface TabsProps {
  onTabChange: (id: string) => void;
  allTabs: string[];
  activeTab: string;
  modifier?: string;
  i18n: i18nType;
  tabs: Array<Tab>;
  renderAllComponents?: boolean;
  children?: React.ReactNode;
}
/**
 * MobileOnlyTabsProps
 */
interface MobileOnlyTabsProps {
  onTabChange: (id: string) => void;
  activeTab: string;
  modifier?: string;
  tabs: Array<Tab>;
  renderAllComponents?: boolean;
}

/**
 * Tabs
 * @param props
 * @returns JSX.Element
 */
export const Tabs: React.FC<TabsProps> = (props) => {
  const {
    modifier,
    renderAllComponents,
    activeTab,
    onTabChange,
    tabs,
    children,
    allTabs,
  } = props;

  const mobileBreakpoint = parseInt(variables.mobileBreakpoint); //Parse a breakpoint from scss to a number

  let isMobileWidth = useIsAtBreakpoint(mobileBreakpoint);

  const a11yConfig = {
    enabled: true,
  };

  const paginationConfig = {
    el: ".tabs__pagination-container",
    modifierClass: "tabs__pagination-container--",
  };

  const nextSlide = allTabs[allTabs.indexOf(activeTab) + 1];
  const prevSlide = allTabs[allTabs.indexOf(activeTab) - 1];

  return (
    <div className={`tabs ${modifier ? "tabs--" + modifier : ""}`}>
      {isMobileWidth ? (
        <Swiper
          onSlideNextTransitionStart={onTabChange.bind(this, nextSlide)}
          onSlidePrevTransitionStart={onTabChange.bind(this, prevSlide)}
          modules={[A11y, Pagination]}
          a11y={a11yConfig}
          pagination={paginationConfig}
          className="tabs__tab-data-container tabs__tab-data-container--mobile"
        >
          {tabs.map((t: Tab) => (
            <SwiperSlide key={t.id}>
              <div className="tabs__mobile-tab">
                <div className="tabs__pagination-container"> </div>
                <div>{t.name}</div>
                {t.mobileAction ? (
                  t.mobileAction
                ) : (
                  <div className="tabs__mobile-tab-spacer" />
                )}
              </div>
              {t.component()}
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <>
          <div
            className={`tabs__tab-labels ${
              modifier ? "tabs__tab-labels--" + modifier : ""
            }`}
          >
            {tabs.map((tab: Tab) => {
              return (
                <div
                  className={`tabs__tab ${
                    modifier ? "tabs__tab--" + modifier : ""
                  } ${tab.type ? "tabs__tab--" + tab.type : ""} ${
                    tab.id === activeTab ? "active" : ""
                  }`}
                  key={tab.id}
                  onClick={onTabChange.bind(this, tab.id)}
                >
                  {tab.name}
                </div>
              );
            })}
            {children}
          </div>
          <div className="tabs__tab-data-container">
            {tabs
              .filter((t: Tab) => renderAllComponents || t.id === activeTab)
              .map((t: Tab) => (
                <div
                  key={t.id}
                  className={`tabs__tab-data ${
                    t.type ? "tabs__tab-data--" + t.type : ""
                  }  ${t.id === activeTab ? "active" : ""}`}
                >
                  {t.component()}
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Tabs that are only seen in mobile
 * @param props
 * @returns JSX.element
 */

export const MobileOnlyTabs: React.FC<MobileOnlyTabsProps> = (props) => {
  const { tabs, modifier, activeTab, onTabChange, renderAllComponents } = props;

  return (
    <div className="tabs">
      <div className="tabs__tab-labels tabs__tab-labels--mobile">
        {tabs.map((tab, index) => {
          return (
            <div
              className={`tabs__tab tabs__tab--mobile-only-tab ${
                modifier ? "tabs__tab--" + modifier : ""
              } ${tab.type ? "tabs__tab--" + tab.type : ""} ${
                tab.id === activeTab ? "active" : ""
              }`}
              key={tab.id}
              onClick={onTabChange.bind(this, tab.id)}
            >
              {tab.name}
            </div>
          );
        })}
      </div>
      <div className="tabs__tab-labels tabs__tab-labels--desktop">
        {tabs.map((tab, index) => {
          return (
            <div
              className={`tabs__tab tabs__tab--mobile-only-tab ${
                modifier ? "tabs__tab--" + modifier : ""
              } ${tab.type ? "tabs__tab--" + tab.type : ""} ${
                tab.id === activeTab ? "active" : ""
              }`}
              key={tab.id}
              onClick={onTabChange.bind(this, tab.id)}
            >
              {tab.name}
            </div>
          );
        })}
      </div>
      <div className="tabs__tab-data-container tabs__tab-data-container--mobile-tabs">
        {tabs
          .filter((t) => renderAllComponents || t.id === activeTab)
          .map((t) => (
            <div
              key={t.id}
              className={`tabs__tab-data ${
                t.type ? "tabs__tab-data--" + t.type : ""
              }  ${t.id === activeTab ? "active" : ""}`}
            >
              {t.component()}
            </div>
          ))}
      </div>
    </div>
  );
};

/**
 * mapStateToProps
 * @param state
 */

function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
  };
}

export default connect(mapStateToProps)(Tabs);
