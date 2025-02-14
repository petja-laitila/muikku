import * as React from "react";
import AnimateHeight from "react-animate-height";
import { connect, Dispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { AnyActionType } from "~/actions";
import ApplicationList, {
  ApplicationListItem,
  ApplicationListItemBody,
  ApplicationListItemHeader,
} from "~/components/general/application-list";
import CkeditorContentLoader from "../../../../base/ckeditor-loader/content";
import { StateType } from "~/reducers";
import { i18nType } from "~/reducers/base/i18n";
import { useJournalComments } from "../assignments-and-diaries/hooks/useJournalComments";
import {
  displayNotification,
  DisplayNotificationTriggerType,
} from "~/actions/base/notifications";
import { WorkspaceJournalType } from "~/reducers/workspaces/journals";
import JournalComment from "./journalComment";

/**
 * JournalProps
 */
interface JournalProps {
  i18n: i18nType;
  displayNotification: DisplayNotificationTriggerType;
  journal: WorkspaceJournalType;
  open: boolean;
  onJournalClick: (
    id: number
  ) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

/**
 * Journal Component
 * @param props props
 * @returns JSX.Element
 */
const Journal: React.FC<JournalProps> = (props) => {
  const { i18n, displayNotification, journal, onJournalClick, open } = props;

  const [showComments, setShowComments] = React.useState<boolean>(false);
  const { journalComments, loadJournalComments } = useJournalComments(
    journal.workspaceEntityId,
    journal.id,
    i18n,
    displayNotification
  );

  /**
   * handleShowCommentsClick
   * @param e event
   */
  const handleShowCommentsClick = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    await loadJournalComments();
    setShowComments(!showComments);
  };

  const arrowClass = showComments ? "open" : "closed";

  return (
    <ApplicationListItem className="journal journal--studies" key={journal.id}>
      <ApplicationListItemHeader
        className="application-list__item-header--journal-entry"
        onClick={onJournalClick(journal.id)}
      >
        <div
          className={`application-list__item-header-main application-list__item-header-main--journal-entry ${
            journal.isMaterialField
              ? "application-list__item-header-main--journal-entry-mandatory"
              : ""
          }`}
        >
          <span className="application-list__item-header-main-content application-list__item-header-main-content--journal-entry-title-in-studies">
            {journal.title}
          </span>
        </div>
        <div className="application-list__item-header-aside">
          <span>{i18n.time.format(journal.created, "L LT")}</span>
        </div>
      </ApplicationListItemHeader>
      <ApplicationListItemBody className="application-list__item-body">
        <AnimateHeight height={open ? "auto" : 0}>
          <article className="application-list__item-content-body application-list__item-content-body--journal-entry rich-text">
            <CkeditorContentLoader html={journal.content} />
          </article>

          <div
            onClick={handleShowCommentsClick}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className={`icon-arrow-right ${arrowClass}`} />
            <div className="evaluation-modal__item-subheader-title evaluation-modal__item-subheader-title--journal-comment">
              {i18n.text.get("plugin.records.journal.comments.title")} (
              {journal.commentCount})
            </div>
          </div>

          <AnimateHeight height={showComments ? "auto" : 0}>
            {journalComments.isLoading ? (
              <div className="loader-empty" />
            ) : journalComments.journalComments.length === 0 ? (
              <div className="empty">
                <span>
                  {i18n.text.get("plugin.records.journal.comments.empty")}
                </span>
              </div>
            ) : (
              <ApplicationList>
                {journalComments.journalComments.map((c) => (
                  <JournalComment key={c.id} {...c} />
                ))}
              </ApplicationList>
            )}
          </AnimateHeight>
        </AnimateHeight>
      </ApplicationListItemBody>
    </ApplicationListItem>
  );
};

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({ displayNotification }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Journal);
