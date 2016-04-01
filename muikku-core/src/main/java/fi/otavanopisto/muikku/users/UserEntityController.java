package fi.otavanopisto.muikku.users;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.logging.Logger;

import javax.inject.Inject;

import fi.otavanopisto.muikku.dao.base.SchoolDataSourceDAO;
import fi.otavanopisto.muikku.dao.users.UserEmailEntityDAO;
import fi.otavanopisto.muikku.dao.users.UserEntityDAO;
import fi.otavanopisto.muikku.dao.users.UserSchoolDataIdentifierDAO;
import fi.otavanopisto.muikku.model.base.SchoolDataSource;
import fi.otavanopisto.muikku.model.users.UserEmailEntity;
import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.model.users.UserSchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.entity.User;

public class UserEntityController implements Serializable {
  
  private static final long serialVersionUID = 4092377410747350817L;

  @Inject
  private Logger logger;

  @Inject
  private UserEntityDAO userEntityDAO;
  
  @Inject
  private SchoolDataSourceDAO schoolDataSourceDAO;

  @Inject
  private UserSchoolDataIdentifierDAO userSchoolDataIdentifierDAO;
  
  @Inject
  private UserEmailEntityDAO userEmailEntityDAO;
  
  public UserEntity createUserEntity(SchoolDataSource defaultSchoolDataSource, String defaultIdentifier, Locale locale) {
    return userEntityDAO.create(Boolean.FALSE, defaultSchoolDataSource, defaultIdentifier, locale != null ? locale.toString() : null);
  }
  
  public UserEntity createUserEntity(String dataSource, String identifier) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(dataSource);
    if (dataSource == null) {
      logger.severe("Could not find datasource " + dataSource);
      return null;
    }
    
    return createUserEntity(schoolDataSource, identifier, null);
  }
  
  public UserEntity findUserEntityById(Long id) {
    return userEntityDAO.findById(id);
  }

  public UserEntity findUserEntityByUser(User user) {
    return findUserEntityByDataSourceAndIdentifier(user.getSchoolDataSource(), user.getIdentifier());
  }
  
  public UserEntity findUserEntityByDataSourceAndIdentifier(SchoolDataSource dataSource, String identifier) {
    UserSchoolDataIdentifier userSchoolDataIdentifier = userSchoolDataIdentifierDAO.findByDataSourceAndIdentifierAndArchived(dataSource, identifier, Boolean.FALSE);
    if (userSchoolDataIdentifier != null) {
      return userSchoolDataIdentifier.getUserEntity();
    }
    
    return null;
  }

  public UserEntity findUserEntityByDataSourceAndIdentifier(String dataSource, String identifier) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(dataSource);
    if (dataSource == null) {
      logger.severe("Could not find datasource " + dataSource);
      return null;
    }
    
    return findUserEntityByDataSourceAndIdentifier(schoolDataSource, identifier);
  }

  public UserEntity findUserEntityByUserIdentifier(SchoolDataIdentifier userIdentifier) {
    return findUserEntityByDataSourceAndIdentifier(userIdentifier.getDataSource(), userIdentifier.getIdentifier());
  }

  public List<UserEntity> listUserEntitiesByEmails(List<String> emails) {
    return userEmailEntityDAO.listUsersByAddresses(emails);
  }
      
  /**
  * Returns the user corresponding to the given email address. If the email address does not belong to any user, returns <code>null</code>.
  * 
  * @param address Email address
  * 
  * @return The user corresponding to the given email address, or <code>null</code> if not found 
  */
  public UserEntity findUserEntityByEmailAddress(String address) {
   UserEmailEntity userEmail = userEmailEntityDAO.findByAddress(address);
   return userEmail == null ? null : userEmail.getUser();
  }

  public List<String> listUserEntityIdentifiersByDataSource(SchoolDataSource dataSource) {
    List<String> result = new ArrayList<>();

    List<UserSchoolDataIdentifier> identifiers = listUserSchoolDataIdentifiersByDataSource(dataSource);
    for (UserSchoolDataIdentifier indentifier : identifiers) {
      result.add(indentifier.getIdentifier());
    }

    return result;
  }

  public List<String> listUserEntityIdentifiersByDataSource(String dataSource) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(dataSource);
    if (schoolDataSource == null) {
      logger.severe("Could not find school data source: " + dataSource);
      return null;
    } else {
      return listUserEntityIdentifiersByDataSource(schoolDataSource);
    }
  }
  
  public List<UserSchoolDataIdentifier> listUserSchoolDataIdentifiersByDataSource(SchoolDataSource dataSource) {
    return userSchoolDataIdentifierDAO.listByDataSourceAndArchived(dataSource, Boolean.FALSE);
  }

  public List<UserEntity> listUserEntities() {
    return userEntityDAO.listAll();
  }
  
  /**
   * Updates the last login time of the given user entity to the current time.
   * 
   * @param userEntity The user entity to be updated
   * 
   *  @return The updated user entity
   */
  public UserEntity updateLastLogin(UserEntity userEntity) {
    return userEntityDAO.updateLastLogin(userEntity);
  }

  public UserEntity updateDefaultSchoolDataSource(UserEntity userEntity, SchoolDataSource defaultSchoolDataSource) {
    return userEntityDAO.updateDefaultSchoolDataSource(userEntity, defaultSchoolDataSource);
  }
  
  public UserEntity updateDefaultSchoolDataSource(UserEntity userEntity, String defaultSchoolDataSource) {
    SchoolDataSource schoolDataSource = schoolDataSourceDAO.findByIdentifier(defaultSchoolDataSource);
    if (schoolDataSource != null) {
      return updateDefaultSchoolDataSource(userEntity, schoolDataSource);
    } else {
      logger.severe(String.format("Could not find school data source %s", defaultSchoolDataSource));
      return null;
    }
  }
  
  public UserEntity updateDefaultIdentifier(UserEntity userEntity, String defaultIdentifier) {
    return userEntityDAO.updateDefaultIdentifier(userEntity, defaultIdentifier);
  }

  public UserEntity updateLocale(UserEntity userEntity, Locale locale) {
    return userEntityDAO.updateLocale(userEntity, locale != null ? locale.toString() : null);
  }

  public UserEntity archiveUserEntity(UserEntity userEntity) {
    return userEntityDAO.updateArchived(userEntity, Boolean.TRUE);
  }
}