package fi.otavanopisto.muikku.schooldata;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.inject.Inject;

import fi.otavanopisto.muikku.dao.base.SchoolDataSourceDAO;
import fi.otavanopisto.muikku.dao.workspace.WorkspaceEntityDAO;
import fi.otavanopisto.muikku.dao.workspace.WorkspaceMaterialProducerDAO;
import fi.otavanopisto.muikku.dao.workspace.WorkspaceRoleEntityDAO;
import fi.otavanopisto.muikku.dao.workspace.WorkspaceSettingsDAO;
import fi.otavanopisto.muikku.dao.workspace.WorkspaceUserEntityDAO;
import fi.otavanopisto.muikku.dao.workspace.WorkspaceUserSignupDAO;
import fi.otavanopisto.muikku.model.base.SchoolDataSource;
import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.model.users.UserGroupEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceMaterialProducer;
import fi.otavanopisto.muikku.model.workspace.WorkspaceRoleArchetype;
import fi.otavanopisto.muikku.model.workspace.WorkspaceRoleEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceSettings;
import fi.otavanopisto.muikku.model.workspace.WorkspaceUserEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceUserSignup;
import fi.otavanopisto.muikku.schooldata.entity.User;
import fi.otavanopisto.muikku.schooldata.entity.Workspace;
import fi.otavanopisto.muikku.schooldata.entity.WorkspaceType;
import fi.otavanopisto.muikku.schooldata.entity.WorkspaceUser;
import fi.otavanopisto.muikku.users.WorkspaceUserEntityController;

public class WorkspaceController {
  
  @Inject
  private Logger logger;
  
  @Inject
  private WorkspaceUserEntityController workspaceUserEntityController;

  @Inject
  private WorkspaceSchoolDataController workspaceSchoolDataController;

  @Inject
  private WorkspaceEntityDAO workspaceEntityDAO;

  @Inject
  private WorkspaceUserEntityDAO workspaceUserEntityDAO;

  @Inject
  private SchoolDataSourceDAO schoolDataSourceDAO;

  @Inject
  private WorkspaceSettingsDAO workspaceSettingsDAO;

  @Inject
  private WorkspaceUserSignupDAO workspaceUserSignupDAO;

  @Inject
  private WorkspaceMaterialProducerDAO workspaceMaterialProducerDAO;
  
  @Inject
  private WorkspaceRoleEntityDAO workspaceRoleEntityDAO;

  /* Workspace */

  public Workspace findWorkspace(WorkspaceEntity workspaceEntity) {
    return workspaceSchoolDataController.findWorkspace(workspaceEntity);
  }

  public Workspace findWorkspace(SchoolDataIdentifier workspaceIdentifier) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(workspaceIdentifier.getDataSource());
    if (schoolDataSource == null) {
      logger.severe(String.format("Could not find school data source %s", workspaceIdentifier.getDataSource()));
      return null;
    }
    
