package fi.muikku.plugins.guidancerequest;

import java.io.FileNotFoundException;
import java.util.Date;
import java.util.List;

import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

import org.apache.commons.lang3.StringUtils;

import com.ocpsoft.pretty.faces.annotation.URLAction;
import com.ocpsoft.pretty.faces.annotation.URLMapping;
import com.ocpsoft.pretty.faces.annotation.URLMappings;

import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.plugins.workspace.WorkspaceNavigationBackingBean;
import fi.muikku.schooldata.WorkspaceController;
import fi.muikku.session.SessionController;

@Named
@Stateful
@RequestScoped
@URLMappings(mappings = {
  @URLMapping(
      id = "workspaceGuidanceRequests", 
      pattern = "/workspace/#{workspaceGuidanceRequestsBackingBean.workspaceUrlName}/guidancerequest/", 
      viewId = "/guidancerequest/workspace_guidancerequest.jsf")
})
public class WorkspaceGuidanceRequestsBackingBean {
  
  @Inject
  private GuidanceRequestController guidanceRequestController;
  
  @Inject
  private SessionController sessionController;
  
  @Inject
  private WorkspaceController workspaceController;
  
  @Inject
  private WorkspaceNavigationBackingBean workspaceNavigationBackingBean;

  @URLAction
  public void init() throws FileNotFoundException {
    String urlName = getWorkspaceUrlName();
    if (StringUtils.isBlank(urlName)) {
      throw new FileNotFoundException();
    }
    
    WorkspaceEntity workspaceEntity = workspaceController.findWorkspaceEntityByUrlName(urlName);
    if (workspaceEntity == null) {
      throw new FileNotFoundException();
    }
    
    workspaceNavigationBackingBean.setWorkspaceUrlName(urlName);

    workspaceId = workspaceEntity.getId();
  }

  public List<WorkspaceGuidanceRequest> listOwnedGuidanceRequests() {
    return guidanceRequestController.listWorkspaceGuidanceRequestsByWorkspaceAndUser(getWorkspaceEntity(), sessionController.getUser());
  }
  
  public GuidanceRequest createGuidanceRequest() {
    return guidanceRequestController.createWorkspaceGuidanceRequest(getWorkspaceEntity(), 
        sessionController.getUser(), new Date(), getNewGuidanceRequestMessage());
  }

  public String getNewGuidanceRequestMessage() {
    return newGuidanceRequestMessage;
  }

  public void setNewGuidanceRequestMessage(String newGuidanceRequestMessage) {
    this.newGuidanceRequestMessage = newGuidanceRequestMessage;
  }

  private WorkspaceEntity getWorkspaceEntity() {
    return workspaceController.findWorkspaceEntityById(getWorkspaceId());
  }

  public Long getWorkspaceId() {
    return workspaceId;
  }

  public void setWorkspaceId(Long workspaceId) {
    this.workspaceId = workspaceId;
  }
  
  public String getWorkspaceUrlName() {
    return workspaceUrlName;
  }

  public void setWorkspaceUrlName(String workspaceUrlName) {
    this.workspaceUrlName = workspaceUrlName;
  }
  
  private Long workspaceId;
  private String workspaceUrlName;
  private String newGuidanceRequestMessage;
}