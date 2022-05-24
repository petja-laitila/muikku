import * as React from "react";
import { NotesLocation } from "~/@types/notes";
import {
  DisplayNotificationTriggerType,
  displayNotification,
} from "~/actions/base/notifications";
import Tabs, { Tab } from "~/components/general/tabs";
import { useNotesItem } from "./hooks/useNotesItems";
import { StateType } from "~/reducers";
import { connect, Dispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { AnyActionType } from "~/actions";
import { i18nType } from "~/reducers/base/i18n";
import NotesItemList from "./notes-item-list";
import { ButtonPill } from "~/components/general/button";
import NotesItemNew from "./notes-item-new";

/**
 * NotesProps
 */
interface NotesProps {
  /**
   * id of user who is logged in to use Journal central to create notes ie. student/supervisor
   */
  userId: number;

  /**
   * id of student who is recipient of new notes and whos notes are loaded
   */
  studentId: number;

  /**
   * use place option to render diffent functionalities
   */
  usePlace: NotesLocation;
  /**
   * If history panel want to be visible
   */
  showHistoryPanel: boolean;
  /**
   * Handles display notification from redux side
   */
  displayNotification: DisplayNotificationTriggerType;
  /**
   * For localization
   */
  i18n: i18nType;
}

/**
 * Creater NotesItem center component
 *
 * @param props props
 * @returns JSX.Element
 */
const Notes: React.FC<NotesProps> = (props) => {
  const {
    showHistoryPanel,
    displayNotification,
    userId,
    studentId,
    usePlace,
    i18n,
  } = props;

  const [activeTab, setActiveTab] = React.useState("active");

  const {
    notesItems,
    createNotesItem,
    updateNotesItem,
    archiveNotesItem,
    returnArchivedNotesItem,
    updateNotesItemStatus,
    pinNotesItem,
  } = useNotesItem(studentId, displayNotification);

  /**
   * Handles tab change
   * @param tab tab
   */
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  /**
   * List of jnotesItemournal center tabs
   */
  const notesTabs: Tab[] = [
    {
      id: "active",
      type: "notes",
      name: props.i18n.text.get("plugin.records.notes.tab.active"),
      /**
       * component
       */
      component: (
        <NotesContainer>
          <NotesToolbar>
            <NotesItemNew
              newNoteOwnerId={studentId}
              onNotesItemSaveClick={createNotesItem}
            >
              <ButtonPill buttonModifiers="add-note" icon="plus" />
            </NotesItemNew>
          </NotesToolbar>
          <NotesItemList
            i18n={props.i18n}
            isLoadingList={notesItems.isLoadingList}
            notesItems={notesItems.notesItemList}
            userId={userId}
            usePlace={usePlace}
            onPinNotesItemClick={pinNotesItem}
            onArchiveClick={archiveNotesItem}
            onUpdateNotesItemStatus={updateNotesItemStatus}
            onNotesItemSaveUpdateClick={updateNotesItem}
          />
        </NotesContainer>
      ),
    },
  ];

  if (showHistoryPanel) {
    notesTabs.push({
      id: "archived",
      type: "notes",
      name: props.i18n.text.get("plugin.records.notes.tab.archived"),
      /**
       * component
       */
      component: (
        <NotesContainer>
          <NotesItemList
            i18n={props.i18n}
            isLoadingList={notesItems.isLoadingList}
            notesItems={notesItems.notesArchivedItemList}
            userId={userId}
            usePlace={usePlace}
            onReturnArchivedClick={returnArchivedNotesItem}
          />
        </NotesContainer>
      ),
    });
  }

  return (
    <Tabs
      modifier="notes"
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabs={notesTabs}
    />
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

export default connect(mapStateToProps, mapDispatchToProps)(Notes);

/**
 * NotesToolbarProps
 */
interface NotesToolbarProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {}

/**
 * NotesToolbar
 * @param props props
 */
export const NotesToolbar: React.FC<NotesToolbarProps> = (props) => (
  <div className="notes__toolbar" {...props}>
    {props.children}
  </div>
);

/**
 * NotesContainerProps
 */
interface NotesContainerProps {}

/**
 * Creater NotesItem content container component
 * @param props props
 * @returns JSX.Element
 */
const NotesContainer: React.FC<NotesContainerProps> = (props) => {
  const { children } = props;

  return <div className="notes">{children}</div>;
};
