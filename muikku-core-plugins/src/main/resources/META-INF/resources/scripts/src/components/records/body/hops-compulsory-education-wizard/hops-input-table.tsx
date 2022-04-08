import * as React from "react";
import {
  Table,
  TableHead,
  TableRowProps,
  Tbody,
  Td,
  Th,
  Tr,
} from "~/components/general/table";

import "~/sass/elements/wcag.scss";

/**
 * createArrayOfNumberIntervals
 * @param scaleStart scaleStart
 * @param scaleInterval scaleInterval
 * @param scaleLength scaleLength
 * @returns array of numbers
 */
const createArrayOfNumberIntervals = (
  scaleStart: number,
  scaleInterval: number,
  scaleLength: number
) => {
  let interval = scaleStart;
  return Array(scaleLength)
    .fill(1)
    .map((v, i: number) => {
      if (i === 0) {
        return interval;
      }

      interval += scaleInterval;
      return interval;
    });
};

/**
 * LanguageGradeTableProps
 */
interface HopsInputTableProps {
  scaleStart: number;
  scaleInterval: number;
  scaleLength: number;
}

/**
 * HopsInputTable
 * @param props props
 * @returns JSX.Element. Language grade table component
 */
export const HopsInputTable: React.FC<HopsInputTableProps> = (props) => {
  const { children, scaleStart, scaleInterval, scaleLength } = props;

  return (
    <Table modifiers={["language-table"]}>
      <TableHead modifiers={["language-table"]}>
        <Tr modifiers={["language-table"]}>
          <Th modifiers={["centered", "language"]}>Kysymys</Th>

          {createArrayOfNumberIntervals(
            scaleStart,
            scaleInterval,
            scaleLength
          ).map((v, i: number) => (
            <Th key={i} modifiers={["centered"]}>
              {v}
            </Th>
          ))}
        </Tr>
      </TableHead>
      <Tbody>{children}</Tbody>
    </Table>
  );
};

/**
 * LanguageGradeRowProps
 */
interface InputRowProps {
  label: string;
  groupName: string;
  selectedValue: number;
  disabled: boolean;
  scaleStart: number;
  scaleInterval: number;
  scaleLength: number;
  onInputGroupChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * InputRow
 * @param props props
 * @returns JSX.Element
 */
export const InputRow: React.FC<InputRowProps> = (props) => {
  const {
    label,
    selectedValue,
    groupName,
    scaleStart,
    scaleInterval,
    scaleLength,
    onInputGroupChange,
  } = props;

  return (
    <Tr modifiers={["language-table"]}>
      <Td modifiers={["centered", "language"]}>
        <span className="table__alignment-helper">{label}</span>
      </Td>

      {createArrayOfNumberIntervals(scaleStart, scaleInterval, scaleLength).map(
        (v, i: number) => (
          <Td key={i} modifiers={["centered"]}>
            <span className="table__alignment-helper">
              <input
                name={groupName}
                checked={selectedValue === v}
                value={v}
                onChange={onInputGroupChange}
                type="radio"
                className="hops__input hops__input--inside-table"
              ></input>
            </span>
          </Td>
        )
      )}
    </Tr>
  );
};

/**
 * EmptyRowProps
 */
interface EmptyRowProps extends TableRowProps {
  colSpan?: number;
}

/**
 * EmptyRow
 * @param param0 param0
 * @param param0.colSpan param0.colSpan
 */
export const EmptyRow: React.FC<EmptyRowProps> = ({
  colSpan = 0,
  ...rowProps
}) => (
  <Tr {...rowProps}>
    <Td colSpan={colSpan}></Td>
  </Tr>
);
