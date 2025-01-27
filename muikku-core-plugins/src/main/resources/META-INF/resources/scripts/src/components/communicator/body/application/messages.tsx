import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { colorIntToHex, getName } from "~/util/modifiers";
import { i18nType } from "~/reducers/base/i18n";
import { StateType } from "~/reducers";
import "~/sass/elements/empty.scss";
import "~/sass/elements/loaders.scss";
import "~/sass/elements/application-list.scss";
import "~/sass/elements/label.scss";
import "~/sass/elements/message.scss";
import "~/sass/elements/form.scss";
import "~/sass/elements/wcag.scss";
import BodyScrollLoader from "~/components/general/body-scroll-loader";
import BodyScrollKeeper from "~/components/general/body-scroll-keeper";
import SelectableList from "~/components/general/selectable-list";
import {
  loadMoreMessageThreads,
  removeFromMessagesSelectedThreads,
  addToMessagesSelectedThreads,
  LoadMoreMessageThreadsTriggerType,
  RemoveFromMessagesSelectedThreadsTriggerType,
  AddToMessagesSelectedThreadsTriggerType,
} from "~/actions/main-function/messages";
import {
  MessageThreadListType,
  MessagesStateType,
  MessageThreadExpandedType,
  MessageThreadType,
  MessagesType,
  MessageSearchResult,
} from "~/reducers/main-function/messages";
import ApplicationList, {
  ApplicationListItemContentWrapper,
  ApplicationListItemHeader,
  ApplicationListItemBody,
  ApplicationListItemFooter,
  ApplicationListItem,
} from "~/components/general/application-list";
import { StatusType } from "~/reducers/base/status";
import InfoPopover from "~/components/general/info-popover";
import Dropdown from "~/components/general/dropdown";

/**
 * CommunicatorMessagesProps
 */
interface CommunicatorMessagesProps {
  threads: MessageThreadListType;
  hasMore: boolean;
  state: MessagesStateType;
  searchMessages: MessageSearchResult[];
  selectedThreads: MessageThreadListType;
  selectedThreadsIds: Array<number>;
  currentThread: MessageThreadExpandedType;
  messages: MessagesType;

  loadMoreMessageThreads: LoadMoreMessageThreadsTriggerType;
  removeFromMessagesSelectedThreads: RemoveFromMessagesSelectedThreadsTriggerType;
  addToMessagesSelectedThreads: AddToMessagesSelectedThreadsTriggerType;

  i18n: i18nType;
  status: StatusType;
}

/**
 * CommunicatorMessagesState
 */
interface CommunicatorMessagesState {}

/**
 * CommunicatorMessages
 */
