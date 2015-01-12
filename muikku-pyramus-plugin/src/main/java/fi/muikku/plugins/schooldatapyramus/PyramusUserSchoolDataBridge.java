package fi.muikku.plugins.schooldatapyramus;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.ejb.Stateful;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import fi.muikku.plugins.schooldatapyramus.entities.PyramusSchoolDataEntityFactory;
import fi.muikku.plugins.schooldatapyramus.rest.UserPyramusClient;
import fi.muikku.schooldata.SchoolDataBridgeRequestException;
import fi.muikku.schooldata.UnexpectedSchoolDataBridgeException;
import fi.muikku.schooldata.UserSchoolDataBridge;
import fi.muikku.schooldata.entity.Role;
import fi.muikku.schooldata.entity.User;
import fi.muikku.schooldata.entity.UserEmail;
import fi.muikku.schooldata.entity.UserImage;
import fi.muikku.schooldata.entity.UserProperty;
import fi.pyramus.rest.model.CourseStaffMemberRole;
import fi.pyramus.rest.model.Person;
import fi.pyramus.rest.model.StaffMember;
import fi.pyramus.rest.model.Student;
import fi.pyramus.rest.model.StudyProgramme;
import fi.pyramus.rest.model.UserRole;

@Dependent
@Stateful
public class PyramusUserSchoolDataBridge implements UserSchoolDataBridge {

  @Inject
  private UserPyramusClient pyramusClient;

  @Inject
  private PyramusIdentifierMapper identifierMapper;
  
  @Inject
  private PyramusSchoolDataEntityFactory entityFactory;
  
  @Override
  public String getSchoolDataSource() {
    return SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE;
  }

