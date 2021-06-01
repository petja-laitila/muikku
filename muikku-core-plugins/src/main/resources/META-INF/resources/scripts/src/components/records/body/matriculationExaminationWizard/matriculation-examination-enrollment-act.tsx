import * as React from "react";
import "~/sass/elements/matriculation.scss";
import {
  ExaminationInformation,
  ExaminationAttentionInformation,
  SaveState,
} from "../../../../@types/shared";
import { Textarea } from "./textarea";

/**
 * MatriculationExaminationEnrollmentActProps
 */
interface MatriculationExaminationEnrollmentActProps {
  examination: ExaminationInformation;
  draftSaveErrorMsg?: string;
  saveState: SaveState;
  onChange: (examination: ExaminationInformation) => void;
}

/**
 * MatriculationExaminationEnrollmentAct
 * @param props
 * @returns
 */
export class MatrMatriculationExaminationEnrollmentAct extends React.Component<
  MatriculationExaminationEnrollmentActProps,
  {}
> {
  constructor(props: MatriculationExaminationEnrollmentActProps) {
    super(props);
  }

  /**
   * Handles examination information changes and passes it to parent component
   * @param key
   * @param value
   */
  onExaminationInformationChange = <T extends keyof ExaminationInformation>(
    key: T,
    value: ExaminationInformation[T]
  ) => {
    const { examination, onChange } = this.props;

    const modifiedExamination: ExaminationInformation = {
      ...examination,
      [key]: value,
    };

    onChange(modifiedExamination);
  };

  /**
   * Render method
   */
  render() {
    const { examination, draftSaveErrorMsg, saveState } = this.props;
    const { location, message, canPublishName, name, date } = examination;

    /**
     * saving draft error popper
     */
    const savingDraftError = draftSaveErrorMsg && (
      <div className="matriculation__saving-draft matriculation__saving-draft--error">
        <h3 className="matriculation__saving-draft-title">
          Luonnoksen tallentaminen epäonnistui!
        </h3>
        <p>{draftSaveErrorMsg}</p>
      </div>
    );

    /**
     * saving draft info popper
     */
    const savingDraftInfo = saveState && (
      <div className="matriculation__saving-draft matriculation__saving-draft--info">
        <h3 className="matriculation__saving-draft-title">
          {saveState === "SAVING_DRAFT"
            ? "Tallennetaan luonnosta"
            : "Luonnos tallennettu"}
          {saveState === "SAVING_DRAFT" && this.renderAnimatedDots()}
        </h3>
      </div>
    );

    return (
      <div className="matriculation-container">
        {savingDraftError}
        {savingDraftInfo}
        <fieldset className="matriculation-fieldset">
          <legend>Kokeen suorittaminen</legend>
          <div className="matriculation-row">
            <div className="matriculation__form-element-container">
              <label>Suorituspaikka</label>
              <select
                onChange={(e) =>
                  this.onExaminationInformationChange(
                    "location",
                    e.currentTarget.value
                  )
                }
                value={location}
                className="matriculation__form-element__input"
              >
                <option>Mikkeli</option>
                <option value="">Muu</option>
              </select>
            </div>
          </div>

          <div className="pure-u-1-2"></div>
          <div className="matriculation-row">
            <div className="matriculation__form-element-container">
              <Textarea
                label="Lisätietoa ohjaajalle"
                rows={5}
                onChange={(e) =>
                  this.onExaminationInformationChange(
                    "message",
                    e.currentTarget.value
                  )
                }
                value={message}
                className="matriculation__form-element__input matriculation__form-element__input--textarea"
              />
            </div>
          </div>
          <div className="matriculation-row">
            <div className="matriculation__form-element-container">
              <label>Julkaisulupa</label>
              <select
                onChange={(e) =>
                  this.onExaminationInformationChange(
                    "canPublishName",
                    e.currentTarget.value
                  )
                }
                value={canPublishName}
                className="matriculation__form-element__input"
              >
                <option value="true">
                  Haluan nimeni julkaistavan valmistujalistauksissa
                </option>
                <option value="false">
                  En halua nimeäni julkaistavan valmistujaislistauksissa
                </option>
              </select>
            </div>
          </div>

          <div className="matriculation-row">
            <div className="matriculation__form-element-container">
              <label>Nimi</label>
              <input
                value={name}
                readOnly={true}
                className="matriculation__form-element__input"
                type="text"
              />
            </div>
            <div className="matriculation__form-element-container">
              <label>Päivämäärä</label>
              <input
                value={date}
                readOnly={true}
                className="matriculation__form-element__input"
                type="text"
              />
            </div>
          </div>
        </fieldset>
      </div>
    );
  }

  /**
   * renderAnimatedDots
   * @returns
   */
  renderAnimatedDots = () => {
    return (
      <>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </>
    );
  };
}

export default MatrMatriculationExaminationEnrollmentAct;
