package fi.muikku.plugins.schooldatapyramus;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.enterprise.event.Event;
import javax.inject.Inject;

import fi.muikku.model.users.UserEntity;
import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.model.workspace.WorkspaceRoleEntity;
import fi.muikku.model.workspace.WorkspaceUserEntity;
import fi.muikku.plugins.schooldatapyramus.entities.PyramusSchoolDataEntityFactory;
import fi.muikku.plugins.schooldatapyramus.entities.PyramusUserEmail;
import fi.muikku.plugins.schooldatapyramus.entities.PyramusUserRole;
import fi.muikku.plugins.schooldatapyramus.rest.SystemPyramusClient;
import fi.muikku.users.UserController;
import fi.muikku.users.UserEmailEntityController;
import fi.muikku.users.UserEntityController;
import fi.muikku.users.UserSchoolDataIdentifierController;
import fi.muikku.schooldata.WorkspaceController;
import fi.muikku.schooldata.WorkspaceEntityController;
import fi.muikku.schooldata.entity.Role;
import fi.muikku.schooldata.entity.User;
import fi.muikku.schooldata.entity.UserEmail;
import fi.muikku.schooldata.entity.UserRole;
import fi.muikku.schooldata.entity.Workspace;
import fi.muikku.schooldata.entity.WorkspaceUser;
import fi.muikku.schooldata.events.SchoolDataUserDiscoveredEvent;
import fi.muikku.schooldata.events.SchoolDataUserRemovedEvent;
import fi.muikku.schooldata.events.SchoolDataWorkspaceUserDiscoveredEvent;
import fi.muikku.schooldata.events.SchoolDataWorkspaceUserRemovedEvent;
import fi.muikku.schooldata.initializers.SchoolDataEntityInitializerProvider;
import fi.pyramus.rest.model.Course;
import fi.pyramus.rest.model.CourseStaffMember;
import fi.pyramus.rest.model.CourseStaffMemberRole;
import fi.pyramus.rest.model.CourseStudent;
import fi.pyramus.rest.model.Email;
import fi.pyramus.rest.model.Student;

public class PyramusUpdater {

  @Inject
  private Logger logger;
  
  @Inject
  private WorkspaceController workspaceController;
  
  @Inject
  private WorkspaceEntityController workspaceEntityController;

  @Inject
  private UserController userController;
  
  @Inject
  private UserEntityController userEntityController;
  
  @Inject
  private UserEmailEntityController userEmailEntityController;

  @Inject
  private UserSchoolDataIdentifierController userSchoolDataIdentifierController;
  
  @Inject
  private PyramusSchoolDataEntityFactory entityFactory;
  
  @Inject
  private SchoolDataEntityInitializerProvider schoolDataEntityInitializerProvider;
  
  @Inject
  private SystemPyramusClient pyramusClient;

  @Inject
  private PyramusIdentifierMapper identifierMapper;

  @Inject
  private Event<SchoolDataUserDiscoveredEvent> schoolDataUserDiscoveredEvent;

  @Inject
  private Event<SchoolDataUserRemovedEvent> schoolDataUserRemovedEvent;

  @Inject
  private Event<SchoolDataWorkspaceUserDiscoveredEvent> schoolDataWorkspaceUserDiscoveredEvent;

  @Inject
  private Event<SchoolDataWorkspaceUserRemovedEvent> schoolDataWorkspaceUserRemovedEvent;
  
  public void updateStudent(Long pyramusId) {
    
    Student student = pyramusClient.get("/students/students/" + pyramusId, Student.class);
    if (student != null) {
      String studentIdentifier = identifierMapper.getStudentIdentifier(pyramusId);
      List<String> emails = new ArrayList<>();
      
      Email[] studentEmails = pyramusClient.get("/students/students/" + pyramusId + "/emails", Email[].class);
      for (Email studentEmail : studentEmails) {
        emails.add(studentEmail.getAddress());
      }
      
      schoolDataUserDiscoveredEvent.fire(new SchoolDataUserDiscoveredEvent(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, studentIdentifier, emails));
    }
  }

