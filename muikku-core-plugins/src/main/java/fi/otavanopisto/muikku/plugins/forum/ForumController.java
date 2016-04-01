package fi.otavanopisto.muikku.plugins.forum;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.logging.Logger;

import javax.enterprise.event.Observes;
import javax.inject.Inject;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Entities.EscapeMode;
import org.jsoup.safety.Cleaner;
import org.jsoup.safety.Whitelist;

import fi.otavanopisto.muikku.controller.PermissionController;
import fi.otavanopisto.muikku.controller.ResourceRightsController;
import fi.otavanopisto.muikku.dao.users.EnvironmentRoleEntityDAO;
import fi.otavanopisto.muikku.dao.users.RoleEntityDAO;
import fi.otavanopisto.muikku.dao.workspace.WorkspaceRoleEntityDAO;
import fi.otavanopisto.muikku.model.security.Permission;
import fi.otavanopisto.muikku.model.security.ResourceRights;
import fi.otavanopisto.muikku.model.users.EnvironmentRoleArchetype;
import fi.otavanopisto.muikku.model.users.EnvironmentRoleEntity;
import fi.otavanopisto.muikku.model.users.RoleEntity;
import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.model.workspace.WorkspaceRoleArchetype;
import fi.otavanopisto.muikku.model.workspace.WorkspaceRoleEntity;
import fi.otavanopisto.muikku.plugins.data.DiscoveredPermissionScope;
import fi.otavanopisto.muikku.plugins.data.PermissionDiscoveredEvent;
import fi.otavanopisto.muikku.plugins.forum.dao.EnvironmentForumAreaDAO;
import fi.otavanopisto.muikku.plugins.forum.dao.ForumAreaDAO;
import fi.otavanopisto.muikku.plugins.forum.dao.ForumAreaGroupDAO;
import fi.otavanopisto.muikku.plugins.forum.dao.ForumMessageDAO;
import fi.otavanopisto.muikku.plugins.forum.dao.ForumThreadDAO;
import fi.otavanopisto.muikku.plugins.forum.dao.ForumThreadReplyDAO;
import fi.otavanopisto.muikku.plugins.forum.dao.WorkspaceForumAreaDAO;
import fi.otavanopisto.muikku.plugins.forum.model.EnvironmentForumArea;
import fi.otavanopisto.muikku.plugins.forum.model.ForumArea;
import fi.otavanopisto.muikku.plugins.forum.model.ForumAreaGroup;
import fi.otavanopisto.muikku.plugins.forum.model.ForumMessage;
import fi.otavanopisto.muikku.plugins.forum.model.ForumThread;
import fi.otavanopisto.muikku.plugins.forum.model.ForumThreadReply;
import fi.otavanopisto.muikku.plugins.forum.model.WorkspaceForumArea;
import fi.otavanopisto.muikku.schooldata.entity.User;
import fi.otavanopisto.muikku.session.SessionController;
import fi.otavanopisto.muikku.users.UserController;
import fi.otavanopisto.muikku.users.UserEntityController;
import fi.otavanopisto.security.Permit;
import fi.otavanopisto.security.PermitContext;

public class ForumController {
  
  @Inject
  private Logger logger;
  
  @Inject
  private SessionController sessionController;

  @Inject
  private EnvironmentForumAreaDAO environmentForumAreaDAO;

  @Inject
  private WorkspaceForumAreaDAO workspaceForumAreaDAO;

  @Inject
  private ForumAreaDAO forumAreaDAO;

  @Inject
  private ForumThreadDAO forumThreadDAO;
  
  @Inject
  private ForumMessageDAO forumMessageDAO;
  
  @Inject
  private ForumAreaGroupDAO forumAreaGroupDAO;
  
  @Inject
  private ForumThreadReplyDAO forumThreadReplyDAO;
  
  @Inject
  private ResourceRightsController resourceRightsController;

  @Inject
  private UserEntityController userEntityController;
  
  @Inject
  private UserController userController;
  
