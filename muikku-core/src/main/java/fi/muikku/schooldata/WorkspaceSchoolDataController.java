package fi.muikku.schooldata;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.Stateful;
import javax.enterprise.context.Dependent;
import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;

import fi.muikku.dao.base.SchoolDataSourceDAO;
import fi.muikku.dao.users.UserSchoolDataIdentifierDAO;
import fi.muikku.dao.workspace.WorkspaceEntityDAO;
import fi.muikku.dao.workspace.WorkspaceTypeSchoolDataIdentifierDAO;
import fi.muikku.dao.workspace.WorkspaceUserEntityDAO;
import fi.muikku.model.base.SchoolDataSource;
import fi.muikku.model.users.UserEntity;
import fi.muikku.model.users.UserSchoolDataIdentifier;
import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.model.workspace.WorkspaceTypeEntity;
import fi.muikku.model.workspace.WorkspaceTypeSchoolDataIdentifier;
import fi.muikku.model.workspace.WorkspaceUserEntity;
import fi.muikku.schooldata.entity.CourseIdentifier;
import fi.muikku.schooldata.entity.User;
import fi.muikku.schooldata.entity.Workspace;
import fi.muikku.schooldata.entity.WorkspaceType;
import fi.muikku.schooldata.entity.WorkspaceUser;

@Dependent
@Stateful
class WorkspaceSchoolDataController { 
	
	// TODO: Caching 
	// TODO: Events
	
	@Inject
	private Logger logger;
	
	@Inject
	@Any
	private Instance<WorkspaceSchoolDataBridge> workspaceBridges;
	
	@Inject
	private SchoolDataSourceDAO schoolDataSourceDAO;

  @Inject
	private WorkspaceEntityDAO workspaceEntityDAO;

  @Inject
	private UserSchoolDataIdentifierDAO userSchoolDataIdentifierDAO;
	
	@Inject
	private WorkspaceTypeSchoolDataIdentifierDAO workspaceTypeSchoolDataIdentifierDAO;

	@Inject
	private WorkspaceUserEntityDAO workspaceUserEntityDAO;
	
	/* Workspaces */

  public Workspace createWorkspace(String schoolDataSourceIdentifier, String name, String description, WorkspaceType type, String courseIdentifierIdentifier) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(schoolDataSourceIdentifier);
    
    WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(schoolDataSource);
    if (workspaceBridge != null) {
      try {
        return workspaceBridge.createWorkspace(name, description, type, courseIdentifierIdentifier);
      } catch (UnexpectedSchoolDataBridgeException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while finding workspace", e);
      } catch (SchoolDataBridgeRequestException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while finding workspace", e);
      }
    } else {
      logger.log(Level.SEVERE, "School Data Bridge not found: " + schoolDataSource);
    }
    