  public void updateStaffMember(Long pyramusId) {
    fi.pyramus.rest.model.User staffMember = pyramusClient.get("/staff/members/" + pyramusId, fi.pyramus.rest.model.User.class);
    if (staffMember != null) {
      String studentIdentifier = identifierMapper.getStaffIdentifier(pyramusId);
      List<String> emails = new ArrayList<>();
      
      Email[] studentEmails = pyramusClient.get("/staff/members/" + pyramusId + "/emails", Email[].class);
      for (Email studentEmail : studentEmails) {
        emails.add(studentEmail.getAddress());
      }
      
      schoolDataUserDiscoveredEvent.fire(new SchoolDataUserDiscoveredEvent(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, studentIdentifier, emails));
    }
  }

  public void updateCourseStaffMember(Long courseStaffMemberId, Long courseId, Long staffMemberId) {
    CourseStaffMember staffMember = pyramusClient.get("/courses/courses/" + courseId + "/staffMembers/" + courseStaffMemberId, CourseStaffMember.class);
    if (staffMember != null) {
      String userIdentifier = identifierMapper.getStaffIdentifier(staffMemberId);
      String workspaceIdentifier = identifierMapper.getWorkspaceIdentifier(courseId);
      String identifier = identifierMapper.getWorkspaceStaffIdentifier(courseStaffMemberId);
      Long pyramusRoleId = staffMember.getRoleId();
      String roleIdentifier = identifierMapper.getWorkspaceStaffRoleIdentifier(pyramusRoleId);

      WorkspaceEntity workspaceEntity = workspaceController.findWorkspaceEntityByDataSourceAndIdentifier(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, workspaceIdentifier);
      if (workspaceEntity != null) {
        WorkspaceUserEntity workspaceUserEntity = workspaceController.findWorkspaceUserEntityByWorkspaceAndIdentifier(workspaceEntity, identifier);
        if (workspaceUserEntity == null) {
          schoolDataWorkspaceUserDiscoveredEvent.fire(new SchoolDataWorkspaceUserDiscoveredEvent(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE,
            identifier, SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, workspaceIdentifier, SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE,
            userIdentifier, SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, roleIdentifier));
        }
      }
    }
  }
  
  public void updateCourse(Long courseId) {
    String workspaceIdentifier = identifierMapper.getWorkspaceIdentifier(courseId);
    Course course = pyramusClient.get("/courses/courses/" + courseId, Course.class);
    
    if (course != null) {
      WorkspaceEntity workspaceEntity = workspaceEntityController.findWorkspaceByDataSourceAndIdentifier(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE, workspaceIdentifier);
      if (workspaceEntity == null) {
        synchronizeWorkspaces(Arrays.asList(entityFactory.createEntity(course)), null);
      } else {
        synchronizeWorkspaces(null, Arrays.asList(entityFactory.createEntity(course)));
      }
    } else {
      logger.log(Level.WARNING, "Could not find course #" + courseId + " from Pyramus");
    }
  } 

  public int updateStudents(int offset, int maxStudents) {
//    List<fi.muikku.schooldata.entity.User> newUsers = new ArrayList<>();
//    List<fi.muikku.schooldata.entity.User> updateUsers = new ArrayList<>();
//    List<String> existingIdentifiers = userEntityController.listUserEntityIdentifiersByDataSource(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE);
//    Student[] students = pyramusClient.get("/students/students?firstResult=" + offset + "&maxResults=" + maxStudents, Student[].class);
//    
//    if (students.length == 0) {
//      return -1;
//    } else {
//      for (Student student : students) {
//        fi.muikku.schooldata.entity.User user = entityFactory.createEntity(student);
//        if (!existingIdentifiers.contains(user.getIdentifier())) {
//          newUsers.add(user);
//        } else
//          updateUsers.add(user);
//      }
//    }
//    
//    synchronizeStudents(newUsers, updateUsers);
//    
//    return newUsers.size();
    return 0;
  }
  
  public int updateUserRoles() {
    int count = 0;
    
    count += schoolDataEntityInitializerProvider.initEnvironmentRoles(entityFactory.createEntity(fi.pyramus.rest.model.UserRole.values())).size();
    count += schoolDataEntityInitializerProvider.initWorkspaceRoles(entityFactory.createEntity(pyramusClient.get("/courses/staffMemberRoles", CourseStaffMemberRole[].class))).size();
    count += schoolDataEntityInitializerProvider.initWorkspaceRoles(Arrays.asList(entityFactory.createCourseStudentRoleEntity())).size();
    
    return count;
  }
  