class CommunicatorMessages extends BodyScrollLoader<
  CommunicatorMessagesProps,
  CommunicatorMessagesState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: CommunicatorMessagesProps) {
    super(props);

    this.getThreadUserNames = this.getThreadUserNames.bind(this);
    this.setCurrentThread = this.setCurrentThread.bind(this);

    //once this is in state READY only then a loading more event can be triggered
    this.statePropertyLocation = "state";
    //it will only call the function if this is true
    this.hasMorePropertyLocation = "hasMore";
    //this is the function that will be called
    this.loadMoreTriggerFunctionLocation = "loadMoreMessageThreads";
    //abort if this is true (in this case it causes the current element to be invisible)
    this.cancellingLoadingPropertyLocation = "currentThread";
  }

  /**
   * getThreadUserNames
   * @param thread thread
   * @param userId userId
   */
  getThreadUserNames(thread: MessageThreadType, userId: number): any {
    if (thread.senderId !== userId || !thread.recipients) {
      if (thread.senderId === userId) {
        return (
          <span>
            {this.props.i18n.text.get("plugin.communicator.sender.self")}
          </span>
        );
      }
      if (thread.sender.archived === true) {
        return (
          <span className="message__user-archived">
            {this.props.i18n.text.get("plugin.communicator.sender.archived")}
          </span>
        );
      }

      let name = `${getName(thread.sender, !this.props.status.isStudent)}`;

      if (thread.sender.studyProgrammeName) {
        name = `${getName(thread.sender, !this.props.status.isStudent)} (${
          thread.sender.studyProgrammeName
        })`;
      }

      if (thread.sender.studiesEnded === true) {
        return (
          <InfoPopover userId={thread.sender.userEntityId}>
            <span className="message__user-studies-ended">{name}</span>
          </InfoPopover>
        );
      }
      return (
        <InfoPopover userId={thread.sender.userEntityId}>
          <span>{name}</span>
        </InfoPopover>
      );
    }

    const messageRecipientsList = thread.recipients.map((recipient) => {
      if (recipient.userEntityId === userId) {
        return (
          <span key={recipient.recipientId}>
            {this.props.i18n.text.get("plugin.communicator.sender.self")}
          </span>
        );
      }
      if (recipient.archived === true) {
        return (
          <span key={recipient.recipientId} className="message__user-archived">
            {this.props.i18n.text.get("plugin.communicator.sender.archived")}
          </span>
        );
      }

      const name = getName(recipient as any, !this.props.status.isStudent);

      if (recipient.studiesEnded === true) {
        return (
          <InfoPopover
            key={recipient.recipientId}
            userId={recipient.recipientId}
          >
            <span
              className="message__user-studies-ended"
              key={recipient.recipientId}
            >
              {name}
            </span>
          </InfoPopover>
        );
      }
      return (
        <InfoPopover key={recipient.recipientId} userId={recipient.recipientId}>
          <span key={recipient.recipientId}>{name}</span>
        </InfoPopover>
      );
    });

    const userGroupRecipientsList = thread.userGroupRecipients.map((group) => (
      <span key={group.id}>{group.name}</span>
    ));

    const workspaceRecipientsList = thread.workspaceRecipients
      .filter(
        (w, pos, self) =>
          self.findIndex(
            (w2) => w2.workspaceEntityId === w.workspaceEntityId
          ) === pos
      )
      .map((workspace) => {
        let workspaceName = workspace.workspaceName;

        if (workspace.workspaceExtension) {
          workspaceName += ` (${workspace.workspaceExtension})`;
        }

        return <span key={workspace.workspaceEntityId}>{workspaceName}</span>;
      });

    return [
      messageRecipientsList,
      userGroupRecipientsList,
      workspaceRecipientsList,
    ];
  }

  /**
   * setCurrentThread
   * @param threadOrSearchResult threadOrSearchResult
   */
  setCurrentThread(
    threadOrSearchResult: MessageThreadType | MessageSearchResult
  ) {
    window.location.hash =
      window.location.hash.split("/")[0] +
      "/" +
      threadOrSearchResult.communicatorMessageId;
  }

  /**
   * render
   */
  render() {
    if (this.props.state === "LOADING") {
      return null;
    } else if (this.props.state === "ERROR") {
      //TODO: put a translation here please! this happens when messages fail to load, a notification shows with the error
      //message but here we got to put something
      return (
        <div className="empty">
          <span>{"ERROR"}</span>
        </div>
      );
    } else if (
      this.props.threads.length === 0 &&
      !this.props.currentThread &&
      !this.props.searchMessages
    ) {
      return (
        <div className="empty">
          <span>
            {this.props.i18n.text.get("plugin.communicator.empty.topic")}
          </span>
        </div>
      );
    }

    if (this.props.searchMessages) {
      return (
        <BodyScrollKeeper hidden={!!this.props.currentThread}>
          {this.props.searchMessages.map((message) => {
            // Lets set the correct messageFolder string based on which folrder the message belongs to
            let messageFolder;
            if (message.folder === "INBOX") {
              messageFolder = this.props.i18n.text.get(
                "plugin.communicator.category.title.inbox"
              );
            } else if (message.folder === "SENT") {
              messageFolder = this.props.i18n.text.get(
                "plugin.communicator.category.title.sent"
              );
            } else {
              messageFolder = this.props.i18n.text.get(
                "plugin.communicator.category.title.trash"
              );
            }

            let senderName = `${message.sender.firstName} ${
              message.sender.nickName ? message.sender.nickName : ""
            } ${message.sender.lastName}`;

            if (message.sender.studyProgrammeName) {
              senderName = `${message.sender.firstName} ${
                message.sender.nickName ? message.sender.nickName : ""
              } ${message.sender.lastName} (${
                message.sender.studyProgrammeName
              })`;
            }

            return (
              <ApplicationListItem
                key={message.id}
                className={`message message--search-result ${
                  !message.readByReceiver
                    ? "application-list__item--highlight"
                    : ""
                }`}
                onClick={this.setCurrentThread.bind(this, message)}
              >
                <ApplicationListItemHeader modifiers="communicator-message">
                  <div className={`application-list__header-primary`}>
                    <span className="application-list__header-primary-sender">
                      {senderName}
                    </span>
                    <span className="application-list__header-recipients">
                      {message.recipients.map((recipient) => (
                        <span
                          className="application-list__header-recipient"
                          key={recipient.userEntityId}
                        >
                          {getName(
                            recipient as any,
                            !this.props.status.isStudent
                          )}
                        </span>
                      ))}
                      {message.userGroupRecipients.map((userGroupRecepient) => (
                        <span
                          className="application-list__header-recipient"
                          key={userGroupRecepient.id}
                        >
                          {userGroupRecepient.name}
                        </span>
                      ))}
                      {message.workspaceRecipients.map((workspaceRecepient) => {
                        let workspaceName = workspaceRecepient.workspaceName;

                        if (workspaceRecepient.workspaceExtension) {
                          workspaceName += ` (${workspaceRecepient.workspaceExtension})`;
                        }

                        return (
                          <span
                            className="application-list__header-recipient"
                            key={workspaceRecepient.workspaceEntityId}
                          >
                            {workspaceName}
                          </span>
                        );
                      })}
                    </span>
                  </div>
                  <Dropdown
                    alignSelfVertically="top"
                    openByHover
                    content={
                      <p>
                        {`${this.props.i18n.time.format(
                          message.created
                        )} klo ${this.props.i18n.time.format(
                          message.created,
                          "LT"
                        )}`}
                      </p>
                    }
                  >
                    <div className="application-list__header-item-date">
                      {this.props.i18n.time.format(message.created)}
                    </div>
                  </Dropdown>
                </ApplicationListItemHeader>
                <ApplicationListItemBody modifiers="communicator-message">
                  <span className="application-list__header-item-body">
                    {message.caption}
                  </span>
                </ApplicationListItemBody>
                <ApplicationListItemFooter modifiers="communicator-message-labels">
                  <div className="labels">
                    {message.folder && message.folder.length ? (
                      <div className="labels__wrapper">
                        <span className="label label--folder">
                          <span className="label__text">{messageFolder}</span>
                        </span>
                      </div>
                    ) : null}
                    {message.labels.length ? (
                      <div className="labels__wrapper">
                        {message.labels.map((label) => (
                          <span className="label" key={label.id}>
                            <span
                              className="label__icon icon-tag"
                              style={{
                                color: colorIntToHex(label.labelColor),
                              }}
                            ></span>
                            <span className="label__text">
                              {label.labelName}
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </ApplicationListItemFooter>
              </ApplicationListItem>
            );
          })}
        </BodyScrollKeeper>
      );
    }

    return (
      <BodyScrollKeeper hidden={!!this.props.currentThread}>
        <SelectableList
          as={ApplicationList}
          selectModeModifiers="select-mode"
          extra={
            this.props.state === "LOADING_MORE" ? (
              <div className="application-list__item loader-empty" />
            ) : null
          }
          dataState={this.props.state}
        >
          {this.props.threads.map((thread, index: number) => {
            const isSelected: boolean = this.props.selectedThreadsIds.includes(
              thread.communicatorMessageId
            );
            return {
              as: ApplicationListItem,
              className: `message ${
                thread.unreadMessagesInThread
                  ? "application-list__item--highlight"
                  : ""
              }`,
              onSelect: this.props.addToMessagesSelectedThreads.bind(
                null,
                thread
              ),
              onDeselect: this.props.removeFromMessagesSelectedThreads.bind(
                null,
                thread
              ),
              onEnter: this.setCurrentThread.bind(this, thread),
              isSelected,
              key: thread.communicatorMessageId,
              wcagLabel: thread.unreadMessagesInThread
                ? this.props.i18n.text.get(
                    "plugin.wcag.messageUnread.aria.label"
                  )
                : null,
              checkboxId: `messageSelect-${index}`,
              /**
               * contents
               * @param checkbox checkbox
               */
              contents: (checkbox: React.ReactElement<any>) => (
                <ApplicationListItemContentWrapper
                  aside={
                    <div className="form-element form-element--item-selection-container">
                      <label
                        htmlFor={`messageSelect-` + index}
                        className="visually-hidden"
                      >
                        {this.props.i18n.text.get(
                          "plugin.wcag.messageSelect.label"
                        )}
                      </label>
                      {checkbox}
                    </div>
                  }
                >
                  <ApplicationListItemHeader modifiers="communicator-message">
                    <div
                      className={`application-list__header-primary ${
                        thread.unreadMessagesInThread
                          ? "application-list__header-primary--highlight"
                          : ""
                      }`}
                    >
                      <span
                        className="message__recipients"
                        aria-label={this.props.i18n.text.get(
                          "plugin.wcag.messageSender.aria.label"
                        )}
                      >
                        {this.getThreadUserNames(
                          thread,
                          this.props.status.userId
                        )}
                      </span>
                    </div>
                    {thread.messageCountInThread > 1 ? (
                      <div
                        className="application-list__item-counter"
                        aria-label={this.props.i18n.text.get(
                          "plugin.wcag.messageCount.aria.label"
                        )}
                      >
                        {thread.messageCountInThread}
                      </div>
                    ) : null}

                    <Dropdown
                      alignSelfVertically="top"
                      openByHover
                      content={
                        <p>
                          {`${this.props.i18n.time.format(
                            thread.threadLatestMessageDate
                          )} klo ${this.props.i18n.time.format(
                            thread.threadLatestMessageDate,
                            "LT"
                          )}`}
                        </p>
                      }
                    >
                      <div
                        className="application-list__header-item-date"
                        aria-label={this.props.i18n.text.get(
                          "plugin.wcag.messageSendDate.aria.label"
                        )}
                      >
                        {`${this.props.i18n.time.format(
                          thread.threadLatestMessageDate
                        )}`}
                      </div>
                    </Dropdown>
                  </ApplicationListItemHeader>
                  <ApplicationListItemBody modifiers="communicator-message">
                    <span
                      className="application-list__header-item-body"
                      aria-label={this.props.i18n.text.get(
                        "plugin.wcag.messageBody.aria.label"
                      )}
                    >
                      {thread.caption}
                    </span>
                  </ApplicationListItemBody>
                  {thread.labels.length ? (
                    <ApplicationListItemFooter modifiers="communicator-message-labels">
                      <div className="labels">
                        {thread.labels.map((label) => (
                          <span
                            className="label"
                            key={label.id}
                            aria-label={this.props.i18n.text.get(
                              "plugin.wcag.messageLabel.aria.label"
                            )}
                          >
                            <span
                              className="label__icon icon-tag"
                              style={{
                                color: colorIntToHex(label.labelColor),
                              }}
                            ></span>
                            <span className="label__text">
                              {label.labelName}
                            </span>
                          </span>
                        ))}
                      </div>
                    </ApplicationListItemFooter>
                  ) : null}
                </ApplicationListItemContentWrapper>
              ),
            };
          })}
        </SelectableList>
      </BodyScrollKeeper>
    );
  }
}

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    threads: state.messages.threads,
    searchMessages: state.messages.searchMessages,
    hasMore: state.messages.hasMore,
    state: state.messages.state,
    selectedThreads: state.messages.selectedThreads,
    selectedThreadsIds: state.messages.selectedThreadsIds,
    currentThread: state.messages.currentThread,
    messages: state.messages,
    i18n: state.i18n,
    status: state.status,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<any>) {
  return bindActionCreators(
    {
      loadMoreMessageThreads,
      removeFromMessagesSelectedThreads,
      addToMessagesSelectedThreads,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CommunicatorMessages);
