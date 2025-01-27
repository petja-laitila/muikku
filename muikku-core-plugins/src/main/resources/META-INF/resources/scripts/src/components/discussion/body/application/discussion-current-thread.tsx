import * as React from "react";
import { i18nType } from "~/reducers/base/i18n";
import {
  DiscussionType,
  DiscussionUserType,
  DiscussionThreadReplyType,
  DiscussionThreadReplyListType,
  DiscussionThreadType,
} from "~/reducers/discussion";
import { Dispatch, connect } from "react-redux";
import Link from "~/components/general/link";
import { IconButton } from "~/components/general/button";
import Dropdown from "~/components/general/dropdown";
import DeleteThreadComponent from "../../dialogs/delete-thread-component";
import { getName } from "~/util/modifiers";
import { StatusType } from "~/reducers/base/status";
import { StateType } from "~/reducers";
import Avatar from "~/components/general/avatar";
import "~/sass/elements/rich-text.scss";
import "~/sass/elements/avatar.scss";
import "~/sass/elements/discussion.scss";
import {
  DiscussionCurrentThreadListContainer,
  DiscussionCurrentThreadElement,
  DiscussionThreadHeader,
  DiscussionThreadBody,
  DiscussionThreadFooter,
} from "./threads/threads";
import ReplyThreadDrawer from "./reply-thread-drawer";
import DiscussionThreadReply from "./discussion-thread-reply";
import ModifyThreadDrawer from "./modify-thread-drawer";
import PagerV2 from "~/components/general/pagerV2";
import { AnyActionType } from "~/actions/index";
import { bindActionCreators } from "redux";
import {
  SubscribeDiscussionThread,
  subscribeDiscussionThread,
  unsubscribeDiscussionThread,
  UnsubscribeDiscustionThread,
} from "~/actions/discussion/index";

/**
 * CurrentThreadProps
 */
interface DiscussionCurrentThreadProps {
  discussion: DiscussionType;
  i18n: i18nType;
  userId: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any;
  status: StatusType;
  subscribeDiscussionThread: SubscribeDiscussionThread;
  unsubscribeDiscussionThread: UnsubscribeDiscustionThread;
}

/**
 * CurrentThreadState
 */
interface DiscussionCurrentThreadState {
  hiddenParentsLists: number[];
  openReplyType?: "answer" | "modify" | "quote";
  openedReplyEditorId?: number;
}

/**
 * CurrentThread
 */
