package fi.muikku.users;

import java.util.List;
import java.util.logging.Logger;

import javax.inject.Inject;

import fi.muikku.dao.base.SchoolDataSourceDAO;
import fi.muikku.dao.workspace.WorkspaceUserEntityDAO;
import fi.muikku.model.base.SchoolDataSource;
import fi.muikku.model.users.UserEntity;
import fi.muikku.model.users.UserSchoolDataIdentifier;
import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.model.workspace.WorkspaceRoleEntity;
import fi.muikku.model.workspace.WorkspaceUserEntity;

public class WorkspaceUserEntityController {

  @Inject
  private Logger logger;

  @Inject
  private UserSchoolDataIdentifierController userSchoolDataIdentifierController;
  
  @Inject
  private SchoolDataSourceDAO schoolDataSourceDAO;
  
  @Inject
  private WorkspaceUserEntityDAO workspaceUserEntityDAO;

  public WorkspaceUserEntity createWorkspaceUserEntity(UserSchoolDataIdentifier userSchoolDataIdentifier, WorkspaceEntity workspaceEntity, String identifier, WorkspaceRoleEntity workspaceUserRole) {
    return workspaceUserEntityDAO.create(userSchoolDataIdentifier, workspaceEntity, workspaceUserRole, identifier, Boolean.FALSE);
  }

  public WorkspaceUserEntity findWorkspaceUserEntityById(Long id) {
    return workspaceUserEntityDAO.findById(id);
  }

  public WorkspaceUserEntity findWorkspaceUserEntityByWorkspaceAndIdentifier(WorkspaceEntity workspaceEntity, String identifier) {
    return workspaceUserEntityDAO.findByWorkspaceAndIdentifier(workspaceEntity, identifier);
  }
  
  public WorkspaceUserEntity findWorkspaceUserEntityByWorkspaceAndUserSchoolDataIdentifier(WorkspaceEntity workspaceEntity, UserSchoolDataIdentifier userSchoolDataIdentifier) {
    return workspaceUserEntityDAO.findByWorkspaceEntityAndUserSchoolDataIdentifier(workspaceEntity, userSchoolDataIdentifier);
  }
  
  public WorkspaceUserEntity findWorkspaceUserEntityByWorkspaceAndUserDataSourceAndUserIdentifier(WorkspaceEntity workspaceEntity, String dataSource, String identifier) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(dataSource);
    if (schoolDataSource == null) {
      logger.severe("Could not find datasource " + dataSource);
      return null;
    }
    
    return findWorkspaceUserEntityByWorkspaceAndUserDataSourceAndUserIdentifier(workspaceEntity, schoolDataSource, identifier);
  }
  
  public WorkspaceUserEntity findWorkspaceUserEntityByWorkspaceAndUserDataSourceAndUserIdentifier(WorkspaceEntity workspaceEntity,
      SchoolDataSource schoolDataSource, String identifier) {
    
    UserSchoolDataIdentifier userSchoolDataIdentifier = userSchoolDataIdentifierController.findUserSchoolDataIdentifierByDataSourceAndIdentifier(schoolDataSource, identifier);
    if (userSchoolDataIdentifier == null) {
      return null;
    }
    
    return findWorkspaceUserEntityByWorkspaceAndUserSchoolDataIdentifier(workspaceEntity, userSchoolDataIdentifier);
  }

  public List<WorkspaceUserEntity> listWorkspaceUserEntities(WorkspaceEntity workspaceEntity) {
    return workspaceUserEntityDAO.listByWorkspace(workspaceEntity);
  }

  public List<WorkspaceUserEntity> listWorkspaceUserEntitiesByRole(WorkspaceEntity workspaceEntity, WorkspaceRoleEntity role) {
    return workspaceUserEntityDAO.listByWorkspaceAndRole(workspaceEntity, role);
  }

  public List<WorkspaceUserEntity> listWorkspaceUserEntitiesByRoles(WorkspaceEntity workspaceEntity, List<WorkspaceRoleEntity> roles) {
    return workspaceUserEntityDAO.listByWorkspaceAndRoles(workspaceEntity, roles);
  }
  
  public List<WorkspaceUserEntity> listWorkspaceUserEntitiesByUserEntity(UserEntity userEntity) {
    return workspaceUserEntityDAO.listByUserEntityAndArchived(userEntity, Boolean.FALSE);
  }

  public List<WorkspaceUserEntity> listWorkspaceUserEntitiesByWorkspaceAndUser(WorkspaceEntity workspaceEntity, UserEntity userEntity) {
    return workspaceUserEntityDAO.listByWorkspaceEntityAndUserEntityAndArchived(workspaceEntity, userEntity, Boolean.FALSE);
  }
  
  public void archiveWorkspaceUserEntity(WorkspaceUserEntity workspaceUserEntity) {
    workspaceUserEntityDAO.updateArchived(workspaceUserEntity, Boolean.TRUE);
  }

  
}