	@Override
	public User createUser(String firstName, String lastName) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    return null;
	}
	
	private List<User> createStudentEntities(Student... students) {
	  List<StudyProgramme> studyProgrammes = new ArrayList<>(students.length);
    Map<Long, StudyProgramme> studyProgrammeMap = new HashMap<Long, StudyProgramme>();
	  
	  for (Student student : students) {
	    if (student.getStudyProgrammeId() != null) {
  	    if (!studyProgrammeMap.containsKey(student.getStudyProgrammeId())) {
  	      StudyProgramme studyProgramme = pyramusClient.get("/students/studyProgrammes/" + student.getStudyProgrammeId(), StudyProgramme.class);
  	      studyProgrammeMap.put(student.getStudyProgrammeId(), studyProgramme);
  	    }
  	    
  	    studyProgrammes.add(studyProgrammeMap.get(student.getStudyProgrammeId()));
	    } else {
        studyProgrammes.add(null);
	    }
	  }
	  
	  
	  return entityFactory.createEntity(students, studyProgrammes.toArray(new StudyProgramme[0]));
	}

  private User createStudentEntity(Student student) {
    List<User> users = createStudentEntities(new Student[] { student } );
    if (users.isEmpty()) {
      return null;
    }
    
    return users.get(0);
  }
  
	@Override
	public User findActiveUser(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
	  Long studentId = identifierMapper.getPyramusStudentId(identifier);
	  if (studentId != null) {
	    Student student = findPyramusStudent(studentId);
	    Person person = findPyramusPerson(student.getPersonId());
	    if (!student.getId().equals(person.getDefaultUserId())) {
	      return findUserByPyramusUser(person.getDefaultUserId());
	    }
	    
      return createStudentEntity(student);
	  }
	  
	  Long staffId = identifierMapper.getPyramusStaffId(identifier);
	  if (staffId != null) {
	    StaffMember staffMember = findPyramusStaffMember(staffId);
	    Person person = findPyramusPerson(staffMember.getPersonId());
      if (!staffMember.getId().equals(person.getDefaultUserId())) {
        return findUserByPyramusUser(person.getDefaultUserId());
      }
      
      return entityFactory.createEntity(staffMember);
	  }

	  throw new SchoolDataBridgeRequestException("Malformed user identifier");
	}
	
	@Override
  public User findUser(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    Long studentId = identifierMapper.getPyramusStudentId(identifier);
    if (studentId != null) {
      return createStudentEntity(findPyramusStudent(studentId));
    }
    
    Long staffId = identifierMapper.getPyramusStaffId(identifier);
    if (staffId != null) {
      return entityFactory.createEntity(findPyramusStaffMember(staffId));
    }

    throw new SchoolDataBridgeRequestException("Malformed user identifier");
  }

	@Override
	public List<User> listUsersByEmail(String email) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
	  Map<Long, User> userMap = new HashMap<Long, User>();
	  Long personId = null;
	  
	  for (Student student : pyramusClient.get("/students/students?email=" + email, Student[].class)) {
	    userMap.put(student.getId(), createStudentEntity(student));
	    personId = student.getPersonId();
	  }
	  
	  for (StaffMember staffMember : pyramusClient.get("/staff/members?email=" + email, fi.pyramus.rest.model.StaffMember[].class)) {
	    userMap.put(staffMember.getId(), entityFactory.createEntity(staffMember));
      personId = staffMember.getPersonId();
	  }
	  
	  List<User> result = new ArrayList<User>();
	  
	  if (personId != null) {
	    Person person = findPyramusPerson(personId);
	    if (userMap.containsKey(person.getDefaultUserId())) {
	      result.add(userMap.remove(person.getDefaultUserId()));
	    }
    }
	  
	  result.addAll(userMap.values());
	  
	  return result;
	}

	@Override
	public List<User> listUsers() throws UnexpectedSchoolDataBridgeException {
		List<User> result = new ArrayList<User>();

    result.addAll(createStudentEntities(pyramusClient.get("/students/students", Student[].class)));
    result.addAll(entityFactory.createEntity(pyramusClient.get("/staff/members", fi.pyramus.rest.model.StaffMember[].class)));

		return result;
	}

	@Override
	public User updateUser(User user) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
		if (!StringUtils.isNumeric(user.getIdentifier())) {
			throw new SchoolDataBridgeRequestException("Identifier has to be numeric");
		}

		throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}

	@Override
	public void removeUser(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
		if (!NumberUtils.isNumber(identifier)) {
			throw new SchoolDataBridgeRequestException("Identifier has to be numeric");
		}

		throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}
	
	@Override
	public UserEmail createUserEmail(String userIdentifier, String address) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");

	}

	@Override
	public UserEmail findUserEmail(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}
	
	@Override
	public List<UserEmail> listUserEmailsByUserIdentifier(String userIdentifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}
	
	@Override
	public UserEmail updateUserEmail(UserEmail userEmail) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}
	
	@Override
	public void removeUserEmail(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}
	
	@Override
	public UserImage createUserImage(String userIdentifier, String contentType, byte[] content) throws SchoolDataBridgeRequestException,
			UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}
	
	@Override
	public UserImage findUserImage(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}
	
	@Override
	public List<UserImage> listUserImagesByUserIdentifier(String userIdentifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}

	@Override
	public UserImage updateUserImage(UserImage userImage) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}

	@Override
	public void removeUserImage(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}

	@Override
	public UserProperty getUserProperty(String userIdentifier, String key) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}

	@Override
	public UserProperty setUserProperty(String userIdentifier, String key, String value) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
	}

	@Override
	public List<UserProperty> listUserPropertiesByUser(String userIdentifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
    throw new UnexpectedSchoolDataBridgeException("Not implemented");
  }
	
	@Override
	public Role findRole(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
	  UserRole pyramusUserRole = identifierMapper.getPyramusUserRole(identifier);
	  if (pyramusUserRole != null) {
      return entityFactory.createEntity(pyramusUserRole);
	  }
	  
	  String id = identifierMapper.getPyramusCourseRoleId(identifier);
    if (StringUtils.isBlank(id)) {
      throw new SchoolDataBridgeRequestException("Malformed role identifier");
    }
    
    if ("STUDENT".equals(id)) {
      return entityFactory.createCourseStudentRoleEntity();
    }
    
    return entityFactory.createEntity(pyramusClient.get("/courses/staffMemberRoles/" + id, CourseStaffMemberRole.class));
	}
	
	@Override
	public List<Role> listRoles() throws UnexpectedSchoolDataBridgeException {
	  List<Role> result = new ArrayList<>();
	  
	  result.addAll(entityFactory.createEntity(UserRole.values()));
	  result.addAll(entityFactory.createEntity(pyramusClient.get("/courses/staffMemberRoles", CourseStaffMemberRole[].class)));
	  result.add(entityFactory.createCourseStudentRoleEntity());
	  
	  return result;
	}

	@Override
	public Role findUserEnvironmentRole(String userIdentifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
	  Long studentId = identifierMapper.getPyramusStudentId(userIdentifier);
	  if (studentId != null) {
      Student student = pyramusClient.get("/students/students/" + studentId, Student.class);
      return student != null ? entityFactory.createStudentEnvironmentRoleEntity() : null;
	  }
	  
    Long staffId = identifierMapper.getPyramusStaffId(userIdentifier);
    if (staffId != null) {
      fi.pyramus.rest.model.StaffMember staffMember = pyramusClient.get("/staff/members/" + staffId, fi.pyramus.rest.model.StaffMember.class);
      return staffMember != null ? entityFactory.createEntity(staffMember.getRole()) : null;
    }
	  
    throw new SchoolDataBridgeRequestException("Malformed user identifier");
	}

  private Person findPyramusPerson(Long personId) {
    Person person = pyramusClient.get("/persons/persons/" + personId, fi.pyramus.rest.model.Person.class);
    return person;
  }
  
  private User findUserByPyramusUser(Long userId) {
    Student student = findPyramusStudent(userId);
    if (student != null) {
      return createStudentEntity(student);
    }
    
    StaffMember staffMember = findPyramusStaffMember(userId);
   
    return entityFactory.createEntity(staffMember);
  }

  private StaffMember findPyramusStaffMember(Long staffId) {
    return pyramusClient.get("/staff/members/" + staffId, fi.pyramus.rest.model.StaffMember.class);
  }
  
  private Student findPyramusStudent(Long studentId) {
    return pyramusClient.get("/students/students/" + studentId, Student.class);
  }
	
}