import * as React from "react";
import Button from "~/components/general/button";
import {
  Table,
  TableHead,
  Tbody,
  Td,
  Th,
  Tr,
} from "~/components/general/table";
import { LanguageGrade, LanguageGradeEnum } from "~/@types/shared";

import "~/sass/elements/wcag.scss";

/**
 * LanguageGradeTableProps
 */
interface HopsLanguageGradeTableProps {}

/**
 * LanguageGradeTable
 * @param param0 param0
 * @param param0.children children
 * @returns JSX.Element. Language grade table component
 */
export const HopsLanguageGradeTable: React.FC<HopsLanguageGradeTableProps> = ({
  children,
}) => (
  <Table modifiers={["language-table"]}>
    <TableHead modifiers={["language-table"]}>
      <Tr modifiers={["language-table"]}>
        <Th modifiers={["centered", "language"]}>Kieli</Th>
        <Th modifiers={["centered"]}>Äidinkieli</Th>
        <Th modifiers={["centered"]}>Erinomainen / Kiitettävä</Th>
        <Th modifiers={["centered"]}>Hyvä</Th>
        <Th modifiers={["centered"]}>Tyydyttävä / Alkeet</Th>
        <Th modifiers={["centered"]}>En ole opiskellut</Th>
        <Th style={{ maxWidth: "50px", textAlign: "center" }}>Toimin.</Th>
      </Tr>
    </TableHead>
    <Tbody>{children}</Tbody>
  </Table>
);

/**
 * LanguageGradeRowProps
 */
interface LanguageGradeRowProps {
  index: number;
  disabled: boolean;
  lng: LanguageGrade;
  onDeleteRowClick?: (index: number) => void;
  onLanguageRowChange?: (updatedLng: LanguageGrade, index: number) => void;
}

/**
 * LanguageGradeRow
 * @param param0 param0
 * @param param0.index index
 * @param param0.lng lng
 * @param param0.onDeleteRowClick onDeleteRowClick
 * @param param0.onLanguageRowChange onLanguageRowChange
 * @param param0.disabled disabled
 * @returns JSX.Element. Language grade table row
 */
export const LanguageGradeRow: React.FC<LanguageGradeRowProps> = ({
  index,
  lng,
  onDeleteRowClick,
  onLanguageRowChange,
  disabled,
}) => {
  /**
   * Handles language name changes
   *
   * @param e e
   */
  const handleOtherLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedLng = { ...lng, name: e.currentTarget.value };

    onLanguageRowChange(updatedLng, index);
  };

  /**
   * Handles radio input changes
   *
   * @param v value which is clicked
   */
  const handleRadioInputChange =
    (v: LanguageGradeEnum) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const updatedLng = { ...lng, grade: v };

      onLanguageRowChange(updatedLng, index);
    };

  return (
    <Tr modifiers={["language-table"]}>
      <Td modifiers={["centered", "language"]}>
        {lng.hardCoded ? (
          <>{lng.name}</>
        ) : (
          <span className="table__alignment-helper">
            <input
              type="text"
              value={lng.name}
              onChange={handleOtherLngChange}
              placeholder="Kieli"
              className="hops__input hops__input--inside-table"
              disabled={disabled}
              style={{ textAlign: "center" }}
            ></input>
          </span>
        )}
      </Td>
      <Td modifiers={["centered"]}>
        <span className="table__alignment-helper">
          <input
            type="radio"
            checked={
              lng.grade
                ? lng.grade === LanguageGradeEnum.NATIVE_LANGUAGE
                : false
            }
            onChange={handleRadioInputChange(LanguageGradeEnum.NATIVE_LANGUAGE)}
            className="hops__input hops__input--inside-table"
            disabled={disabled}
          ></input>
        </span>
      </Td>
      <Td modifiers={["centered"]}>
        <span className="table__alignment-helper">
          <input
            type="radio"
            checked={
              lng.grade ? lng.grade === LanguageGradeEnum.EXCELLENT : false
            }
            onChange={handleRadioInputChange(LanguageGradeEnum.EXCELLENT)}
            className="hops__input hops__input--inside-table"
            disabled={disabled}
          ></input>
        </span>
      </Td>
      <Td modifiers={["centered"]}>
        <span className="table__alignment-helper">
          <input
            type="radio"
            checked={lng.grade ? lng.grade === LanguageGradeEnum.GOOD : false}
            onChange={handleRadioInputChange(LanguageGradeEnum.GOOD)}
            className="hops__input hops__input--inside-table"
            disabled={disabled}
          ></input>
        </span>
      </Td>
      <Td modifiers={["centered"]}>
        <span className="table__alignment-helper">
          <input
            type="radio"
            checked={
              lng.grade ? lng.grade === LanguageGradeEnum.SATISFYING : false
            }
            onChange={handleRadioInputChange(LanguageGradeEnum.SATISFYING)}
            className="hops__input hops__input--inside-table"
            disabled={disabled}
          ></input>
        </span>
      </Td>
      <Td modifiers={["centered"]}>
        <span className="table__alignment-helper">
          <input
            type="radio"
            checked={
              lng.grade ? lng.grade === LanguageGradeEnum.NOT_STUDIED : false
            }
            onChange={handleRadioInputChange(LanguageGradeEnum.NOT_STUDIED)}
            className="hops__input hops__input--inside-table"
            disabled={disabled}
          ></input>
        </span>
      </Td>
      <Td modifiers={["centered"]}>
        {lng.hardCoded ? (
          <span className="table__alignment-helper">-</span>
        ) : (
          <span className="table__alignment-helper">
            <label id="removeLanguageRowLabel" className="visually-hidden">
              Poista
            </label>
            <Button
              aria-labelledby="removeLanguageRowLabel"
              buttonModifiers={["remove-hops-row"]}
              icon="trash"
              onClick={(e) => onDeleteRowClick(index)}
              disabled={disabled}
            />
          </span>
        )}
      </Td>
    </Tr>
  );
};
