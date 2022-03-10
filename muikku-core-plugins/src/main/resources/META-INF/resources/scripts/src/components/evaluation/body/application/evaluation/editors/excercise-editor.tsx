import * as React from "react";
import AnimateHeight from "react-animate-height";
import { i18nType } from "~/reducers/base/i18n";
import {
  MaterialEvaluationType,
  MaterialAssignmentType,
  MaterialCompositeRepliesType,
} from "~/reducers/workspaces/index";
import { EvaluationState } from "~/reducers/main-function/evaluation/index";
import { StatusType } from "~/reducers/base/status";
import {
  AudioAssessment,
  AssignmentEvaluationSupplementationRequest,
  AssignmentEvaluationGradeRequest,
  AssignmentEvaluationSaveReturn,
  AssessmentRequest,
} from "~/@types/evaluation";
import SessionStateComponent from "~/components/general/session-state-component";
import CKEditor from "~/components/general/ckeditor";
import Button from "~/components/general/button";
import { bindActionCreators } from "redux";
import { connect, Dispatch } from "react-redux";
import { AnyActionType } from "~/actions/index";
import Recorder from "~/components/general/voice-recorder/recorder";
import mApi from "~/lib/mApi";
import promisify from "~/util/promisify";
import { StateType } from "reducers";
import { displayNotification } from "~/actions/base/notifications";
import { DisplayNotificationTriggerType } from "~/actions/base/notifications";
import {
  UpdateCurrentStudentEvaluationCompositeRepliesData,
  updateCurrentStudentCompositeRepliesData,
} from "~/actions/main-function/evaluation/evaluationActions";
import WarningDialog from "../../../../dialogs/close-warning";

/**
 * AssignmentEditorProps
 */
interface AssignmentEditorProps {
  i18n: i18nType;
  selectedAssessment: AssessmentRequest;
  materialEvaluation?: MaterialEvaluationType;
  materialAssignment: MaterialAssignmentType;
  compositeReplies: MaterialCompositeRepliesType;
  evaluations: EvaluationState;
  status: StatusType;
  updateMaterialEvaluationData: (
    assigmentSaveReturn: AssignmentEvaluationSaveReturn
  ) => void;
  onAudioAssessmentChange: () => void;
  /**
   * Handles changes whether recording is happening or not
   */
  onIsRecordingChange?: (isRecording: boolean) => void;
  isRecording: boolean;
  showAudioAssessmentWarningOnClose: boolean;
  updateCurrentStudentCompositeRepliesData: UpdateCurrentStudentEvaluationCompositeRepliesData;
  displayNotification: DisplayNotificationTriggerType;
  editorLabel?: string;
  modifiers?: string[];
  onClose?: () => void;
}

/**
 * AssignmentEditorState
 */
interface AssignmentEditorState {
  literalEvaluation: string;
  needsSupplementation: boolean;
  audioAssessments: AudioAssessment[];
  draftId: string;
  locked: boolean;
}

/**
 * AssignmentEditor
 */
class ExcerciseEditor extends SessionStateComponent<
  AssignmentEditorProps,
  AssignmentEditorState