  public int updateUsers(int offset, int maxStudents) {
//    List<fi.muikku.schooldata.entity.User> newUsers = new ArrayList<>();
//    List<fi.muikku.schooldata.entity.User> updateUsers = new ArrayList<>();
//    Map<String, fi.pyramus.rest.model.User> userMap = new HashMap<>();
//
//    List<String> existingIdentifiers = userEntityController.listUserEntityIdentifiersByDataSource(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE);
//    fi.pyramus.rest.model.User[] pyramusUsers = pyramusClient.get("/staff/members?firstResult=" + offset + "&maxResults=" + maxStudents, fi.pyramus.rest.model.User[].class);
//    if (pyramusUsers.length == 0) {
//      return -1;
//    } else {
//      for (fi.pyramus.rest.model.User pyramusUser : pyramusUsers) {
//        fi.muikku.schooldata.entity.User user = entityFactory.createEntity(pyramusUser);
//        if (!existingIdentifiers.contains(user.getIdentifier())) {
//          newUsers.add(user);
//        } else {
//          updateUsers.add(user);
//        }
//        
//        userMap.put(user.getIdentifier(), pyramusUser);
//      }
//    }
//    
//    schoolDataEntityInitializerProvider.initUsers(newUsers);
//
//    List<fi.muikku.schooldata.entity.UserRole> userRoles = new ArrayList<>(); 
//
//    for (fi.muikku.schooldata.entity.User user : newUsers) {
//      fi.pyramus.rest.model.User pyramusUser = userMap.get(user.getIdentifier());
//      String roleIdentifier = entityFactory.createEntity(pyramusUser.getRole()).getIdentifier();
//      userRoles.add(new PyramusUserRole("PYRAMUS-" + user.getIdentifier(), user.getIdentifier(), roleIdentifier));
//    }
//
//    for (fi.muikku.schooldata.entity.User user : updateUsers) {
//      fi.pyramus.rest.model.User pyramusUser = userMap.get(user.getIdentifier());
//      String roleIdentifier = entityFactory.createEntity(pyramusUser.getRole()).getIdentifier();
//      userRoles.add(new PyramusUserRole("PYRAMUS-" + user.getIdentifier(), user.getIdentifier(), roleIdentifier));
//    }
//    
//    schoolDataEntityInitializerProvider.initUserRoles(userRoles);
//    
//    List<UserEmail> userEmails = new ArrayList<>();
//    
//    for (fi.muikku.schooldata.entity.User user : newUsers) {
//      Long pyramusStaffId = identifierMapper.getPyramusStaffId(user.getIdentifier());
//      Email[] emails = pyramusClient.get("/staff/members/" + pyramusStaffId.toString() + "/emails", Email[].class);
//      
//      if (emails != null) {
//        for (Email email : emails) {
//          userEmails.add(new PyramusUserEmail("PYRAMUS-" + email.getId().toString(), user.getIdentifier(), email.getAddress()));
//        }
//      }
//    }
//
//    for (fi.muikku.schooldata.entity.User user : updateUsers) {
//      Long pyramusStaffId = identifierMapper.getPyramusStaffId(user.getIdentifier());
//      Email[] emails = pyramusClient.get("/staff/members/" + pyramusStaffId.toString() + "/emails", Email[].class);
//      
//      if (emails != null) {
//        for (Email email : emails) {
//          userEmails.add(new PyramusUserEmail("PYRAMUS-" + email.getId().toString(), user.getIdentifier(), email.getAddress()));
//        }
//      }
//    }
//    
//    schoolDataEntityInitializerProvider.initUserEmails(userEmails);
//    
//    return userRoles.size();
    
    return 0;
  }
  
