import * as React from "react";
import NoteEditor from "./note-editor";
import { NoteBookState, WorkspaceNote } from "~/reducers/notebook/notebook";
import { StateType } from "~/reducers";
import { connect, Dispatch } from "react-redux";
import { AnyActionType } from "~/actions";
import { bindActionCreators } from "redux";
import { i18nType } from "~/reducers/base/i18n";
import {
  LoadNotebookEntries,
  loadNotebookEntries,
  updateNotebookEntriesOrder,
  UpdateNotebookEntriesOrder,
  ToggleNotebookEditor,
  toggleNotebookEditor,
  DeleteNotebookEntry,
  deleteNotebookEntry,
} from "../../../actions/notebook/notebook";
import { StatusType } from "~/reducers/base/status";
import { WorkspaceType } from "~/reducers/workspaces/index";
import "~/sass/elements/buttons.scss";
import "~/sass/elements/notebook.scss";
import NoteList, { NoteListItem } from "./note-list";
import {
  DndProvider,
  MouseTransition,
  MultiBackendOptions,
  TouchTransition,
} from "react-dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { DraggableElement } from "../react-dnd/draggable-element";
import { IconButton } from "../button";

export const HTML5toTouch: MultiBackendOptions = {
  backends: [
    {
      id: "html5",
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: "touch",
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      preview: true,
      transition: TouchTransition,
    },
  ],
};

/**
 * NoteBookProps
 */
interface NoteBookProps {
  i18n: i18nType;
  status: StatusType;
  currentWorkspace: WorkspaceType;
  notebook: NoteBookState;
  loadNotebookEntries: LoadNotebookEntries;
  updateNotebookEntriesOrder: UpdateNotebookEntriesOrder;
  toggleNotebookEditor: ToggleNotebookEditor;
  deleteNotebookEntry: DeleteNotebookEntry;
}

/**
 * Creates NoteBook component
 *
 * @param props props
 */
const NoteBook: React.FC<NoteBookProps> = (props) => {
  const {
    notebook,
    loadNotebookEntries,
    updateNotebookEntriesOrder,
    toggleNotebookEditor,
    deleteNotebookEntry,
  } = props;
  const { notes, noteInTheEditor } = notebook;

  const [openedItems, setOpenedItems] = React.useState<number[]>([]);
  const [editOrder, setEditOrder] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (notes === null) {
      loadNotebookEntries();
    }
  }, [loadNotebookEntries, notes]);

  /**
   * Handles adding new note
   */
  const handleAddNewNoteClick = () => {
    toggleNotebookEditor({ open: true });
  };

  /**
   * Handles opening all notes
   */
  const handleOpenAllClick = () => {
    setOpenedItems(notes.map((note) => note.id));
  };

  /**
   * Handles closing all notes
   */
  const handleCloseAllClick = () => {
    setOpenedItems([]);
  };

  /**
   * Handles note item reorder
   */
  const handleEditEntriesOrderClick = () => {
    setEditOrder(!editOrder);
  };

  /**
   * Handles draggable element drag
   *
   * @param dragIndex dragIndex
   * @param hoverIndex hoverIndex
   */
  const handleElementDrag = React.useCallback(
    (dragIndex: number, hoverIndex: number) => {
      updateNotebookEntriesOrder(dragIndex, hoverIndex, true);
    },
    [updateNotebookEntriesOrder]
  );

  /**
   * handleDropElement
   */
  const handleElementDrop = React.useCallback(
    (dragIndex: number, hoverIndex: number) => {
      updateNotebookEntriesOrder(dragIndex, hoverIndex, true);
    },
    [updateNotebookEntriesOrder]
  );

  /**
   * Renders note item.
   * If ordering is active note is wrapped with DraggableElement
   *
   * @param note note
   * @param index index
   * @returns note item
   */
  const renderNote = React.useCallback(
    (note: WorkspaceNote, index: number) => {
      /**
       * Handles opening/closing note specific note
       *
       * @param noteId noteId
       */
      const handleOpenNoteClick = (noteId: number) => {
        if (openedItems.includes(noteId)) {
          setOpenedItems((prevItems) =>
            prevItems.filter((id) => id !== noteId)
          );
        } else {
          setOpenedItems([...openedItems, noteId]);
        }
      };

      /**
       * Handles note item edit click
       *
       * @param note note
       */
      const handleEditNoteClick = (note: WorkspaceNote) => {
        toggleNotebookEditor({ open: true, note });
      };

      /**
       * Handles note item delete click
       *
       * @param noteId noteId
       */
      const handleDeleteNoteClick = (noteId: number) => {
        deleteNotebookEntry({ workspaceNoteId: noteId });
      };

      return (
        <DraggableElement
          key={note.id}
          id={note.id}
          index={index}
          active={editOrder}
          onElementDrag={handleElementDrag}
          onElementDrop={handleElementDrop}
        >
          <NoteListItem
            key={note.id}
            note={note}
            open={openedItems.includes(note.id)}
            onOpenClick={handleOpenNoteClick}
            isEdited={noteInTheEditor && noteInTheEditor.id === note.id}
            onEditClick={handleEditNoteClick}
            onDeleteClick={handleDeleteNoteClick}
          />
        </DraggableElement>
      );
    },
    [
      deleteNotebookEntry,
      editOrder,
      handleElementDrag,
      handleElementDrop,
      noteInTheEditor,
      openedItems,
      toggleNotebookEditor,
    ]
  );

  return (
    <div className="notebook">
      <div className="notebook__actions">
        <IconButton
          icon="plus"
          buttonModifiers={["notebook-action"]}
          onClick={handleAddNewNoteClick}
        />
        <IconButton
          icon="move"
          buttonModifiers={["notebook-action"]}
          onClick={handleEditEntriesOrderClick}
        />
        <IconButton
          icon="arrow-down"
          buttonModifiers={["notebook-action"]}
          onClick={handleOpenAllClick}
        />
        <IconButton
          icon="arrow-up"
          buttonModifiers={["notebook-action"]}
          onClick={handleCloseAllClick}
        />
      </div>

      <div className="notebook__body">
        <div
          className={`notebook__editor ${
            notebook.noteEditorOpen ? "state-OPEN" : ""
          }`}
        >
          <NoteEditor />
        </div>

        <DndProvider options={HTML5toTouch}>
          <NoteList>
            {notebook.state === "LOADING" ? (
              <div className="empty-loader" />
            ) : notes ? (
              notes.map((note, index) => renderNote(note, index))
            ) : (
              <div className="empty">
                <span>Ei muistiinpanoja</span>
              </div>
            )}
          </NoteList>
        </DndProvider>
      </div>
    </div>
  );
};

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    notebook: state.notebook,
    status: state.status,
    currentWorkspace: state.workspaces.currentWorkspace,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators(
    {
      loadNotebookEntries,
      updateNotebookEntriesOrder,
      toggleNotebookEditor,
      deleteNotebookEntry,
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(NoteBook);
