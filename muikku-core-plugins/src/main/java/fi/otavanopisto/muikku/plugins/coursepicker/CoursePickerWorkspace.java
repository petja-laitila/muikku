package fi.otavanopisto.muikku.plugins.coursepicker;

import java.util.Date;

import fi.otavanopisto.muikku.rest.model.OrganizationRESTModel;

public class CoursePickerWorkspace {

  public CoursePickerWorkspace() {
  }

  public CoursePickerWorkspace(
      Long id,
      String urlName,
      Boolean archived,
      Boolean published,
      String name,
      String nameExtension,
      String description,
      Long numVisits,
      Date lastVisit,
      String educationTypeName,
      boolean canSignup,
      boolean isCourseMember, 
      boolean isEvaluated,
      boolean hasCustomImage,
      OrganizationRESTModel organization) {
    super();
    this.id = id;
    this.urlName = urlName;
    this.archived = archived;
    this.published = published;
    this.name = name;
    this.nameExtension = nameExtension;
    this.description = description;
    this.numVisits = numVisits;
    this.lastVisit = lastVisit;
    this.canSignup = canSignup;
    this.isCourseMember = isCourseMember;
    this.isEvaluated = isEvaluated;
    this.educationTypeName = educationTypeName;
    this.hasCustomImage = hasCustomImage;
    this.organization = organization;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getUrlName() {
    return urlName;
  }

  public void setUrlName(String urlName) {
    this.urlName = urlName;
  }

  public Boolean getArchived() {
    return archived;
  }

  public void setArchived(Boolean archived) {
    this.archived = archived;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getNameExtension() {
    return nameExtension;
  }

  public void setNameExtension(String nameExtension) {
    this.nameExtension = nameExtension;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public Long getNumVisits() {
    return numVisits;
  }

  public void setNumVisits(Long numVisits) {
    this.numVisits = numVisits;
  }

  public Date getLastVisit() {
    return lastVisit;
  }

  public void setLastVisit(Date lastVisit) {
    this.lastVisit = lastVisit;
  }
  
  public Boolean getPublished() {
    return published;
  }
  
  public void setPublished(Boolean published) {
    this.published = published;
  }

  public Boolean getCanSignup() {
    return canSignup;
  }

  public void setCanSignup(Boolean canSignup) {
    this.canSignup = canSignup;
  }
  
  public Boolean getIsCourseMember() {
    return isCourseMember;
  }

  public void setIsCourseMember(Boolean isCourseMember) {
    this.isCourseMember = isCourseMember;
  }
  
  public Boolean getIsEvaluated() {
    return isEvaluated;
  }
  
  public void setIsEvaluated(Boolean isEvaluated) {
    this.isEvaluated = isEvaluated;
  }

  public String getEducationTypeName() {
    return educationTypeName;
  }
  
  public void setEducationTypeName(String educationTypeName) {
    this.educationTypeName = educationTypeName;
  }
  
  public boolean getHasCustomImage() {
    return hasCustomImage;
  }

  public void setHasCustomImage(boolean hasCustomImage) {
    this.hasCustomImage = hasCustomImage;
  }

  public OrganizationRESTModel getOrganization() {
    return organization;
  }

  public void setOrganization(OrganizationRESTModel organization) {
    this.organization = organization;
  }

  private Long id;
  private String urlName;
  private Boolean archived;
  private String name;
  private String nameExtension;
  private String description;
  private Long numVisits;
  private Date lastVisit;
  private Boolean published;
  private Boolean canSignup;
  private Boolean isCourseMember;
  private Boolean isEvaluated;
  private String educationTypeName;
  private boolean hasCustomImage;
  private OrganizationRESTModel organization;

}