  public int updateWorkspaces(int offset, int maxStudents) {
    List<String> existingIds = workspaceEntityController.listWorkspaceEntityIdentifiersByDataSource(SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE);
    Course[] courses = pyramusClient.get("/courses/courses?firstResult=" + offset + "&maxResults=" + maxStudents, Course[].class);
    if ((courses == null) || (courses.length == 0)) {
      return -1;
    } else {
      List<Workspace> newWorkspaces = new ArrayList<>();
      
      for (Course course : courses) {
        Workspace workspace = entityFactory.createEntity(course);
        
        if (!existingIds.contains(workspace.getIdentifier())) {
          newWorkspaces.add(workspace);
        } 
      }
      
      synchronizeWorkspaces(newWorkspaces, null);
      
      return newWorkspaces.size();
    }
  }
  
  public int updateWorkspaceStaffMembers(WorkspaceEntity workspaceEntity) {
//    Long courseId = identifierMapper.getPyramusCourseId(workspaceEntity.getIdentifier());
//    
//    CourseStaffMember[] staffMembers = pyramusClient.get("/courses/courses/" + courseId + "/staffMembers", CourseStaffMember[].class);
//    if (staffMembers != null) {
//      List<WorkspaceUser> workspaceUsers = schoolDataEntityInitializerProvider.initWorkspaceUsers(entityFactory.createEntity(staffMembers));
//      return workspaceUsers.size();
//    }
//    
//    return 0;
    return 0;
  }

  public int updateWorkspaceStudents(WorkspaceEntity workspaceEntity) {
//    Long courseId = identifierMapper.getPyramusCourseId(workspaceEntity.getIdentifier());
//    
//    CourseStudent[] courseStudents = pyramusClient.get("/courses/courses/" + courseId + "/students", CourseStudent[].class);
//    if (courseStudents != null) {
//      schoolDataEntityInitializerProvider.initWorkspaceUsers(entityFactory.createEntity(courseStudents));
//    }
//    
//    return 0;
    return 0;
  }

  private void synchronizeStudents(List<fi.muikku.schooldata.entity.User> newUsers, List<fi.muikku.schooldata.entity.User> updateUsers) {
//    List<UserEmail> userEmails = new ArrayList<>();
//    
//    if (newUsers != null) {
//      schoolDataEntityInitializerProvider.initUsers(newUsers);
//      
//      List<UserRole> userRoles = new ArrayList<>(); 
//      Role studentRole = entityFactory.createEntity(fi.pyramus.rest.model.UserRole.STUDENT);
//      
//      for (User newUser : newUsers) {
//        userRoles.add(new PyramusUserRole("PYRAMUS-" + newUser.getIdentifier(), newUser.getIdentifier(), studentRole.getIdentifier()));
//      }
//      
//      schoolDataEntityInitializerProvider.initUserRoles(userRoles);
//      
//      for (fi.muikku.schooldata.entity.User user : newUsers) {
//        Long pyramusStudentId = identifierMapper.getPyramusStudentId(user.getIdentifier());
//        Email[] studentEmails = pyramusClient.get("/students/students/" + pyramusStudentId.toString() + "/emails", Email[].class);
//        
//        for (Email studentEmail : studentEmails) {
//          userEmails.add(new PyramusUserEmail("PYRAMUS-" + studentEmail.getId().toString(), user.getIdentifier(), studentEmail.getAddress()));
//        }
//      }
//    }
//
//    if (updateUsers != null) {
//      for (fi.muikku.schooldata.entity.User user : updateUsers) {
//        Long pyramusStudentId = identifierMapper.getPyramusStudentId(user.getIdentifier());
//        Email[] studentEmails = pyramusClient.get("/students/students/" + pyramusStudentId.toString() + "/emails", Email[].class);
//  
//        if (studentEmails != null) {
//          for (Email studentEmail : studentEmails) {
//            userEmails.add(new PyramusUserEmail("PYRAMUS-" + studentEmail.getId().toString(), user.getIdentifier(), studentEmail.getAddress()));
//          }
//        }
//      }
//    }
//    
//    schoolDataEntityInitializerProvider.initUserEmails(userEmails);
  }
  
  private void synchronizeWorkspaces(List<Workspace> newWorkspaces, List<Workspace> updateWorkspaces) {
    if (newWorkspaces != null) {
      schoolDataEntityInitializerProvider.initWorkspaces(newWorkspaces);
    }
  }

}