    return null;
  }
	
	public Workspace findWorkspace(WorkspaceEntity workspaceEntity) {
	  return findWorkspace(workspaceEntity.getDataSource(), workspaceEntity.getIdentifier());
	}

  public Workspace findWorkspace(SchoolDataSource schoolDataSource, String identifier) {
    WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(schoolDataSource);
    if (workspaceBridge != null) {
      try {
        return workspaceBridge.findWorkspace(identifier);
      } catch (UnexpectedSchoolDataBridgeException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while finding workspace", e);
      } catch (SchoolDataBridgeRequestException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while finding workspace", e);
      }
    } else {
      logger.log(Level.SEVERE, "School Data Bridge not found: " + schoolDataSource);
    }
    
    return null;
  }

  public List<Workspace> listWorkspaces(String schoolDataSource) {
    WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(schoolDataSource);
    if (workspaceBridge != null) {
      try {
        return workspaceBridge.listWorkspaces();
      } catch (UnexpectedSchoolDataBridgeException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while finding workspace", e);
      }
    } else {
      logger.log(Level.SEVERE, "School Data Bridge not found: " + schoolDataSource);
    }
   
    return null;
  }
  
	public List<Workspace> listWorkspaces() {
		// TODO: This method WILL cause performance problems, replace with something more sensible 
		
		List<Workspace> result = new ArrayList<>();
		
		for (WorkspaceSchoolDataBridge workspaceBridge : getWorkspaceBridges()) {
			try {
				result.addAll(workspaceBridge.listWorkspaces());
			} catch (UnexpectedSchoolDataBridgeException e) {
				logger.log(Level.SEVERE, "School Data Bridge reported a problem while listing workspaces", e);
			}
		}
		
		return result;
	}

  public Workspace updateWorkspace(Workspace workspace) {
    WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(workspace.getSchoolDataSource());
    if (workspaceBridge != null) {
      try {
        return workspaceBridge.updateWorkspace(workspace);
      } catch (UnexpectedSchoolDataBridgeException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while updating workspace", e);
      } catch (SchoolDataBridgeRequestException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while updating workspace", e);
      }
    } else {
      logger.log(Level.SEVERE, "School Data Bridge not found: " + workspace.getSchoolDataSource());
    }
    
    return null;
  }

  public void removeWorkspace(Workspace workspace) {
    WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(workspace.getSchoolDataSource());
    if (workspaceBridge != null) {
      try {
        workspaceBridge.removeWorkspace(workspace.getIdentifier());
      } catch (UnexpectedSchoolDataBridgeException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while updating workspace", e);
      } catch (SchoolDataBridgeRequestException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while updating workspace", e);
      }
    } else {
      logger.log(Level.SEVERE, "School Data Bridge not found: " + workspace.getSchoolDataSource());
    }
  }

	public List<Workspace> listWorkspacesByCourseIdentifier(CourseIdentifier courseIdentifier) {
		SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(courseIdentifier.getSchoolDataSource());
		if (schoolDataSource != null) {
  		WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(schoolDataSource);
  		if (workspaceBridge != null) {
    		try {
  				return workspaceBridge.listWorkspacesByCourseIdentifier(courseIdentifier.getIdentifier());
    		} catch (UnexpectedSchoolDataBridgeException e) {
  				logger.log(Level.SEVERE, "School Data Bridge reported a problem while listing workspaces by course identifier", e);
  			}
  		} else {
  			logger.log(Level.SEVERE, "School Data Bridge not found: " + courseIdentifier.getSchoolDataSource());
  		}
		} else {
			logger.log(Level.SEVERE, "School Data Source not found: " + courseIdentifier.getSchoolDataSource());
		}
		
		return null;
	}
  
	/* Workspace Entities */
	
	public WorkspaceEntity findWorkspaceEntity(Workspace workspace) {
		SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(workspace.getSchoolDataSource());
		WorkspaceEntity workspaceEntity = workspaceEntityDAO.findByDataSourceAndIdentifier(schoolDataSource, workspace.getIdentifier());
		return workspaceEntity;
	}
	
	public WorkspaceTypeEntity findWorkspaceTypeEntity(WorkspaceType workspaceType) {
		// TODO: Proper error handling
		SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(workspaceType.getSchoolDataSource());
		if (schoolDataSource != null) {
	  	WorkspaceTypeSchoolDataIdentifier workspaceTypeSchoolDataIdentifier = workspaceTypeSchoolDataIdentifierDAO.findByDataSourceAndIdentifier(schoolDataSource, workspaceType.getIdentifier());
	  	if (workspaceTypeSchoolDataIdentifier != null) {
	  		return workspaceTypeSchoolDataIdentifier.getWorkspaceTypeEntity();
	  	}
		} 

		return null;
	}
	
	/* Workspace Types */
	
	public WorkspaceType findWorkspaceTypeByDataSourceAndIdentifier(String schoolDataSourceIdentifier, String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
		SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(schoolDataSourceIdentifier);
		if (schoolDataSource != null) {
			return findWorkspaceTypeByDataSourceAndIdentifier(schoolDataSource, identifier);
		} 
		
		return null;
	}
	
	public WorkspaceType findWorkspaceTypeByDataSourceAndIdentifier(SchoolDataSource schoolDataSource, String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
		WorkspaceSchoolDataBridge schoolDataBridge = getWorkspaceBridge(schoolDataSource);
		if (schoolDataBridge != null) {
			return schoolDataBridge.findWorkspaceType(identifier);
		} else {
			logger.log(Level.SEVERE, "School Data Bridge not found: " + schoolDataSource.getIdentifier());
		}
		
		return null;
	}

	public List<WorkspaceType> listWorkspaceTypes() {
		// TODO: This method WILL cause performance problems, replace with something more sensible 
		
		List<WorkspaceType> result = new ArrayList<>();
		
		for (WorkspaceSchoolDataBridge workspaceBridge : getWorkspaceBridges()) {
			try {
				result.addAll(workspaceBridge.listWorkspaceTypes());
			} catch (UnexpectedSchoolDataBridgeException e) {
				logger.log(Level.SEVERE, "School Data Bridge reported a problem while listing workspace types", e);
			} catch (SchoolDataBridgeRequestException e) {
				logger.log(Level.SEVERE, "School Data Bridge reported a problem while listing workspace types", e);
			}
		}
		
		return result;
	}
	
	public List<WorkspaceType> listWorkspaceTypes(WorkspaceTypeEntity workspaceTypeEntity) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
		List<WorkspaceType> workspaceTypes = new ArrayList<>();
		
		List<WorkspaceTypeSchoolDataIdentifier> typeIdentifiers = workspaceTypeSchoolDataIdentifierDAO.listByWorkspaceTypeEntity(workspaceTypeEntity);
		for (WorkspaceTypeSchoolDataIdentifier typeIdentifier : typeIdentifiers) {
			WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(typeIdentifier.getDataSource());
			if (workspaceBridge != null) {
				workspaceTypes.add(workspaceBridge.findWorkspaceType(typeIdentifier.getIdentifier()));
			} else {
				logger.log(Level.SEVERE, "School Data Bridge not found: " + typeIdentifier.getDataSource().getIdentifier());
			}
		}
		
		
		return workspaceTypes;
	}
	
	/* Workspace Users */

  public WorkspaceUser createWorkspaceUser(Workspace workspace, User user, String roleSchoolDataSource, String roleIdentifier) {
    WorkspaceEntity workspaceEntity = findWorkspaceEntity(workspace);

    WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(workspaceEntity.getDataSource());
    if (workspaceBridge != null) {
      try {
        return workspaceBridge.createWorkspaceUser(workspace, user, roleSchoolDataSource, roleIdentifier);
      } catch (UnexpectedSchoolDataBridgeException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while creating workspace user", e);
      } catch (SchoolDataBridgeRequestException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while creating workspace user", e);
      }
    } else {
      logger.log(Level.SEVERE, "School Data Bridge not found: " + workspaceEntity.getDataSource());
    }
    
    return null;
  }
  
  public WorkspaceUser findWorkspaceUser(WorkspaceUserEntity workspaceUserEntity) {
    WorkspaceEntity workspaceEntity = workspaceUserEntity.getWorkspaceEntity();
    
    WorkspaceSchoolDataBridge workspaceBridge = getWorkspaceBridge(workspaceEntity.getDataSource());
    if (workspaceBridge != null) {
      try {
        return workspaceBridge.findWorkspaceUser(workspaceUserEntity.getIdentifier());
      } catch (UnexpectedSchoolDataBridgeException e) {
        logger.log(Level.SEVERE, "School Data Bridge reported a problem while finding workspace", e);
      }
    } else {
      logger.log(Level.SEVERE, "School Data Bridge not found: " + workspaceEntity.getDataSource());
    }
    
    return null;
  }
	
	public List<WorkspaceUser> listWorkspaceUsers(Workspace workspace) {
		SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(workspace.getSchoolDataSource());
		if (schoolDataSource != null) {
			WorkspaceSchoolDataBridge schoolDataBridge = getWorkspaceBridge(schoolDataSource);
			if (schoolDataBridge != null) {
				try {
					return schoolDataBridge.listWorkspaceUsers(workspace.getIdentifier());
				} catch (UnexpectedSchoolDataBridgeException e) {
					logger.log(Level.SEVERE, "School Data Bridge reported a problem while listing workspace users", e);
				} catch (SchoolDataBridgeRequestException e) {
					logger.log(Level.SEVERE, "School Data Bridge reported a problem while listing workspace users", e);
				}
			} else {
				logger.log(Level.SEVERE, "School Data Bridge not found: " + schoolDataSource.getIdentifier());
			}
		}

		return null;
	}
	
	/* Workspace User Entities */
	  
  public WorkspaceUserEntity findWorkspaceUserEntity(WorkspaceUser workspaceUser) {
    SchoolDataSource workspaceSchoolDataSource = schoolDataSourceDAO.findByIdentifier(workspaceUser.getWorkspaceSchoolDataSource());
    SchoolDataSource userSchoolDataSource = schoolDataSourceDAO.findByIdentifier(workspaceUser.getUserSchoolDataSource());

    WorkspaceEntity workspaceEntity = workspaceEntityDAO.findByDataSourceAndIdentifier(workspaceSchoolDataSource, workspaceUser.getWorkspaceIdentifier());
    UserSchoolDataIdentifier userSchoolDataIdentifier = userSchoolDataIdentifierDAO.findByDataSourceAndIdentifier(userSchoolDataSource, workspaceUser.getUserIdentifier());
    UserEntity userEntity = userSchoolDataIdentifier.getUserEntity();
    
    return workspaceUserEntityDAO.findByWorkspaceAndUser(workspaceEntity, userEntity);
  }
  
	private WorkspaceSchoolDataBridge getWorkspaceBridge(SchoolDataSource schoolDataSource) {
		Iterator<WorkspaceSchoolDataBridge> iterator = workspaceBridges.iterator();
		while (iterator.hasNext()) {
			WorkspaceSchoolDataBridge workspaceSchoolDataBridge = iterator.next();
			if (workspaceSchoolDataBridge.getSchoolDataSource().equals(schoolDataSource.getIdentifier())) {
				return workspaceSchoolDataBridge;
			}
		}
		
		return null;
	}
  
  private WorkspaceSchoolDataBridge getWorkspaceBridge(String schoolDataSourceIdentifier) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(schoolDataSourceIdentifier);
    if (schoolDataSource != null) {
      return getWorkspaceBridge(schoolDataSource);
    }
    
    return null;
  }
	
	private List<WorkspaceSchoolDataBridge> getWorkspaceBridges() {
		List<WorkspaceSchoolDataBridge> result = new ArrayList<>();
		
		Iterator<WorkspaceSchoolDataBridge> iterator = workspaceBridges.iterator();
		while (iterator.hasNext()) {
			result.add(iterator.next());
		}
		
		return Collections.unmodifiableList(result);
	}
	
}
