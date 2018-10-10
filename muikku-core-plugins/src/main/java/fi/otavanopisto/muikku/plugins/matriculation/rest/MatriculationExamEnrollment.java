package fi.otavanopisto.muikku.plugins.matriculation.rest;

import java.util.List;

public class MatriculationExamEnrollment {
  
  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getSsn() {
    return ssn;
  }

  public void setSsn(String ssn) {
    this.ssn = ssn;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPhone() {
    return phone;
  }

  public void setPhone(String phone) {
    this.phone = phone;
  }

  public String getAddress() {
    return address;
  }

  public void setAddress(String address) {
    this.address = address;
  }

  public String getPostalCode() {
    return postalCode;
  }

  public void setPostalCode(String postalCode) {
    this.postalCode = postalCode;
  }

  public String getCity() {
    return city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getNationalStudentNumber() {
    return nationalStudentNumber;
  }

  public void setNationalStudentNumber(String nationalStudentNumber) {
    this.nationalStudentNumber = nationalStudentNumber;
  }

  public String getGuider() {
    return guider;
  }

  public void setGuider(String guider) {
    this.guider = guider;
  }

  public String getEnrollAs() {
    return enrollAs;
  }

  public void setEnrollAs(String enrollAs) {
    this.enrollAs = enrollAs;
  }

  public int getNumMandatoryCourses() {
    return numMandatoryCourses;
  }

  public void setNumMandatoryCourses(int numMandatoryCourses) {
    this.numMandatoryCourses = numMandatoryCourses;
  }

  public boolean isRestartExam() {
    return restartExam;
  }

  public void setRestartExam(boolean restartExam) {
    this.restartExam = restartExam;
  }

  public String getLocation() {
    return location;
  }

  public void setLocation(String location) {
    this.location = location;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  public boolean isCanPublishName() {
    return canPublishName;
  }

  public void setCanPublishName(boolean canPublishName) {
    this.canPublishName = canPublishName;
  }
  
  public Long getStudentId() {
    return studentId;
  }

  public void setStudentId(Long studentId) {
    this.studentId = studentId;
  }

  public String getState() {
    return state;
  }

  public void setState(String state) {
    this.state = state;
  }
  
  public List<MatriculationExamAttendance> getAttendances() {
    return attendances;
  }

  public void setAttendances(List<MatriculationExamAttendance> attendances) {
    this.attendances = attendances;
  }

  private String name;
  private String ssn;
  private String email;
  private String phone;
  private String address;
  private String postalCode;
  private String city;
  private String nationalStudentNumber;
  private String guider;
  private String enrollAs;
  private int numMandatoryCourses;
  private boolean restartExam;
  private String location;
  private String message;
  private boolean canPublishName;
  private Long studentId;
  private String state;
  private List<MatriculationExamAttendance> attendances;

}
