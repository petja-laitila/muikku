package fi.muikku.plugins.assessmentrequest;

import fi.muikku.plugins.wall.WallFeedItem;

public class UserFeedAssessmentRequestItem extends WallFeedItem {

  private AssessmentRequest assessmentRequest;

  public UserFeedAssessmentRequestItem(AssessmentRequest assessmentRequest) {
    super(assessmentRequest.getDate());
    this.assessmentRequest = assessmentRequest;
  }

  public AssessmentRequest getAssessmentRequest() {
    return assessmentRequest;
  }
  
  @Override
  public String getType() {
    return "assessmentRequests";
  }
  
  @Override
  public String getIdentifier() {
    return getAssessmentRequest().getId().toString();
  }

}