    return findWorkspace(schoolDataSource, workspaceIdentifier.getIdentifier());
  }

  public Workspace findWorkspace(SchoolDataSource schoolDataSource, String identifier) {
    return workspaceSchoolDataController.findWorkspace(schoolDataSource, identifier);
  }

  public List<Workspace> listWorkspaces() {
    return workspaceSchoolDataController.listWorkspaces();
  }

  public List<Workspace> listWorkspaces(String schoolDataSource) {
    return workspaceSchoolDataController.listWorkspaces(schoolDataSource);
  }
  
  public Workspace copyWorkspace(SchoolDataIdentifier workspaceIdentifier, String name, String nameExtension, String description, SchoolDataIdentifier destinationOrganizationIdentifier) {
    return workspaceSchoolDataController.copyWorkspace(workspaceIdentifier, name, nameExtension, description, destinationOrganizationIdentifier);
  }

  public Workspace updateWorkspace(Workspace workspace) {
    return workspaceSchoolDataController.updateWorkspace(workspace);
  }
  
  public void updateWorkspaceStudentActivity(WorkspaceUser workspaceUser, boolean active) {
    workspaceSchoolDataController.updateWorkspaceStudentActivity(workspaceUser, active);
  }

  public void archiveWorkspace(Workspace workspace) {
    WorkspaceEntity workspaceEntity = workspaceSchoolDataController.findWorkspaceEntity(workspace);
    if (workspaceEntity != null) {
      archiveWorkspaceEntity(workspaceEntity);
    }

    workspaceSchoolDataController.removeWorkspace(workspace);
  }

  public void deleteWorkspace(Workspace workspace) {
    WorkspaceEntity workspaceEntity = workspaceSchoolDataController.findWorkspaceEntity(workspace);
    if (workspaceEntity != null) {
      deleteWorkspaceEntity(workspaceEntity);
    }

    workspaceSchoolDataController.removeWorkspace(workspace);
  }
  
  /* WorkspaceType */

  public WorkspaceType findWorkspaceType(SchoolDataIdentifier identifier) {
    if (identifier == null) {
      return null;
    }
    
    return workspaceSchoolDataController.findWorkspaceTypeByDataSourceAndIdentifier(identifier.getDataSource(), identifier.getIdentifier());
  }
  
  public List<WorkspaceType> listWorkspaceTypes() {
    return workspaceSchoolDataController.listWorkspaceTypes();
  }

  /* Workspace Entity */

  public WorkspaceEntity findWorkspaceEntity(Workspace workspace) {
    return workspaceSchoolDataController.findWorkspaceEntity(workspace);
  }

  public WorkspaceEntity findWorkspaceEntityById(Long workspaceId) {
    return workspaceEntityDAO.findById(workspaceId);
  }

  public WorkspaceEntity findWorkspaceEntityById(SchoolDataIdentifier identifier) {
    return findWorkspaceEntityByDataSourceAndIdentifier(identifier.getDataSource(), identifier.getIdentifier());
  }

  public WorkspaceEntity findWorkspaceEntityByUrlName(String urlName) {
    return workspaceEntityDAO.findByUrlNameAndArchived(urlName, Boolean.FALSE);
  }

  public WorkspaceEntity findWorkspaceEntityByDataSourceAndIdentifier(SchoolDataSource dataSource, String identifier) {
    return workspaceEntityDAO.findByDataSourceAndIdentifier(dataSource, identifier);
  }

  public WorkspaceEntity findWorkspaceEntityByDataSourceAndIdentifier(String schoolDataSource, String identifier) {
    SchoolDataSource dataSource = schoolDataSourceDAO.findByIdentifier(schoolDataSource);
    if (dataSource != null) {
      return findWorkspaceEntityByDataSourceAndIdentifier(dataSource, identifier);
    } else {
      logger.log(Level.SEVERE, "Could not find school data source '" + schoolDataSource + "'");
      return null;
    }
  }

  public List<WorkspaceEntity> listWorkspaceEntities() {
    return workspaceEntityDAO.listAll();
  }
  
  public List<WorkspaceEntity> listPublishedWorkspaceEntities() {
    return workspaceEntityDAO.listByPublished(Boolean.TRUE);
  }
  
  @Deprecated
  public List<WorkspaceEntity> listWorkspaceEntitiesByUser(UserEntity userEntity, boolean includeUnpublished) {
    List<WorkspaceEntity> result = new ArrayList<>();
    List<WorkspaceUserEntity> workspaceUserEntities = workspaceUserEntityController.listWorkspaceUserEntitiesByUserEntity(userEntity);
    for (WorkspaceUserEntity workspaceUserEntity : workspaceUserEntities) {
      if (includeUnpublished || workspaceUserEntity.getWorkspaceEntity().getPublished()) {
        if (!result.contains(workspaceUserEntity.getWorkspaceEntity())) {
          result.add(workspaceUserEntity.getWorkspaceEntity());
        }
      }
    }
    return result;
  }

  public List<WorkspaceEntity> listWorkspaceEntitiesBySchoolDataSource(String schoolDataSource) {
    SchoolDataSource dataSource = schoolDataSourceDAO.findByIdentifier(schoolDataSource);
    if (dataSource != null) {
      return listWorkspaceEntitiesBySchoolDataSource(dataSource);
    } else {
      logger.log(Level.SEVERE, "Could not find school data source '" + schoolDataSource
          + "' while listing workspaceEntities by school data source");
      return null;
    }
  }

  public List<WorkspaceEntity> listWorkspaceEntitiesBySchoolDataSource(SchoolDataSource schoolDataSource) {
    return workspaceEntityDAO.listByDataSource(schoolDataSource);
  }

  public WorkspaceEntity archiveWorkspaceEntity(WorkspaceEntity workspaceEntity) {
    return workspaceEntityDAO.updateArchived(workspaceEntity, Boolean.TRUE);
  }

  private void deleteWorkspaceEntity(WorkspaceEntity workspaceEntity) {

    // Delete settings

    WorkspaceSettings workspaceSettings = findWorkspaceSettings(workspaceEntity);
    if (workspaceSettings != null) {
      workspaceSettingsDAO.delete(workspaceSettings);
    }

    // Workspace Users
    
    List<WorkspaceUserEntity> workspaceUserEntities = workspaceUserEntityDAO.listByWorkspaceEntity(workspaceEntity);
    for (WorkspaceUserEntity workspaceUserEntity : workspaceUserEntities) {
      workspaceUserEntityDAO.delete(workspaceUserEntity);
    }

    workspaceEntityDAO.delete(workspaceEntity);
  }

  /* WorkspaceUsers */

  public WorkspaceUser createWorkspaceUser(Workspace workspace, User user, WorkspaceRoleArchetype role) {
    return workspaceSchoolDataController.createWorkspaceUser(workspace, user, role);
  }

  public List<WorkspaceUser> listWorkspaceStudents(WorkspaceEntity workspaceEntity) {
    Workspace workspace = findWorkspace(workspaceEntity);
    if (workspace != null) {
      return workspaceSchoolDataController.listWorkspaceStudents(workspace);      
    }
    else {
      logger.severe(String.format("Workspace not found for workspace entity %s", workspaceEntity == null ? "-" : workspaceEntity.getId()));
    }
    return Collections.emptyList();
  }

  public List<WorkspaceUser> listWorkspaceStudents(WorkspaceEntity workspaceEntity, boolean active) {
    Workspace workspace = findWorkspace(workspaceEntity);
    if (workspace != null) {
      return workspaceSchoolDataController.listWorkspaceStudents(workspace, active);      
    }
    else {
      logger.severe(String.format("Workspace not found for workspace entity %s", workspaceEntity == null ? "-" : workspaceEntity.getId()));
    }
    return Collections.emptyList();
  }

  public List<WorkspaceUser> listWorkspaceStaffMembers(WorkspaceEntity workspaceEntity) {
    Workspace workspace = findWorkspace(workspaceEntity);
    if (workspace != null) {
      return workspaceSchoolDataController.listWorkspaceStaffMembers(workspace);      
    }
    else {
      logger.severe(String.format("Workspace not found for workspace entity %s", workspaceEntity == null ? "-" : workspaceEntity.getId()));
    }
    return Collections.emptyList();
  }
  
  public WorkspaceUser findWorkspaceUserByWorkspaceAndUser(SchoolDataIdentifier workspaceIdentifier, SchoolDataIdentifier userIdentifier) {
    return workspaceSchoolDataController.findWorkspaceUserByWorkspaceAndUser(workspaceIdentifier, userIdentifier);
  }
  
  public WorkspaceUser findWorkspaceUserByWorkspaceEntityAndUser(WorkspaceEntity workspaceEntity, SchoolDataIdentifier userIdentifier) {
    SchoolDataIdentifier workspaceIdentifier = workspaceEntity.schoolDataIdentifier();
    return findWorkspaceUserByWorkspaceAndUser(workspaceIdentifier, userIdentifier);
  }
  
  public WorkspaceUser findWorkspaceUser(WorkspaceUserEntity workspaceUserEntity) {
    return workspaceSchoolDataController.findWorkspaceUser(workspaceUserEntity);
  }
  
  public WorkspaceUser findWorkspaceUser(SchoolDataIdentifier workspaceIdentifier, SchoolDataIdentifier workspaceUserIdentifier) {
    return workspaceSchoolDataController.findWorkspaceUser(workspaceIdentifier, workspaceUserIdentifier);
  }
  
  /* WorkspaceRoleEntity */

  public WorkspaceRoleEntity findWorkspaceRoleEntityByArchetype(WorkspaceRoleArchetype archetype) {
    return workspaceRoleEntityDAO.findByArchetype(archetype);
  }
  
  /* WorkspaceSettings */

  public WorkspaceSettings findWorkspaceSettings(WorkspaceEntity workspaceEntity) {
    return workspaceSettingsDAO.findByWorkspaceEntity(workspaceEntity);
  }

  /* WorkspaceUserSignup */

  public WorkspaceUserSignup createWorkspaceUserSignup(WorkspaceEntity workspaceEntity, UserEntity userEntity,
      Date date, String message) {
    return workspaceUserSignupDAO.create(workspaceEntity, userEntity, date, message);
  }
  
  public List<WorkspaceUserSignup> listWorkspaceUserSignups() {
    return workspaceUserSignupDAO.listAll();
  }
  
  public void deleteWorkspaceUserSignup(WorkspaceUserSignup workspaceUserSignup) {
    workspaceUserSignupDAO.delete(workspaceUserSignup);
  }
  
  /* WorkspaceMaterialProducer */

  public WorkspaceMaterialProducer createWorkspaceMaterialProducer(WorkspaceEntity workspaceEntity, String name) {
    return workspaceMaterialProducerDAO.create(workspaceEntity, name);
  }

  public WorkspaceMaterialProducer findWorkspaceMaterialProducer(Long workspaceMaterialProducerId) {
    return workspaceMaterialProducerDAO.findById(workspaceMaterialProducerId);
  }
  
  public List<WorkspaceMaterialProducer> listWorkspaceMaterialProducers(WorkspaceEntity workspaceEntity) {
    return workspaceMaterialProducerDAO.listByWorkspaceEntity(workspaceEntity);
  }

  public void deleteWorkspaceMaterialProducer(WorkspaceMaterialProducer workspaceMaterialProducer) {
    workspaceMaterialProducerDAO.delete(workspaceMaterialProducer); 
  }

  public void addWorkspaceSignupGroup(WorkspaceEntity workspaceEntity, UserGroupEntity userGroupEntity) {
    workspaceSchoolDataController.addWorkspaceSignupGroup(workspaceEntity.schoolDataIdentifier(), userGroupEntity.schoolDataIdentifier());
  }

  public Set<SchoolDataIdentifier> listWorkspaceSignupGroups(WorkspaceEntity workspaceEntity) {
    return workspaceSchoolDataController.listWorkspaceSignupGroups(workspaceEntity.schoolDataIdentifier());
  }

  public void removeWorkspaceSignupGroup(WorkspaceEntity workspaceEntity, UserGroupEntity userGroupEntity) {
    workspaceSchoolDataController.removeWorkspaceSignupGroup(workspaceEntity.schoolDataIdentifier(), userGroupEntity.schoolDataIdentifier());
  }
  
}
