import * as React from "react";
import {
  StudentActivityByStatus,
  StudentActivityCourse,
  StudentCourseChoice,
} from "~/@types/shared";
import { schoolCourseTable } from "~/mock/mock-data";
import HopsSuggestionList from "./hops-suggested-list";
import {
  ListContainer,
  ListItem,
  ListItemIndicator,
} from "~/components/general/list";
import { UpdateSuggestionParams } from "../../../hooks/useStudentActivity";
import { HopsUser } from ".";
import { UpdateStudentChoicesParams } from "~/hooks/useStudentChoices";
import Dropdown from "~/components/general/dropdown";

/**
 * CourseListProps
 */
interface HopsCourseListProps extends Partial<StudentActivityByStatus> {
  useCase: "study-matrix" | "hops-planing";
  user: HopsUser;
  studentId: string;
  disabled: boolean;
  /**
   * Boolean indicating that supervisor can modify values
   */
  superVisorModifies: boolean;
  /**
   * If ethic is selected besides religion
   */
  ethicsSelected: boolean;
  /**
   * If finnish is selected as secondary languages
   */
  finnishAsSecondLanguage: boolean;
  /**
   * List of student choices
   */
  studentChoiceList?: StudentCourseChoice[];
  updateSuggestion?: (params: UpdateSuggestionParams) => void;
  updateStudentChoice?: (params: UpdateStudentChoicesParams) => void;
}

/**
 * CourseTable
 *
 * @param props props
 * @returns JSX.Element
 */