> {
  /**
   * constructor
   * @param props props
   */
  constructor(props: AssignmentEditorProps) {
    super(props, `excercise-editor`);

    const { compositeReplies, selectedAssessment } = props;

    const draftId = `${selectedAssessment.userEntityId}-${props.materialAssignment.id}`;

    this.state = {
      ...this.getRecoverStoredState(
        {
          literalEvaluation:
            compositeReplies && compositeReplies.evaluationInfo
              ? compositeReplies.evaluationInfo.text
              : "",
          needsSupplementation:
            compositeReplies &&
            compositeReplies.evaluationInfo &&
            compositeReplies.evaluationInfo.type === "INCOMPLETE",

          draftId,
        },
        draftId
      ),
      audioAssessments:
        compositeReplies.evaluationInfo &&
        compositeReplies.evaluationInfo.audioAssessments &&
        compositeReplies.evaluationInfo.audioAssessments !== null
          ? compositeReplies.evaluationInfo.audioAssessments
          : [],
      locked: false,
    };
  }

  /**
   * componentDidMount
   */
  componentDidMount = () => {
    const { compositeReplies } = this.props;

    this.setState({
      ...this.getRecoverStoredState(
        {
          literalEvaluation:
            compositeReplies && compositeReplies.evaluationInfo
              ? compositeReplies.evaluationInfo.text
              : "",
          needsSupplementation:
            compositeReplies &&
            compositeReplies.evaluationInfo &&
            compositeReplies.evaluationInfo.type === "INCOMPLETE",
        },
        this.state.draftId
      ),
      audioAssessments:
        compositeReplies.evaluationInfo &&
        compositeReplies.evaluationInfo.audioAssessments &&
        compositeReplies.evaluationInfo.audioAssessments !== null
          ? compositeReplies.evaluationInfo.audioAssessments
          : [],
    });
  };

  /**
   * componentDidUpdate
   * @param prevProps prevProps
   * @param prevState prevState
   */
  componentDidUpdate = (
    prevProps: AssignmentEditorProps,
    prevState: AssignmentEditorState
  ) => {
    if (
      this.state.audioAssessments.length !== prevState.audioAssessments.length
    ) {
      this.props.onAudioAssessmentChange();
    }
  };

  /**
   * saveAssignmentEvaluationGradeToServer
   * @param data data
   * @param data.workspaceEntityId workspaceEntityId
   * @param data.userEntityId userEntityId
   * @param data.workspaceMaterialId workspaceMaterialId
   * @param data.dataToSave dataToSave
   * @param data.materialId materialId
   */
  saveAssignmentEvaluationGradeToServer = async (data: {
    workspaceEntityId: number;
    userEntityId: number;
    workspaceMaterialId: number;
    dataToSave: AssignmentEvaluationGradeRequest;
    materialId: number;
  }) => {
    const { workspaceEntityId, userEntityId, workspaceMaterialId, dataToSave } =
      data;

    this.setState({
      locked: true,
    });

    if (this.props.onClose) {
      this.props.onClose();
    }

    try {
      await promisify(
        mApi().evaluation.workspace.user.workspacematerial.assessment.create(
          workspaceEntityId,
          userEntityId,
          workspaceMaterialId,
          {
            ...dataToSave,
          }
        ),
        "callback"
      )().then(async (data: AssignmentEvaluationSaveReturn) => {
        await mApi().workspace.workspaces.compositeReplies.cacheClear();

        this.setState({
          locked: false,
        });

        this.props.updateCurrentStudentCompositeRepliesData({
          workspaceId: workspaceEntityId,
          userEntityId: userEntityId,
          workspaceMaterialId: workspaceMaterialId,
        });

        this.props.updateMaterialEvaluationData(data);
      });
    } catch (error) {
      this.props.displayNotification(
        this.props.i18n.text.get(
          "plugin.evaluation.notifications.saveAssigmentGrade.error",
          error.message
        ),
        "error"
      );

      this.setState({
        locked: false,
      });
    }
  };

  /**
   * saveAssignmentEvaluationSupplementationToServer
   * @param data data
   * @param data.workspaceEntityId workspaceEntityId
   * @param data.userEntityId userEntityId
   * @param data.workspaceMaterialId workspaceMaterialId
   * @param data.dataToSave dataToSave
   * @param data.materialId materialId
   */
  saveAssignmentEvaluationSupplementationToServer = async (data: {
    workspaceEntityId: number;
    userEntityId: number;
    workspaceMaterialId: number;
    dataToSave: AssignmentEvaluationSupplementationRequest;
    materialId: number;
  }) => {
    const { workspaceEntityId, userEntityId, workspaceMaterialId, dataToSave } =
      data;

    this.setState({
      locked: true,
    });

    if (this.props.onClose) {
      this.props.onClose();
    }
    try {
      await promisify(
        mApi().evaluation.workspace.user.workspacematerial.supplementationrequest.create(
          workspaceEntityId,
          userEntityId,
          workspaceMaterialId,
          {
            ...dataToSave,
          }
        ),
        "callback"
      )().then(async () => {
        await mApi().workspace.workspaces.compositeReplies.cacheClear();

        /**
         * Compositereplies needs to be updated by loading new values from server, just for
         * so data is surely right and updated correctly. So loading updated compositeReply and append it to compositereplies list
         */

        this.props.updateCurrentStudentCompositeRepliesData({
          workspaceId: workspaceEntityId,
          userEntityId: userEntityId,
          workspaceMaterialId: workspaceMaterialId,
        });

        this.setState({
          locked: false,
        });
      });
    } catch (error) {
      this.props.displayNotification(
        this.props.i18n.text.get(
          "plugin.evaluation.notifications.saveAssigmentSupplementation.error",
          error.message
        ),
        "error"
      );

      this.setState({
        locked: false,
      });
    }
  };

  /**
   * handleSaveAssignment
   * @param e e
   */
  handleSaveAssignment = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    /**
     * Backend endpoint is different for normal grade evalution and supplementation
     */
    if (!this.state.needsSupplementation) {
      this.saveAssignmentEvaluationGradeToServer({
        workspaceEntityId: this.props.selectedAssessment.workspaceEntityId,
        userEntityId: this.props.selectedAssessment.userEntityId,
        workspaceMaterialId: this.props.materialAssignment.id,
        dataToSave: {
          assessorIdentifier: this.props.status.userSchoolDataIdentifier,
          gradingScaleIdentifier: null,
          gradeIdentifier: null,
          verbalAssessment: this.state.literalEvaluation,
          assessmentDate: new Date().getTime(),
          audioAssessments: this.state.audioAssessments,
        },
        materialId: this.props.materialAssignment.materialId,
      });
    } else {
      this.saveAssignmentEvaluationSupplementationToServer({
        workspaceEntityId: this.props.selectedAssessment.workspaceEntityId,
        userEntityId: this.props.selectedAssessment.userEntityId,
        workspaceMaterialId: this.props.materialAssignment.id,
        dataToSave: {
          userEntityId: this.props.status.userId,
          studentEntityId: this.props.selectedAssessment.userEntityId,
          workspaceMaterialId: this.props.materialAssignment.id.toString(),
          requestDate: new Date().getTime(),
          requestText: this.state.literalEvaluation,
        },
        materialId: this.props.materialAssignment.materialId,
      });
    }
  };

  /**
   * handleDeleteEditorDraft
   */
  handleDeleteEditorDraft = () => {
    const { compositeReplies } = this.props;

    if (
      compositeReplies.evaluationInfo &&
      compositeReplies.evaluationInfo.date
    ) {
      this.setStateAndClear(
        {
          literalEvaluation: compositeReplies.evaluationInfo.text,
          needsSupplementation:
            compositeReplies.evaluationInfo.type === "INCOMPLETE",
        },
        this.state.draftId
      );
    } else {
      this.setStateAndClear(
        {
          literalEvaluation: "",
          needsSupplementation: false,
        },
        this.state.draftId
      );
    }
  };

  /**
   * handleCKEditorChange
   * @param e e
   */
  handleCKEditorChange = (e: string) => {
    this.setStateAndStore(
      {
        literalEvaluation: e,
      },
      this.state.draftId
    );
  };

  /**
   * handleAssignmentEvaluationChange
   * @param e e
   */
  handleAssignmentEvaluationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setStateAndStore(
      {
        needsSupplementation: e.target.checked,
      },
      this.state.draftId
    );
  };

  /**
   * handleAudioAssessmentChange
   * @param audioAssessments audioAssessments
   */
  handleAudioAssessmentChange = (audioAssessments: AudioAssessment[]) => {
    this.setState({
      audioAssessments: audioAssessments,
    });
  };

  /**
   * Component render method
   * @returns JSX.Element
   */
  render() {
    return (
      <>
        <div className="evaluation-modal__evaluate-drawer-row form-element">
          {this.props.editorLabel && (
            <label className="evaluation-modal__evaluate-drawer-row-label">
              {this.props.editorLabel}
            </label>
          )}

          <CKEditor onChange={this.handleCKEditorChange}>
            {this.state.literalEvaluation}
          </CKEditor>
        </div>

        <div className="evaluation-modal__evaluate-drawer-row  form-element">
          <AnimateHeight height={!this.state.needsSupplementation ? "auto" : 0}>
            <label
              htmlFor="assignmentEvaluationGrade"
              className="evaluation-modal__evaluate-drawer-row-label"
            >
              {this.props.i18n.text.get(
                "plugin.evaluation.evaluationModal.audioAssessments"
              )}
            </label>
            <Recorder
              onIsRecordingChange={this.props.onIsRecordingChange}
              onChange={this.handleAudioAssessmentChange}
              values={this.state.audioAssessments}
            />
          </AnimateHeight>
        </div>

        <div className="evaluation-modal__evaluate-drawer-row evaluation-modal__evaluate-drawer-row--buttons">
          <Button
            buttonModifiers="evaluate-assignment"
            onClick={this.handleSaveAssignment}
            disabled={this.state.locked}
          >
            {this.props.i18n.text.get(
              "plugin.evaluation.evaluationModal.workspaceEvaluationForm.saveButtonLabel"
            )}
          </Button>
          {this.props.showAudioAssessmentWarningOnClose ? (
            <WarningDialog onContinueClick={this.props.onClose}>
              <Button
                buttonModifiers="evaluate-cancel"
                disabled={this.state.locked}
              >
                {this.props.i18n.text.get(
                  "plugin.evaluation.evaluationModal.workspaceEvaluationForm.cancelButtonLabel"
                )}
              </Button>
            </WarningDialog>
          ) : (
            <Button
              onClick={this.props.onClose}
              buttonModifiers="evaluate-cancel"
              disabled={this.state.locked}
            >
              {this.props.i18n.text.get(
                "plugin.evaluation.evaluationModal.workspaceEvaluationForm.cancelButtonLabel"
              )}
            </Button>
          )}

          {this.recovered && (
            <Button
              buttonModifiers="evaluate-remove-draft"
              onClick={this.handleDeleteEditorDraft}
              disabled={this.state.locked}
            >
              {this.props.i18n.text.get(
                "plugin.evaluation.evaluationModal.workspaceEvaluationForm.deleteDraftButtonLabel"
              )}
            </Button>
          )}
        </div>

        {this.props.isRecording && (
          <div className="evaluation-modal__evaluate-drawer-row evaluation-modal__evaluate-drawer-row--recording-warning">
            <div className="recording-warning">
              {this.props.i18n.text.get(
                "plugin.evaluation.evaluationModal.assignmentEvaluationForm.isRecordingWarning"
              )}
            </div>
          </div>
        )}
      </>
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
    status: state.status,
    evaluations: state.evaluations,
  };
}

/**
 * mapDispatchToProps
 * @param dispatch dispatch
 */
function mapDispatchToProps(dispatch: Dispatch<AnyActionType>) {
  return bindActionCreators(
    { updateCurrentStudentCompositeRepliesData, displayNotification },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(ExcerciseEditor);