class DiscussionCurrentThread extends React.Component<
  DiscussionCurrentThreadProps,
  DiscussionCurrentThreadState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: DiscussionCurrentThreadProps) {
    super(props);

    this.state = {
      hiddenParentsLists: [],
    };
  }

  /**
   * getToPage
   * @param n n
   */
  getToPage(n: number) {
    const hash = window.location.hash.replace("#", "").split("/");

    const areaId = this.props.discussion.areaId
      ? this.props.discussion.areaId
      : 0;

    const areaString = hash.includes("subs")
      ? "subs"
      : areaId + "/" + this.props.discussion.page;

    window.location.hash =
      areaString +
      "/" +
      this.props.discussion.current.forumAreaId +
      "/" +
      this.props.discussion.current.id +
      "/" +
      n;
  }

  /**
   * onHideShowSubReplies
   * @param parentId parentId
   * Adds or removes parent elements from/to list depending wheter it is already in list.
   */
  onHideShowSubRepliesClick = (parentId: number) => (e: React.MouseEvent) => {
    if (this.state.hiddenParentsLists.includes(parentId)) {
      this.setState({
        hiddenParentsLists: this.state.hiddenParentsLists.filter(
          (id) => id !== parentId
        ),
      });
    } else {
      const updatedList = [...this.state.hiddenParentsLists];

      updatedList.push(parentId);

      this.setState({
        hiddenParentsLists: updatedList,
      });
    }
  };

  /**
   * handleOnReplyClick
   * @param type type
   */
  handleOnReplyClick =
    (type: "answer" | "modify" | "quote") =>
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      this.setState({
        openReplyType: type !== this.state.openReplyType ? type : undefined,
      });
    };

  /**
   * handleOnCancelClick
   */
  handleOnCancelClick = () => {
    this.setState({
      openReplyType: undefined,
    });
  };

  /**
   * handles page changes,
   * sets selected page as currentPage to state
   * @param selectedItem selectedItem
   * @param selectedItem.selected selected
   */
  handlePagerChange = (selectedItem: { selected: number }) =>
    this.getToPage(selectedItem.selected + 1);

  /**
   * handleSubscribeOrUnsubscribeClick
   * @param thread thread
   * @param isSubscribed isSubscribed
   */
  handleSubscribeOrUnsubscribeClick =
    (thread: DiscussionThreadType, isSubscribed: boolean) =>
    (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.stopPropagation();
      if (isSubscribed) {
        this.props.unsubscribeDiscussionThread({
          areaId: thread.forumAreaId,
          threadId: thread.id,
        });
      } else {
        this.props.subscribeDiscussionThread({
          areaId: thread.forumAreaId,
          threadId: thread.id,
        });
      }
    };

  /**
   * render
   * @returns JSX.Element or null
   */
  render() {
    if (!this.props.discussion.current) {
      return null;
    }

    const isSubscribed =
      this.props.discussion.subscribedThreads.findIndex(
        (sThread) => sThread.threadId === this.props.discussion.current.id
      ) !== -1;

    const areaPermissions =
      this.props.permissions.AREA_PERMISSIONS[
        this.props.discussion.current.forumAreaId
      ] || {};

    const userCreator: DiscussionUserType =
      this.props.discussion.current.creator;

    const userCategory =
      this.props.discussion.current.creator.id > 10
        ? (this.props.discussion.current.creator.id % 10) + 1
        : this.props.discussion.current.creator.id;

    let avatar;

    if (!userCreator) {
      //This is what it shows when the user is not ready
      avatar = <div className="avatar avatar--category-1"></div>;
    } else {
      //This is what it shows when the user is ready
      avatar = (
        <Avatar
          key={userCreator.id}
          id={userCreator.id}
          firstName={userCreator.firstName}
          hasImage={userCreator.hasImage}
          userCategory={userCategory}
          avatarAriaLabel={this.props.i18n.text.get(
            "plugin.wcag.userAvatar.label"
          )}
        />
      );
    }

    const student: boolean = this.props.status.isStudent === true;
    const threadOwner: boolean =
      this.props.userId === this.props.discussion.current.creator.id;
    const canRemoveThread: boolean =
      (!student && threadOwner) ||
      areaPermissions.removeThread ||
      this.props.permissions.WORKSPACE_DELETE_FORUM_THREAD;
    let studentCanRemoveThread: boolean = threadOwner ? true : false;
    const canEditThread: boolean = threadOwner || areaPermissions.editMessages;
    const threadLocked: boolean = this.props.discussion.current.locked === true;
    const replies: DiscussionThreadReplyListType =
      this.props.discussion.currentReplies;

    // If the thread has someone elses messages, student can't remove the thread

    if (studentCanRemoveThread == true) {
      for (let i = 0; i < replies.length; i++) {
        if (this.props.userId !== replies[i].creator.id) {
          studentCanRemoveThread = false;
        }
      }
    }

    return (
      <DiscussionCurrentThreadListContainer
        sticky={this.props.discussion.current.sticky}
        locked={this.props.discussion.current.locked}
        title={
          <h2 className="application-list__title">
            <span className="application-list__title-main">
              {this.props.discussion.current.title}
            </span>
            <span className="application-list__title-aside">
              {isSubscribed ? (
                <Dropdown
                  openByHover
                  modifier="discussion-tooltip"
                  content={this.props.i18n.text.get(
                    "plugin.discussion.unsubscribe.thread"
                  )}
                >
                  <IconButton
                    icon="bookmark-full"
                    onClick={this.handleSubscribeOrUnsubscribeClick(
                      this.props.discussion.current,
                      true
                    )}
                    buttonModifiers={["discussion-action-active"]}
                  />
                </Dropdown>
              ) : (
                <Dropdown
                  openByHover
                  modifier="discussion-tooltip"
                  content={this.props.i18n.text.get(
                    "plugin.discussion.subscribe.thread"
                  )}
                >
                  <IconButton
                    icon="bookmark-empty"
                    onClick={this.handleSubscribeOrUnsubscribeClick(
                      this.props.discussion.current,
                      false
                    )}
                    buttonModifiers={["discussion-action"]}
                  />
                </Dropdown>
              )}
            </span>
          </h2>
        }
      >
        <DiscussionCurrentThreadElement
          isOpMessage
          avatar={<div className="avatar avatar--category-1">{avatar}</div>}
          hidden={false}
        >
          <DiscussionThreadHeader
            aside={
              <span style={{ display: "flex", alignItems: "center" }}>
                <span>
                  {this.props.i18n.time.format(
                    this.props.discussion.current.created
                  )}
                </span>
              </span>
            }
          >
            <span className="application-list__item-header-main-content application-list__item-header-main-content--discussion-message-creator">
              {getName(
                userCreator,
                this.props.status.permissions.FORUM_SHOW_FULL_NAMES
              )}
            </span>
          </DiscussionThreadHeader>

          {this.state.openReplyType && this.state.openReplyType === "modify" ? (
            <ModifyThreadDrawer
              thread={this.props.discussion.current}
              onClickCancel={this.handleOnCancelClick}
            />
          ) : (
            <>
              <DiscussionThreadBody
                html={this.props.discussion.current.message}
              >
                {this.props.discussion.current.created !==
                this.props.discussion.current.lastModified ? (
                  <span className="application-list__item-edited">
                    {this.props.i18n.text.get(
                      "plugin.discussion.content.isEdited",
                      this.props.i18n.time.format(
                        this.props.discussion.current.lastModified
                      )
                    )}
                  </span>
                ) : null}
              </DiscussionThreadBody>
              {userCreator !== null ? (
                <DiscussionThreadFooter hasActions>
                  {!threadLocked || !student ? (
                    <Link
                      className="link link--application-list"
                      onClick={this.handleOnReplyClick("answer")}
                    >
                      {this.props.i18n.text.get(
                        "plugin.discussion.reply.message"
                      )}
                    </Link>
                  ) : null}
                  {!threadLocked || !student ? (
                    <Link
                      className="link link--application-list"
                      onClick={this.handleOnReplyClick("quote")}
                    >
                      {this.props.i18n.text.get(
                        "plugin.discussion.reply.quote"
                      )}
                    </Link>
                  ) : null}
                  {canEditThread ? (
                    <Link
                      className="link link--application-list"
                      onClick={this.handleOnReplyClick("modify")}
                    >
                      {this.props.i18n.text.get("plugin.discussion.reply.edit")}
                    </Link>
                  ) : null}
                  {canRemoveThread || studentCanRemoveThread ? (
                    <DeleteThreadComponent>
                      <Link className="link link--application-list">
                        {this.props.i18n.text.get(
                          "plugin.discussion.reply.delete"
                        )}
                      </Link>
                    </DeleteThreadComponent>
                  ) : null}
                </DiscussionThreadFooter>
              ) : null}
            </>
          )}

          {this.state.openReplyType && this.state.openReplyType === "answer" ? (
            <ReplyThreadDrawer onClickCancel={this.handleOnCancelClick} />
          ) : null}

          {this.state.openReplyType && this.state.openReplyType === "quote" ? (
            <ReplyThreadDrawer
              quote={this.props.discussion.current.message}
              quoteAuthor={getName(
                userCreator,
                this.props.status.permissions.FORUM_SHOW_FULL_NAMES
              )}
              onClickCancel={this.handleOnCancelClick}
            />
          ) : null}
        </DiscussionCurrentThreadElement>

        {this.props.discussion.currentReplies.map(
          (reply: DiscussionThreadReplyType) => {
            // user can be null in situtations where whole user is removed completely
            // from muikku. Then there is no reply.creator to use.
            const user: DiscussionUserType = reply.creator;

            // By default setting remove message is false
            let canRemoveMessage = false;

            // By default setting edit message is false
            let canEditMessage = false;
            let avatar;

            if (!user) {
              // This is what it shows when the user is not ready
              // Also if reply creator is null aka deleted
              // These situtations don't allow changing user specific color, so
              // color is same for all of those cases
              avatar = <div className="avatar avatar--category-1"></div>;
            } else {
              const userCategory =
                reply.creator.id > 10
                  ? (reply.creator.id % 10) + 1
                  : reply.creator.id;
              canRemoveMessage =
                this.props.userId === reply.creator.id ||
                areaPermissions.removeThread;
              canEditMessage =
                this.props.userId === reply.creator.id ||
                areaPermissions.editMessages;
              avatar = (
                <Avatar
                  key={reply.id}
                  id={user.id}
                  firstName={user.firstName}
                  hasImage={user.hasImage}
                  userCategory={userCategory}
                />
              );
            }

            // Checks if element parent has hide its siblings
            const isHiddenElement = this.state.hiddenParentsLists.includes(
              reply.parentReplyId
            );

            // Checks if element has siblings that are hidden
            const parentHasHiddenSiblings =
              this.state.hiddenParentsLists.includes(reply.id);

            return (
              <DiscussionThreadReply
                key={reply.id}
                discussionItem={reply}
                user={user}
                isStudent={student}
                avatar={avatar}
                isHidden={isHiddenElement}
                parentHasHiddenSiblings={parentHasHiddenSiblings}
                canEditMessage={canEditMessage}
                canRemoveMessage={canRemoveMessage}
                threadLocked={threadLocked}
                onHideShowSubRepliesClick={this.onHideShowSubRepliesClick}
              />
            );
          }
        )}

        <PagerV2
          previousLabel=""
          nextLabel=""
          breakLabel="..."
          initialPage={this.props.discussion.currentPage - 1}
          forcePage={this.props.discussion.currentPage - 1}
          marginPagesDisplayed={1}
          pageCount={this.props.discussion.currentTotalPages}
          pageRangeDisplayed={2}
          onPageChange={this.handlePagerChange}
        />
      </DiscussionCurrentThreadListContainer>
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
    discussion: state.discussion,
    userId: state.status.userId,
    permissions: state.status.permissions,
    status: state.status,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators(
    {
      subscribeDiscussionThread,
      unsubscribeDiscussionThread,
    },
    dispatch
  );
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DiscussionCurrentThread);