  @Inject
  private ForumResourcePermissionCollection forumResourcePermissionCollection;

  @Inject
  private PermissionController permissionController;
  
  @Inject
  private EnvironmentRoleEntityDAO environmentRoleEntityDAO; 

  @Inject
  private WorkspaceRoleEntityDAO workspaceRoleEntityDAO; 
  
  @Inject
  private RoleEntityDAO roleEntityDAO; 
  
  private String clean(String html) {
    Document doc = Jsoup.parse(html);
    doc = new Cleaner(Whitelist.relaxed()).clean(doc);
    doc.outputSettings().escapeMode(EscapeMode.xhtml);
    return doc.body().html();
  }

  public ForumArea getForumArea(Long forumAreaId) {
    return forumAreaDAO.findById(forumAreaId);
  }
  
  public ForumThread getForumThread(Long threadId) {
    return forumThreadDAO.findById(threadId);
  }
  
  public ForumThreadReply getForumThreadReply(Long threadReplyId) {
    return forumThreadReplyDAO.findById(threadReplyId);
  }
  
  public void createDefaultForumPermissions(ForumArea area, ResourceRights rights) {
    List<String> permissions = forumResourcePermissionCollection.listPermissions();
    
    for (String permission : permissions) {
      try {
        String permissionScope = forumResourcePermissionCollection.getPermissionScope(permission);
      
        if (ForumResourcePermissionCollection.PERMISSIONSCOPE_FORUM.equals(permissionScope)) {
          EnvironmentRoleArchetype[] environmentRoles = forumResourcePermissionCollection.getDefaultEnvironmentRoles(permission);
          WorkspaceRoleArchetype[] workspaceRoles = area instanceof WorkspaceForumArea ? forumResourcePermissionCollection.getDefaultWorkspaceRoles(permission) : null;
          String[] pseudoRoles = forumResourcePermissionCollection.getDefaultPseudoRoles(permission);
  
          Permission perm = permissionController.findByName(permission);
          List<RoleEntity> roles = new ArrayList<RoleEntity>();
          
          if (pseudoRoles != null) {
            for (String pseudoRole : pseudoRoles) {
              RoleEntity roleEntity = roleEntityDAO.findByName(pseudoRole);
              
              if (roleEntity != null)
                roles.add(roleEntity);
            }
          }
  
          if (environmentRoles != null) {
            for (EnvironmentRoleArchetype envRole : environmentRoles) {
              List<EnvironmentRoleEntity> envRoles = environmentRoleEntityDAO.listByArchetype(envRole);
              roles.addAll(envRoles);
            }
          }
  
          if (workspaceRoles != null) {
            for (WorkspaceRoleArchetype arc : workspaceRoles) {
              List<WorkspaceRoleEntity> wsRoles = workspaceRoleEntityDAO.listByArchetype(arc);
              roles.addAll(wsRoles);
            }
          }
          
          for (RoleEntity role : roles)
            resourceRightsController.addResourceUserRolePermission(rights, role, perm);
        }
      } catch (NoSuchFieldException e) {
        e.printStackTrace();
      }
    }
  }
  
//  @Permit (ForumResourcePermissionCollection.FORUM_CREATEENVIRONMENTFORUM)
  public EnvironmentForumArea createEnvironmentForumArea(String name, Long groupId) {
    UserEntity owner = sessionController.getLoggedUserEntity();
    ResourceRights rights = resourceRightsController.create();
    ForumAreaGroup group = groupId != null ? findForumAreaGroup(groupId) : null;
    EnvironmentForumArea forumArea = environmentForumAreaDAO.create(name, group, false, owner, rights);
    createDefaultForumPermissions(forumArea, rights);
    return forumArea;
  }
  
  public WorkspaceForumArea createWorkspaceForumArea(WorkspaceEntity workspace, String name, Long groupId) {
    UserEntity owner = sessionController.getLoggedUserEntity();
    ResourceRights rights = resourceRightsController.create();
    ForumAreaGroup group = groupId != null ? findForumAreaGroup(groupId) : null;
    WorkspaceForumArea forumArea = workspaceForumAreaDAO.create(workspace, name, group, false, owner, rights);
    createDefaultForumPermissions(forumArea, rights);
    return forumArea;
  }
  
