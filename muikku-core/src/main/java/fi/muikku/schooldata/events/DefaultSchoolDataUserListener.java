package fi.muikku.schooldata.events;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.annotation.PostConstruct;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;

import fi.muikku.model.users.EnvironmentRoleEntity;
import fi.muikku.model.users.EnvironmentUser;
import fi.muikku.model.users.UserEmailEntity;
import fi.muikku.model.users.UserEntity;
import fi.muikku.users.EnvironmentRoleEntityController;
import fi.muikku.users.EnvironmentUserController;
import fi.muikku.users.UserEmailEntityController;
import fi.muikku.users.UserEntityController;
import fi.muikku.users.UserSchoolDataIdentifierController;

@ApplicationScoped
public class DefaultSchoolDataUserListener {
  
  @Inject
  private Logger logger;
  
  @Inject
  private UserEmailEntityController userEmailEntityController;

  @Inject
  private UserEntityController userEntityController;
  
  @Inject
  private UserSchoolDataIdentifierController userSchoolDataIdentifierController;

  @Inject
  private EnvironmentRoleEntityController environmentRoleEntityController;

  @Inject
  private EnvironmentUserController environmentUserController;
  
  @PostConstruct
  public void init() {
    discoveredUsers = new HashMap<>();
    discoveredEnvironmentUserRoles = new HashMap<>();
  }
  
  public synchronized void onSchoolDataUserDiscoveredEvent(@Observes SchoolDataUserDiscoveredEvent event) {
    String discoverId = "U-" + event.getDataSource() + "/" + event.getIdentifier();
    if (discoveredUsers.containsKey(discoverId)) {
      event.setDiscoveredUserEntityId(discoveredUsers.get(discoverId));
      return;
    }
    
    if (userEntityController.findUserEntityByDataSourceAndIdentifier(event.getDataSource(), event.getIdentifier()) == null) {
      // User does not yet exist on the database
      
      List<UserEntity> emailUsers = userEntityController.listUserEntitiesByEmails(event.getEmails());
      if (emailUsers.size() > 1) {
        // TODO: Better exception handling
        throw new RuntimeException("Multiple users found by emails");
      }
      
      UserEntity userEntity = null;
      if (emailUsers.size() == 1) {
        // Matching user found, attach identity
        userEntity = emailUsers.get(0);
        userSchoolDataIdentifierController.createUserSchoolDataIdentifier(event.getDataSource(), event.getIdentifier(), userEntity);
      } else {
        userEntity = userEntityController.createUserEntity(event.getDataSource(), event.getIdentifier());
        userSchoolDataIdentifierController.createUserSchoolDataIdentifier(event.getDataSource(), event.getIdentifier(), userEntity);
      }
      
      List<String> existingAddresses = userEmailEntityController.listAddressesByUserEntity(userEntity);
      for (String email : event.getEmails()) {
        if (!existingAddresses.contains(email)) {
          userEmailEntityController.addUserEmail(userEntity, email);
        }
      }
      
      discoveredUsers.put(discoverId, userEntity.getId());
      event.setDiscoveredUserEntityId(userEntity.getId());
    }
  }
  
  public synchronized void onSchoolDataUserUpdatedEvent(@Observes SchoolDataUserUpdatedEvent event) {
    UserEntity userEntity = userEntityController.findUserEntityByDataSourceAndIdentifier(event.getDataSource(), event.getIdentifier());
    if (userEntity != null) {
      List<UserEntity> emailUsers = userEntityController.listUserEntitiesByEmails(event.getEmails());
      if (emailUsers.size() > 1) {
        // TODO: Better exception handling
        throw new RuntimeException("Multiple users found by emails");
      }
      
      if (emailUsers.size() == 1) {
        if (!emailUsers.get(0).getId().equals(userEntity.getId())) {
          throw new RuntimeException(String.format("Another user found with email (%d, %d)", emailUsers.get(0).getId(), userEntity.getId()));
        }
      }
      
      List<String> existingAddresses = userEmailEntityController.listAddressesByUserEntity(userEntity);
      
      for (String email : event.getEmails()) {
        if (!existingAddresses.contains(email)) {
          userEmailEntityController.addUserEmail(userEntity, email);
        }
        
        existingAddresses.remove(email);
      }
      
      // TODO: We should remove only emails originating from current school data source
      
      for (String removedAddress : existingAddresses) {
        UserEmailEntity emailEntity = userEmailEntityController.findUserEmailEntityByAddress(removedAddress);
        userEmailEntityController.removeUserEmailEntity(emailEntity);
      }
    }
  }
  
