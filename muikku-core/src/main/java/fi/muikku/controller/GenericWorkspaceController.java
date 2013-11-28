package fi.muikku.controller;

import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.inject.Named;

import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.model.workspace.WorkspaceTypeEntity;
import fi.muikku.schooldata.WorkspaceController;
import fi.muikku.schooldata.entity.CourseIdentifier;
import fi.muikku.schooldata.entity.Workspace;
import fi.muikku.schooldata.entity.WorkspaceType;
import fi.muikku.schooldata.entity.WorkspaceUser;

@RequestScoped
@Named ("Workspace")
public class GenericWorkspaceController {

  @Inject
  private WorkspaceController workspaceController;
  
  /* WorkspaceTypeEntity */
  
  public List<WorkspaceTypeEntity> listWorkspaceTypeEntities() {
    return workspaceController.listWorkspaceTypeEntities();
  }

  public WorkspaceTypeEntity findWorkspaceTypeEntity(WorkspaceType workspaceType) {
    return workspaceController.findWorkspaceTypeEntity(workspaceType);
  }
  
  public WorkspaceTypeEntity updateWorkspaceTypeEntityName(WorkspaceTypeEntity workspaceTypeEntity, String name) {
    return workspaceController.updateWorkspaceTypeEntityName(workspaceTypeEntity, name);
  }

  /* WorkspaceType */

  public WorkspaceTypeEntity findWorkspaceTypeEntityById(Long id) {
    return workspaceController.findWorkspaceTypeEntityById(id);
  }
  
  public List<WorkspaceType> listWorkspaceTypes() {
    return workspaceController.listWorkspaceTypes();
  }
  
  public WorkspaceType findWorkspaceTypeByDataSourceAndIdentifier(String schoolDataSource, String identifier) {
    return workspaceController.findWorkspaceTypeByDataSourceAndIdentifier(schoolDataSource, identifier);
  }
  
  public WorkspaceTypeEntity findWorkspaceTypeEntityByDataSourceAndIdentifier(String schoolDataSource, String identifier) {
    return workspaceController.findWorkspaceTypeEntityByDataSourceAndIdentifier(schoolDataSource, identifier);
  }

  public void setWorkspaceTypeEntity(WorkspaceType workspaceType, WorkspaceTypeEntity workspaceTypeEntity) {
    workspaceController.setWorkspaceTypeEntity(workspaceType, workspaceTypeEntity);
  }

  /* Workspace */

  public Workspace findWorkspace(WorkspaceEntity workspaceEntity) {
    return workspaceController.findWorkspace(workspaceEntity);
  }

  public List<Workspace> listWorkspaces() {
    return workspaceController.listWorkspaces();
  }

  public List<Workspace> listWorkspacesByCourseIdentifier(CourseIdentifier courseIdentifier) {
    return workspaceController.listWorkspacesByCourseIdentifier(courseIdentifier);
  }
  
  /* Workspace Entity */
  
  public WorkspaceEntity findWorkspaceEntity(Workspace workspace) {
    return workspaceController.findWorkspaceEntity(workspace);
  }
  
  public WorkspaceEntity findWorkspaceEntityById(Long workspaceId) {
    return workspaceController.findWorkspaceEntityById(workspaceId);
  }

  public WorkspaceEntity findWorkspaceEntityByUrlName(String urlName) {
    return workspaceController.findWorkspaceEntityByUrlName(urlName);
  }

  /* WorkspaceUsers */
  
  public List<WorkspaceUser> listWorkspaceUsers(Workspace workspace) {
    return workspaceController.listWorkspaceUsers(workspace);
  }

  public List<WorkspaceUser> listWorkspaceUsers(WorkspaceEntity workspaceEntity) {
    return workspaceController.listWorkspaceUsers(workspaceEntity);
  }

  public int countWorkspaceUsers(WorkspaceEntity workspaceEntity) {
    return workspaceController.countWorkspaceUsers(workspaceEntity);
  }

}