  public void copyWorkspaceForumAreas(WorkspaceEntity sourceWorkspace, WorkspaceEntity targetWorkspace) {
    List<WorkspaceForumArea> forumAreas = listCourseForums(sourceWorkspace);
    for (WorkspaceForumArea forumArea : forumAreas) {
      createWorkspaceForumArea(targetWorkspace, forumArea.getName(), forumArea.getGroup() == null ? null : forumArea.getGroup().getId());
    }
  }

  public ForumArea updateForumAreaName(ForumArea forumArea, String name) {
    return forumAreaDAO.updateForumArea(forumArea, name);
  }

  public void deleteArea(ForumArea forumArea) {
    forumAreaDAO.delete(forumArea);
  }
  
  public ForumArea findForumAreaById(Long forumAreaId) {
    return forumAreaDAO.findById(forumAreaId);
  }

  public ForumAreaGroup findForumAreaGroup(Long groupId) {
    return forumAreaGroupDAO.findById(groupId);
  }

//  @Permit (ForumResourcePermissionCollection.FORUM_WRITEMESSAGES)
  public ForumThread createForumThread(/** @PermitContext **/ ForumArea forumArea, String title, String message, Boolean sticky, Boolean locked) {
    return forumThreadDAO.create(forumArea, title, clean(message), sessionController.getLoggedUserEntity(), sticky, locked);
  }

  @Permit (ForumResourcePermissionCollection.FORUM_DELETEMESSAGES)
  public void deleteThread(@PermitContext ForumThread thread) {
    List<ForumThreadReply> replies = forumThreadReplyDAO.listByForumThread(thread);
    for (ForumThreadReply reply : replies) {
      forumThreadReplyDAO.delete(reply);
    }
    
    forumThreadDAO.delete(thread);
  }
  
  @Permit (ForumResourcePermissionCollection.FORUM_WRITEMESSAGES)
  public ForumThreadReply createForumThreadReply(@PermitContext ForumThread thread, String message) {
    if (thread.getLocked()) {
      logger.severe("Tried to create a forum thread reply for locked thread");
      return null;
    } else {
      ForumThreadReply reply = forumThreadReplyDAO.create(thread.getForumArea(), thread, clean(message), sessionController.getLoggedUserEntity());
      forumThreadDAO.updateThreadUpdated(thread, reply.getCreated());
      return reply;
    }
  }

  @Permit (ForumResourcePermissionCollection.FORUM_DELETEMESSAGES)
  public void deleteReply(@PermitContext ForumThreadReply reply) {
    forumThreadReplyDAO.delete(reply);
  }
  
  public List<EnvironmentForumArea> listEnvironmentForums() {
    return sessionController.filterResources(
        environmentForumAreaDAO.listAllNonArchived(), ForumResourcePermissionCollection.FORUM_LISTFORUM);
  }

  public List<WorkspaceForumArea> listCourseForums() {
    return sessionController.filterResources(
        workspaceForumAreaDAO.listAllNonArchived(), ForumResourcePermissionCollection.FORUM_LISTWORKSPACEFORUM);
  }

  public List<WorkspaceForumArea> listCourseForums(WorkspaceEntity workspace) {
    return sessionController.filterResources(
        workspaceForumAreaDAO.listByWorkspace(workspace), ForumResourcePermissionCollection.FORUM_LISTWORKSPACEFORUM);
  }

//  @Permit (ForumResourcePermissionCollection.FORUM_READMESSAGES)
  public List<ForumThread> listForumThreads(/**@PermitContext **/ForumArea forumArea, int firstResult, int maxResults) {
    List<ForumThread> threads = forumThreadDAO.listByForumAreaOrdered(forumArea, firstResult, maxResults);
    
    return threads;
  }
  
