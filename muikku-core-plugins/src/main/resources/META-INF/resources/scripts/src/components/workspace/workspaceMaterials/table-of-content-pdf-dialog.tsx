/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import Dialog from "~/components/general/dialog";
import { i18nType } from "~/reducers/base/i18n";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { AnyActionType } from "~/actions";
import { StateType } from "~/reducers";
import { PDFViewer } from "@react-pdf/renderer";
import {
  MaterialCompositeRepliesListType,
  MaterialContentNodeListType,
  WorkspaceType,
} from "~/reducers/workspaces";
import TableOfContentPDF from "./table-of-content-pdf";
import { StatusType } from "~/reducers/base/status";

/**
 * NoteBookPDFProps
 */
interface TableOfContentPDFDialogProps {
  children?: React.ReactElement<any>;
  assignmentTypeFilters: string[];
  materials: MaterialContentNodeListType;
  compositeReplies: MaterialCompositeRepliesListType;
  workspace?: WorkspaceType;
  isOpen?: boolean;
  onClose?: () => void;
  i18n: i18nType;
  status: StatusType;
}

/**
 * NoteBookPDFDialog
 * @param props props
 * @returns JSX.Element
 */
const TableOfContentPDFDialog = (props: TableOfContentPDFDialogProps) => {
  const {
    children,
    assignmentTypeFilters,
    materials,
    compositeReplies,
    workspace,
    status,
    isOpen,
    onClose,
  } = props;

  let workspaceName: string = undefined;

  if (workspace) {
    workspaceName = workspace.name;

    if (workspace.nameExtension) {
      workspaceName += ` (${workspace.nameExtension})`;
    }
  }

  /**
   * content
   * @param closeDialog closeDialog
   */
  const content = (closeDialog: () => void) => (
    <PDFViewer className="notebook-pdf">
      <TableOfContentPDF
        assignmentTypeFilters={assignmentTypeFilters}
        materials={materials}
        compositeReplies={compositeReplies}
        workspace={workspace}
        workspaceName={workspaceName}
        status={status}
      />
    </PDFViewer>
  );

  return (
    <Dialog
      modifier="notebook-pdf-dialog"
      isOpen={isOpen}
      onClose={onClose}
      title="Sisällysluettelo"
      content={content}
      disableScroll
    >
      {children}
    </Dialog>
  );
};

/**
 * mapStateToProps
 * @param state state
 */
function mapStateToProps(state: StateType) {
  return {
    i18n: state.i18n,
    status: state.status,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators({}, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TableOfContentPDFDialog);