const HopsCourseList: React.FC<HopsCourseListProps> = (props) => {
  /**
   * handleToggleChoiceClick
   *
   * @param choiceParams choiceParams
   */
  const handleToggleChoiceClick =
    (choiceParams: UpdateStudentChoicesParams) =>
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      props.updateStudentChoice && props.updateStudentChoice(choiceParams);
    };

  /**
   * renderRows
   */
  const renderRows = schoolCourseTable.map((sSubject, i) => {
    /**
     * If any of these options happens
     * just return; so skipping that subject
     */
    if (props.ethicsSelected) {
      if (sSubject.subjectCode === "ua") {
        return;
      }
    } else {
      if (sSubject.subjectCode === "ea") {
        return;
      }
    }
    if (props.finnishAsSecondLanguage) {
      if (sSubject.subjectCode === "äi") {
        return;
      }
    } else {
      if (sSubject.subjectCode === "s2") {
        return;
      }
    }

    // Counters
    let mandatoryCount = 0;
    let completedCourseCount = 0;

    /**
     * Renders courses
     */
    const courses = sSubject.availableCourses.map((course) => {
      //Default modifiers
      const listItemIndicatormodifiers = ["course"];
      const listItemModifiers = ["course"];

      if (course.mandatory) {
        mandatoryCount++;
        listItemIndicatormodifiers.push("MANDATORY");
        if (
          (props.gradedList &&
            props.gradedList.find(
              (gCourse) =>
                gCourse.subject === sSubject.subjectCode &&
                gCourse.courseNumber === course.courseNumber
            )) ||
          (props.transferedList &&
            props.transferedList.find(
              (tCourse) =>
                tCourse.subject === sSubject.subjectCode &&
                tCourse.courseNumber === course.courseNumber
            ))
        ) {
          completedCourseCount++;
        }
      } else {
        listItemIndicatormodifiers.push("OPTIONAL");
      }

      // List item options with default values
      let canBeSelected = true;
      let courseSuggestions: StudentActivityCourse[] = [];

      let selectedByStudent = false;

      /**
       * If any of these list are given, check whether course id is in
       * and push another modifier
       */

      if (
        props.studentChoiceList &&
        props.studentChoiceList.find(
          (sCourse) =>
            sCourse.subject === sSubject.subjectCode &&
            sCourse.courseNumber === course.courseNumber
        )
      ) {
        selectedByStudent = true;
        listItemIndicatormodifiers.push("OPTIONAL-SELECTED");
      }

      /**
       * Only one of these can happen
       */
      if (
        props.suggestedNextList &&
        props.suggestedNextList.find(
          (sCourse) =>
            sCourse.subject === sSubject.subjectCode &&
            sCourse.courseNumber === course.courseNumber
        )
      ) {
        const suggestedCourseDataNext = props.suggestedNextList.filter(
          (sCourse) => sCourse.subject === sSubject.subjectCode
        );

        courseSuggestions = courseSuggestions.concat(suggestedCourseDataNext);

        listItemIndicatormodifiers.push("NEXT");
      } else if (
        props.suggestedOptionalList &&
        props.suggestedOptionalList.find(
          (sOCourse) =>
            sOCourse.subject === sSubject.subjectCode &&
            sOCourse.courseNumber === course.courseNumber
        )
      ) {
        const suggestedCourseDataOptional = props.suggestedOptionalList.filter(
          (oCourse) => oCourse.subject === sSubject.subjectCode
        );

        courseSuggestions = courseSuggestions.concat(
          suggestedCourseDataOptional
        );

        listItemIndicatormodifiers.push("SUGGESTED");
      } else if (
        props.transferedList &&
        props.transferedList.find(
          (tCourse) =>
            tCourse.subject === sSubject.subjectCode &&
            tCourse.courseNumber === course.courseNumber
        )
      ) {
        canBeSelected = false;
        listItemIndicatormodifiers.push("APPROVAL");
      } else if (
        props.gradedList &&
        props.gradedList.find(
          (gCourse) =>
            gCourse.subject === sSubject.subjectCode &&
            gCourse.courseNumber === course.courseNumber
        )
      ) {
        completedCourseCount++;
        canBeSelected = false;
        listItemIndicatormodifiers.push("COMPLETED");
      } else if (
        props.onGoingList &&
        props.onGoingList.find(
          (oCourse) =>
            oCourse.subject === sSubject.subjectCode &&
            oCourse.courseNumber === course.courseNumber
        )
      ) {
        canBeSelected = false;
        listItemIndicatormodifiers.push("INPROGRESS");
      }

      /**
       * Button is shown only if modifying user is supervisor
       */
      const showAddToHopsButton =
        props.user === "supervisor" && props.superVisorModifies;

      /**
       * Suggestion list is shown only if not disabled, for supervisor only
       * and there can be made selections
       */
      const showSuggestionList =
        !props.disabled && props.user === "supervisor" && canBeSelected;

      return (
        <ListItem key={course.id} modifiers={listItemModifiers}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <ListItemIndicator
              modifiers={listItemIndicatormodifiers}
              onClick={
                !course.mandatory && props.user === "student"
                  ? handleToggleChoiceClick({
                      studentId: props.studentId,
                      courseNumber: course.courseNumber,
                      subject: sSubject.subjectCode,
                    })
                  : undefined
              }
            >
              <Dropdown
                openByHover={props.user !== "supervisor"}
                content={
                  <div className="hops-container__study-tool-dropdown-container">
                    <div className="hops-container__study-tool-dropdow-title">
                      {course.mandatory ? course.name : `${course.name}*`}
                    </div>
                    {course.mandatory ? (
                      <>
                        {showSuggestionList && (
                          <HopsSuggestionList
                            studentId={props.studentId}
                            suggestedActivityCourses={courseSuggestions}
                            subjectCode={sSubject.subjectCode}
                            course={course}
                            updateSuggestion={props.updateSuggestion}
                            canSuggestForNext={
                              props.useCase === "hops-planing" ||
                              props.useCase === "study-matrix"
                            }
                            canSuggestForOptional={
                              props.useCase === "hops-planing"
                            }
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {showAddToHopsButton && (
                          <button
                            onClick={handleToggleChoiceClick({
                              studentId: props.studentId,
                              courseNumber: course.courseNumber,
                              subject: sSubject.subjectCode,
                            })}
                          >
                            {selectedByStudent
                              ? "Peru valinta"
                              : "Valitse osaksi hopsia"}
                          </button>
                        )}

                        {showSuggestionList && (
                          <HopsSuggestionList
                            studentId={props.studentId}
                            suggestedActivityCourses={courseSuggestions}
                            subjectCode={sSubject.subjectCode}
                            course={course}
                            updateSuggestion={props.updateSuggestion}
                            canSuggestForNext={
                              props.useCase === "hops-planing" ||
                              props.useCase === "study-matrix"
                            }
                            canSuggestForOptional={
                              props.useCase === "hops-planing"
                            }
                          />
                        )}
                      </>
                    )}
                  </div>
                }
              >
                <span
                  tabIndex={0}
                  className="table__data-content-wrapper table__data-content-wrapper--course"
                >
                  {course.courseNumber}
                </span>
              </Dropdown>
            </ListItemIndicator>
          </div>
        </ListItem>
      );
    });

    /**
     * Proggress value of completed mandatory courses
     */
    const mandatoryProggress = (completedCourseCount / mandatoryCount) * 100;

    return (
      <div key={sSubject.name}>
        <ListContainer modifiers={["subject__name"]}>
          <ListItem className="list-subject-name">
            <div
              className="list-subject-name-proggress"
              style={{ width: `${mandatoryProggress}%` }}
            />
            <span style={{ zIndex: 10 }}>{sSubject.name}</span>
          </ListItem>
        </ListContainer>
        <ListContainer modifiers={["subject__courses"]}>
          {courses}
        </ListContainer>
      </div>
    );
  });

  return <div className="list-row__container">{renderRows}</div>;
};

export default HopsCourseList;