  public List<ForumThreadReply> listForumThreadReplies(ForumThread forumThread, Integer firstResult, Integer maxResults) {
    return forumThreadReplyDAO.listByForumThread(forumThread, firstResult, maxResults);
  }
  
  public List<ForumThread> listLatestForumThreads(int firstResult, int maxResults) {
    List<EnvironmentForumArea> environmentForums = listEnvironmentForums();
//    List<WorkspaceForumArea> workspaceForums = listCourseForums();
    List<ForumArea> forumAreas = new ArrayList<ForumArea>();

    // TODO: This could use some optimization
    
    for (EnvironmentForumArea ef : environmentForums) {
      forumAreas.add(ef);
    }
    
//    for (WorkspaceForumArea wf : workspaceForums) {
//      forumAreas.add(wf);
//    }
    
    List<ForumThread> threads;
    
    if (!forumAreas.isEmpty())
      threads = forumThreadDAO.listLatestOrdered(forumAreas, firstResult, maxResults);
    else
      threads = new ArrayList<ForumThread>();
    
    return threads;
  }
  
  public List<ForumThread> listLatestForumThreadsFromWorkspace(WorkspaceEntity workspaceEntity, Integer firstResult,
      Integer maxResults) {
    List<WorkspaceForumArea> workspaceForums = listCourseForums(workspaceEntity);
    List<ForumArea> forumAreas = new ArrayList<ForumArea>();

    // TODO: This could use some optimization
    for (WorkspaceForumArea wf : workspaceForums) {
      forumAreas.add(wf);
    }
    
    List<ForumThread> threads;

    if (!forumAreas.isEmpty())
      threads = forumThreadDAO.listLatestOrdered(forumAreas, firstResult, maxResults);
    else
      threads = new ArrayList<ForumThread>();

    return threads;
  }

  public UserEntity findUserEntity(Long userEntityId) {
    return userEntityController.findUserEntityById(userEntityId);
  }
  
  public User findUser(UserEntity userEntity) {
    return userController.findUserByUserEntityDefaults(userEntity);
  }
  
  public boolean getUserHasPicture(UserEntity userEntity) {
    return false; // TODO
  }
  
  public ForumThreadReply getLatestReply(ForumThread thread) {
    return forumThreadReplyDAO.findLatestReplyByThread(thread);
  }
  
  public ForumMessage getLatestMessage(ForumArea area) {
    return forumMessageDAO.findLatestMessageByArea(area);
  }
  
  public Long getThreadReplyCount(ForumThread thread) {
    return forumThreadReplyDAO.countByThread(thread);
  }

  public Long getThreadCount(ForumArea area) {
    return forumThreadDAO.countByArea(area);
  }

  public Long getMessageCount(ForumArea area) {
    return forumMessageDAO.countByArea(area);
  }
  
  public void archiveMessage(ForumMessage message) {
    forumMessageDAO.archive(message);
    
    if (message instanceof ForumThreadReply) {
      ForumThreadReply reply = (ForumThreadReply) message;
      
      ForumThreadReply latestReply = getLatestReply(reply.getThread());
      
      if (latestReply != null)
        forumThreadDAO.updateThreadUpdated(reply.getThread(), latestReply.getCreated());
      else
        forumThreadDAO.updateThreadUpdated(reply.getThread(), reply.getThread().getCreated());
    }
  }
  
  public void updateForumThread(ForumThread thread, String title, String message, Boolean sticky, Boolean locked) {
    UserEntity user = sessionController.getLoggedUserEntity();
    forumThreadDAO.update(thread, title, clean(message), sticky, locked, new Date(), user);
  }

  public void updateForumThreadReply(ForumThreadReply reply, String message) {
    UserEntity user = sessionController.getLoggedUserEntity();
    forumThreadReplyDAO.update(reply, clean(message), new Date(), user);
  }

  public List<ForumAreaGroup> listForumAreaGroups() {
    return forumAreaGroupDAO.listAll();
  }

  public ForumAreaGroup createForumAreaGroup(String name) {
    return forumAreaGroupDAO.create(name, Boolean.FALSE);
  }

