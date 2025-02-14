import * as moment from "moment";
import * as React from "react";
import { HistoryEntry } from "~/@types/pedagogy-form";
import Avatar from "~/components/general/avatar";
import { StatusType } from "~/reducers/base/status";
import "~/sass/elements/hops.scss";
import { formFieldsWithTranslation } from "./helpers";

/**
 * HopsHistoryProps
 */
interface HistoryProps {}

/**
 * HopsHistory
 * @param props props
 */
export const History: React.FC<HistoryProps> = (props) => (
  <div className="hops-container__history">{props.children}</div>
);

/**
 * HopsHistoryEventProps
 */
interface HistoryEntryItemProps {
  historyEntry: HistoryEntry;
  showEdit: boolean;
  status: StatusType;
}

/**
 * HopsHistoryEvent
 * @param props props
 */
export const HistoryEntryItem: React.FC<HistoryEntryItemProps> = (props) => {
  const { status, historyEntry } = props;

  const viewingOwnHistorEvent = status.userId === historyEntry.modifierId;

  const editedFields =
    historyEntry?.editedFields?.map((field) => (
      <li key={field} style={{ display: "list-item" }}>
        <span>{formFieldsWithTranslation[field]}</span>
      </li>
    )) || null;

  return (
    <>
      {viewingOwnHistorEvent ? (
        <div className="hops-container__history-event hops-container__history-event--created-by-me">
          <div className="hops-container__history-event-primary">
            <span className="hops-container__history-event-text">
              Muokkasit pedagogisen tuen suunnitelmaa
            </span>
            <span className="hops-container__history-event-date">
              {moment(historyEntry.date).format("l")}
            </span>
          </div>

          {historyEntry.details && (
            <>
              <div className="hops-container__history-event-secondary">
                <span>{historyEntry.details}</span>
              </div>
              {editedFields && (
                <div className="hops-container__history-event-secondary">
                  <div>
                    <label className="hops__label">Muokatut kentät</label>
                    <ul>{editedFields}</ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="hops-container__history-event hops-container__history-event--created-by-other">
          <div className="hops-container__history-event-primary">
            <span className="hops-container__history-event-author">
              <Avatar
                id={historyEntry.modifierId}
                firstName={historyEntry.modifierName}
                hasImage={historyEntry.modifierHasAvatar}
                size="small"
              />
              <span className="hops-container__history-event-author-name">
                {historyEntry.modifierName}
              </span>
            </span>
            <span className="hops-container__history-event-text">
              muokkasi pedagogisen tuen suunnitelmaa
            </span>
            <span className="hops-container__history-event-date">
              {moment(historyEntry.date).format("l")}
            </span>
          </div>

          {historyEntry.details && (
            <>
              <div className="hops-container__history-event-secondary">
                <span>{historyEntry.details}</span>
              </div>
              {editedFields && (
                <div className="hops-container__history-event-secondary">
                  <div>
                    <label className="hops__label">Muokatut kentät</label>
                    <ul>{editedFields}</ul>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
