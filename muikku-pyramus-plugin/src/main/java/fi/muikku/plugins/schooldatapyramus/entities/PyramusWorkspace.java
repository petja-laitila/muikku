package fi.muikku.plugins.schooldatapyramus.entities;

import java.util.Date;

import fi.muikku.plugins.schooldatapyramus.SchoolDataPyramusPluginDescriptor;
import fi.muikku.schooldata.entity.Workspace;

public class PyramusWorkspace implements Workspace {

  public PyramusWorkspace(String identifier, String name, String description, String workspaceTypeId,
      String courseIdentifierIdentifier, Date modified, String subjectIdentifier, String educationTypeIdentifier) {
    this.identifier = identifier;
    this.name = name;
    this.description = description;
    this.workspaceTypeId = workspaceTypeId;
    this.courseIdentifierIdentifier = courseIdentifierIdentifier;
    this.modified = modified;
    this.subjectIdentifier = subjectIdentifier;
    this.educationTypeIdentifier = educationTypeIdentifier;
  }

  @Override
  public String getSchoolDataSource() {
    return SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE;
  }

  @Override
  public String getIdentifier() {
    return identifier;
  }

  @Override
  public String getName() {
    return name;
  }

  @Override
  public void setName(String name) {
    this.name = name;
  }

  @Override
  public String getWorkspaceTypeId() {
    return workspaceTypeId;
  }

  @Override
  public String getCourseIdentifierIdentifier() {
    return courseIdentifierIdentifier;
  }

  @Override
  public String getDescription() {
    return description;
  }

  @Override
  public void setDescription(String description) {
    this.description = description;
  }

  @Override
  public Date getLastModified() {
    return modified;
  }

  @Override
  public String getSearchId() {
    return getIdentifier() + '/' + getSchoolDataSource();
  }
  
  @Override
  public String getSubjectIdentifier() {
    return subjectIdentifier;
  }

  @Override
  public String getEducationTypeIdentifier() {
    return educationTypeIdentifier;
  }

  private String identifier;

  private String name;

  private String workspaceTypeId;

  private String courseIdentifierIdentifier;

  private String description;
  
  private String subjectIdentifier;

  private String educationTypeIdentifier;

  private Date modified;
}