  public void deleteAreaGroup(ForumAreaGroup forumAreaGroup) {
    forumAreaGroupDAO.delete(forumAreaGroup);
  }
  
  public List<ForumMessage> listMessagesByWorkspace(WorkspaceEntity workspace) {
    return forumMessageDAO.listByWorkspace(workspace);
  }

  public List<ForumMessage> listByContributingUser(UserEntity userEntity) {
    return forumMessageDAO.listByContributingUser(userEntity);
  }
  
  public Long countUserEntityWorkspaceMessages(WorkspaceEntity workspaceEntity, UserEntity creator) {
    if (workspaceEntity == null) {
      logger.severe("Attempt to call countUserEntityWorkspaceMessages with null workspaceEntity");
      return 0l;
    }
    
    if (creator == null) {
      logger.severe("Attempt to call countUserEntityWorkspaceMessages with null creator");
      return 0l;
    }
    
    return forumMessageDAO.countByWorkspaceEntityAndCreator(workspaceEntity.getId(), creator.getId());
  }
  
  public ForumMessage findUserEntitysLatestWorkspaceMessage(WorkspaceEntity workspaceEntity, UserEntity creator) {
    if (workspaceEntity == null) {
      logger.severe("Attempt to call countUserEntityWorkspaceMessages with null workspaceEntity");
      return null;
    }
    
    if (creator == null) {
      logger.severe("Attempt to call countUserEntityWorkspaceMessages with null creator");
      return null;
    }
    
    List<ForumMessage> messages = forumMessageDAO.listByWorkspaceEntityAndCreatorOrderByCreated(workspaceEntity.getId(), creator.getId(), 0, 1);
    if (messages.size() == 1) {
      return messages.get(0);
    }
    
    return null;
  }
  
  public void permissionDiscoveredListener(@Observes @DiscoveredPermissionScope("FORUM") PermissionDiscoveredEvent event) {
    Permission permission = event.getPermission();
    String permissionName = permission.getName();

    List<ForumArea> forumAreas = forumAreaDAO.listAll();
    
    for (ForumArea area : forumAreas) {
      try {
        String permissionScope = permission.getScope();
      
        if (ForumResourcePermissionCollection.PERMISSIONSCOPE_FORUM.equals(permissionScope)) {
          ResourceRights rights = resourceRightsController.findResourceRightsById(area.getRights());
          EnvironmentRoleArchetype[] environmentRoles = forumResourcePermissionCollection.getDefaultEnvironmentRoles(permissionName);
          WorkspaceRoleArchetype[] workspaceRoles = area instanceof WorkspaceForumArea ? forumResourcePermissionCollection.getDefaultWorkspaceRoles(permissionName) : null;
          String[] pseudoRoles = forumResourcePermissionCollection.getDefaultPseudoRoles(permissionName);
  
          List<RoleEntity> roles = new ArrayList<RoleEntity>();
          
          if (pseudoRoles != null) {
            for (String pseudoRole : pseudoRoles) {
              RoleEntity roleEntity = roleEntityDAO.findByName(pseudoRole);
              
              if (roleEntity != null)
                roles.add(roleEntity);
            }
          }
  
          if (environmentRoles != null) {
            for (EnvironmentRoleArchetype envRole : environmentRoles) {
              List<EnvironmentRoleEntity> envRoles = environmentRoleEntityDAO.listByArchetype(envRole);
              roles.addAll(envRoles);
            }
          }
  
          if (workspaceRoles != null) {
            for (WorkspaceRoleArchetype arc : workspaceRoles) {
              List<WorkspaceRoleEntity> wsRoles = workspaceRoleEntityDAO.listByArchetype(arc);
              roles.addAll(wsRoles);
            }
          }
          
          for (RoleEntity role : roles)
            resourceRightsController.addResourceUserRolePermission(rights, role, permission);
        }
      } catch (NoSuchFieldException e) {
        e.printStackTrace();
      }
    }
  }

}