package fi.otavanopisto.muikku.plugins.assessmentrequest;

import java.util.Date;

public class WorkspaceAssessmentState {

  public static final String UNASSESSED = "unassessed";       // no request, no grade
  public static final String PENDING = "pending";             // active request, no grade
  public static final String PENDING_PASS = "pending_pass";   // active request, earlier passing grade
  public static final String PENDING_FAIL = "pending_fail";   // active request, earlier failing grade
  public static final String PASS = "pass";                   // no request, passing grade
  public static final String FAIL = "fail";                   // no request, failing grade
  public static final String INCOMPLETE = "incomplete";       // teacher has requested changes

  public WorkspaceAssessmentState() {
  }

  public WorkspaceAssessmentState(String workspaceSubjectIdentifier, String state) {
    this.workspaceSubjectIdentifier = workspaceSubjectIdentifier;
    this.state = state;
  }

  public WorkspaceAssessmentState(String workspaceSubjectIdentifier, String state, Date date) {
    this.workspaceSubjectIdentifier = workspaceSubjectIdentifier;
    this.state = state;
    this.date = date;
  }

  public WorkspaceAssessmentState(String workspaceSubjectIdentifier, String state, Date date, String text) {
    this.workspaceSubjectIdentifier = workspaceSubjectIdentifier;
    this.state = state;
    this.date = date;
    this.text = text;
  }

  public WorkspaceAssessmentState(String workspaceSubjectIdentifier, String state, Date date, String text, String grade, Date gradeDate) {
    this.workspaceSubjectIdentifier = workspaceSubjectIdentifier;
    this.state = state;
    this.date = date;
    this.text = text;
    this.grade = grade;
    this.gradeDate = gradeDate;
  }

  public String getState() {
    return state;
  }

  public Date getDate() {
    return date;
  }

  public void setState(String state) {
    this.state = state;
  }

  public void setDate(Date date) {
    this.date = date;
  }

  public String getGrade() {
    return grade;
  }

  public void setGrade(String grade) {
    this.grade = grade;
  }

  public String getText() {
    return text;
  }

  public void setText(String text) {
    this.text = text;
  }

  public Date getGradeDate() {
    return gradeDate;
  }

  public void setGradeDate(Date gradeDate) {
    this.gradeDate = gradeDate;
  }

  public String getWorkspaceSubjectIdentifier() {
    return workspaceSubjectIdentifier;
  }

  public void setWorkspaceSubjectIdentifier(String workspaceSubjectIdentifier) {
    this.workspaceSubjectIdentifier = workspaceSubjectIdentifier;
  }

  private Date date;
  private String state;
  private String grade;
  private Date gradeDate;
  private String text;
  private String workspaceSubjectIdentifier;
  
}