  public void onSchoolDataUserRemoved(@Observes SchoolDataUserRemovedEvent event) {
    UserEntity userEntity = userEntityController.findUserEntityByDataSourceAndIdentifier(event.getDataSource(), event.getIdentifier());
    if (userEntity != null) {
      userEntityController.archiveUserEntity(userEntity);
    }    
  }
  
  public synchronized void onSchoolDataUserEnvironmentRoleDiscoveredEvent(@Observes SchoolDataUserEnvironmentRoleDiscoveredEvent event) {
    String discoverId = "UER-" + event.getUserDataSource() + "/" + event.getUserIdentifier() + '-' + event.getRoleDataSource() + "/" + event.getRoleIdentifier();
    if (discoveredEnvironmentUserRoles.containsKey(discoverId)) {
      event.setDiscoveredEnvironmentUserRoleEntityId(discoveredEnvironmentUserRoles.get(discoverId));
      return;
    }
    
    UserEntity userEntity = userEntityController.findUserEntityByDataSourceAndIdentifier(event.getUserDataSource(), event.getUserIdentifier());
    if (userEntity != null) {
      EnvironmentRoleEntity environmentRoleEntity = environmentRoleEntityController.findEnvironmentRoleEntity(event.getRoleDataSource(), event.getRoleIdentifier());
      if (environmentRoleEntity != null) {
        EnvironmentUser environmentUser = environmentUserController.findEnvironmentUserByUserEntity(userEntity);
        if (environmentUser == null) {
          environmentUserController.createEnvironmentUserRole(userEntity, environmentRoleEntity);
        } else {
          environmentUserController.updateEnvironmentUserRole(environmentUser, environmentRoleEntity);
        }
        
        discoveredEnvironmentUserRoles.put(discoverId, environmentRoleEntity.getId());
        event.setDiscoveredEnvironmentUserRoleEntityId(environmentRoleEntity.getId());
      } else {
        logger.warning("Could not add environment role " + event.getRoleIdentifier() + '/' + event.getRoleDataSource() + " to user because it does not exist");
      }
    } else {
      logger.warning("Could not add new role to user " + event.getUserIdentifier() + '/' + event.getUserDataSource() + " because it does not exist");
    }
  }
  
  public synchronized void onSchoolDataUserEnvironmentRoleRemovedEvent(@Observes SchoolDataUserEnvironmentRoleRemovedEvent event) {
    UserEntity userEntity = userEntityController.findUserEntityByDataSourceAndIdentifier(event.getUserDataSource(), event.getUserIdentifier());
    if (userEntity != null) {
      EnvironmentRoleEntity environmentRoleEntity = environmentRoleEntityController.findEnvironmentRoleEntity(event.getRoleDataSource(), event.getRoleIdentifier());
      if (environmentRoleEntity != null) {
        EnvironmentUser environmentUser = environmentUserController.findEnvironmentUserByUserEntity(userEntity);
        if (environmentUser != null) {
          if (environmentRoleEntity.getId().equals(environmentUser.getRole().getId())) {
            environmentUserController.updateEnvironmentUserRole(environmentUser, null);          
          }
        }
      }
    }
  }

  private Map<String, Long> discoveredUsers;
  private Map<String, Long> discoveredEnvironmentUserRoles;
}