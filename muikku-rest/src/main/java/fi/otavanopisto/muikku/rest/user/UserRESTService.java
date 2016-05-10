package fi.otavanopisto.muikku.rest.user;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.CacheControl;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.EntityTag;
import javax.ws.rs.core.Request;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;
import javax.ws.rs.core.Response.Status;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.math.NumberUtils;

import fi.otavanopisto.muikku.model.users.EnvironmentRoleArchetype;
import fi.otavanopisto.muikku.model.users.Flag;
import fi.otavanopisto.muikku.model.users.FlagStudent;
import fi.otavanopisto.muikku.model.users.StudentFlagType;
import fi.otavanopisto.muikku.model.users.UserEntity;
import fi.otavanopisto.muikku.model.users.UserGroupEntity;
import fi.otavanopisto.muikku.model.users.UserSchoolDataIdentifier;
import fi.otavanopisto.muikku.model.workspace.WorkspaceEntity;
import fi.otavanopisto.muikku.rest.AbstractRESTService;
import fi.otavanopisto.muikku.rest.RESTPermitUnimplemented;
import fi.otavanopisto.muikku.rest.model.Student;
import fi.otavanopisto.muikku.rest.model.StudentAddress;
import fi.otavanopisto.muikku.rest.model.StudentEmail;
import fi.otavanopisto.muikku.rest.model.StudentPhoneNumber;
import fi.otavanopisto.muikku.rest.model.UserBasicInfo;
import fi.otavanopisto.muikku.schooldata.GradingController;
import fi.otavanopisto.muikku.schooldata.SchoolDataBridgeSessionController;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.entity.TransferCredit;
import fi.otavanopisto.muikku.schooldata.entity.User;
import fi.otavanopisto.muikku.schooldata.entity.UserAddress;
import fi.otavanopisto.muikku.schooldata.entity.UserEmail;
import fi.otavanopisto.muikku.schooldata.entity.UserPhoneNumber;
import fi.otavanopisto.muikku.search.SearchProvider;
import fi.otavanopisto.muikku.search.SearchResult;
import fi.otavanopisto.muikku.security.MuikkuPermissions;
import fi.otavanopisto.muikku.session.SessionController;
import fi.otavanopisto.muikku.users.FlagController;
import fi.otavanopisto.muikku.users.StudentFlagController;
import fi.otavanopisto.muikku.users.UserController;
import fi.otavanopisto.muikku.users.UserEmailEntityController;
import fi.otavanopisto.muikku.users.UserEntityController;
import fi.otavanopisto.muikku.users.UserGroupEntityController;
import fi.otavanopisto.muikku.users.UserSchoolDataIdentifierController;
import fi.otavanopisto.muikku.users.WorkspaceUserEntityController;
import fi.otavanopisto.security.rest.RESTPermit;
import fi.otavanopisto.security.rest.RESTPermit.Handling;

@Stateful
@RequestScoped
@Path("/user")
@Produces("application/json")
@Consumes("application/json")
public class UserRESTService extends AbstractRESTService {

  @Inject
  private Logger logger;
  
	@Inject
	private UserController userController;

	@Inject
	private UserEntityController userEntityController;

  @Inject
  private UserGroupEntityController userGroupEntityController; 
  
	@Inject
	private UserEmailEntityController userEmailEntityController;
	
	@Inject
	private SessionController sessionController;
	
  @Inject
  private SchoolDataBridgeSessionController schoolDataBridgeSessionController;
	
  @Inject
  private WorkspaceUserEntityController workspaceUserEntityController; 
  
  @Inject
  private StudentFlagController studentFlagController;

  @Inject
  private FlagController flagController;

  @Inject
  private UserSchoolDataIdentifierController userSchoolDataIdentifierController;

  @Inject
  private GradingController gradingController;
  
  @Inject
	@Any
	private Instance<SearchProvider> searchProviders;
  
  @GET
  @Path("/students")
  @RESTPermit (handling = Handling.INLINE)
  public Response searchStudents(
      @QueryParam("searchString") String searchString,
      @QueryParam("firstResult") @DefaultValue("0") Integer firstResult,
      @QueryParam("maxResults") @DefaultValue("10") Integer maxResults,
      @QueryParam("userGroupIds") List<Long> userGroupIds,
      @QueryParam("myUserGroups") Boolean myUserGroups,
      @QueryParam("workspaceIds") List<Long> workspaceIds,
      @QueryParam("myWorkspaces") Boolean myWorkspaces,
      @QueryParam("userEntityId") Long userEntityId,
      @DefaultValue ("false") @QueryParam("includeInactiveStudents") Boolean includeInactiveStudents,
      @QueryParam("flags") Long[] flagIds) {
    
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.FORBIDDEN).build();
    }

    if (CollectionUtils.isNotEmpty(userGroupIds) && Boolean.TRUE.equals(myUserGroups)) {
      return Response.status(Status.BAD_REQUEST).build();
    }
    
    if (CollectionUtils.isNotEmpty(workspaceIds) && Boolean.TRUE.equals(myWorkspaces)) {
      return Response.status(Status.BAD_REQUEST).build();
    }
    
    List<Flag> flags = null;
    if (flagIds != null && flagIds.length > 0) {
      flags = new ArrayList<>(flagIds.length);
      for (Long flagId : flagIds) {
        Flag flag = flagController.findFlagById(flagId);
        if (flag == null) {
          return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid flag id %d", flagId)).build();
        }
        
        if (!flagController.hasFlagPermission(flag, sessionController.getLoggedUser())) {
          return Response.status(Status.FORBIDDEN).entity(String.format("You don't have permission to use flag %d", flagId)).build();
        }
        
        flags.add(flag);
      }
    }
    
    List<fi.otavanopisto.muikku.rest.model.Student> students = new ArrayList<>();

    UserEntity loggedUser = sessionController.getLoggedUserEntity();
    
    Set<Long> userGroupFilters = null;
    Set<Long> workspaceFilters = new HashSet<Long>();

    if ((myUserGroups != null) && myUserGroups) {
      userGroupFilters = new HashSet<Long>();

      // Groups where user is a member
      
      List<UserGroupEntity> userGroups = userGroupEntityController.listUserGroupsByUserIdentifier(sessionController.getLoggedUser());
      for (UserGroupEntity userGroup : userGroups) {
        userGroupFilters.add(userGroup.getId());
      }
    } else if (!CollectionUtils.isEmpty(userGroupIds)) {
      userGroupFilters = new HashSet<Long>();
      
      // Defined user groups
      userGroupFilters.addAll(userGroupIds);
    }
    
    List<SchoolDataIdentifier> userIdentifiers = null;    
    if (flags != null) {
      if (userIdentifiers == null) {
        userIdentifiers = new ArrayList<>();
      }
      
      userIdentifiers.addAll(flagController.getFlaggedStudents(flags));
    }
    
    if (Boolean.TRUE.equals(includeInactiveStudents)) {
      if (!sessionController.hasEnvironmentPermission(MuikkuPermissions.LIST_INACTIVE_STUDENTS)) {
        if (userEntityId == null) {
          return Response.status(Status.FORBIDDEN).build();
        } else {
          if (!sessionController.getLoggedUserEntity().getId().equals(userEntityId)) {
            return Response.status(Status.FORBIDDEN).build();
          }
        }
      }
    } 
    
    if (userEntityId != null) {
      List<SchoolDataIdentifier> userEntityIdentifiers = new ArrayList<>();
       
      UserEntity userEntity = userEntityController.findUserEntityById(userEntityId);
      if (userEntity == null) {
        return Response.status(Status.BAD_REQUEST).entity(String.format("Invalid userEntityId %d", userEntityId)).build();
      }
      
      List<UserSchoolDataIdentifier> schoolDataIdentifiers = userSchoolDataIdentifierController.listUserSchoolDataIdentifiersByUserEntity(userEntity);
      for (UserSchoolDataIdentifier schoolDataIdentifier : schoolDataIdentifiers) {
        userEntityIdentifiers.add(new SchoolDataIdentifier(schoolDataIdentifier.getIdentifier(), schoolDataIdentifier.getDataSource().getIdentifier()));
      }
      
      if (userIdentifiers == null) {
        userIdentifiers = userEntityIdentifiers;
      } else {
        userIdentifiers.retainAll(userEntityIdentifiers);
      }
    }
    
    if ((myWorkspaces != null) && myWorkspaces) {
      // Workspaces where user is a member
      List<WorkspaceEntity> workspaces = workspaceUserEntityController.listWorkspaceEntitiesByUserEntity(loggedUser);
      Set<Long> myWorkspaceIds = new HashSet<Long>();
      for (WorkspaceEntity ws : workspaces)
        myWorkspaceIds.add(ws.getId());

      workspaceFilters.addAll(myWorkspaceIds);
    } else if (!CollectionUtils.isEmpty(workspaceIds)) {
      // Defined workspaces
      workspaceFilters.addAll(workspaceIds);
    }

    SearchProvider elasticSearchProvider = getProvider("elastic-search");
    if (elasticSearchProvider != null) {
      String[] fields = new String[] { "firstName", "lastName" };

      SearchResult result = elasticSearchProvider.searchUsers(searchString, fields, EnvironmentRoleArchetype.STUDENT, userGroupFilters, workspaceFilters, userIdentifiers, includeInactiveStudents, firstResult, maxResults);
      
      List<Map<String, Object>> results = result.getResults();
      boolean hasImage = false;

      if (results != null && !results.isEmpty()) {
        for (Map<String, Object> o : results) {
          String studentId = (String) o.get("id");
          if (StringUtils.isBlank(studentId)) {
            logger.severe("Could not process user found from search index because it had a null id");
            continue;
          }
          
          String[] studentIdParts = studentId.split("/", 2);
          SchoolDataIdentifier studentIdentifier = studentIdParts.length == 2 ? new SchoolDataIdentifier(studentIdParts[0], studentIdParts[1]) : null;
          if (studentIdentifier == null) {
            logger.severe(String.format("Could not process user found from search index with id %s", studentId));
            continue;
          }
          
          UserEntity userEntity = userEntityController.findUserEntityByUserIdentifier(studentIdentifier);
          String emailAddress = userEntity != null ? userEmailEntityController.getUserDefaultEmailAddress(userEntity, true) : null;

          Date studyStartDate = getDateResult(o.get("studyStartDate"));
          Date studyEndDate = getDateResult(o.get("studyEndDate"));
          Date studyTimeEnd = getDateResult(o.get("studyTimeEnd"));
          
          students.add(new fi.otavanopisto.muikku.rest.model.Student(
            studentIdentifier.toId(), 
            (String) o.get("firstName"),
            (String) o.get("lastName"), 
            (String) o.get("studyProgrammeName"), 
            hasImage,
            (String) o.get("nationality"), 
            (String) o.get("language"), 
            (String) o.get("municipality"), 
            (String) o.get("school"), 
            emailAddress,
            studyStartDate,
            studyEndDate,
            studyTimeEnd));
        }
      }
    }

    return Response.ok(students).build();
  }
  
  private Date getDateResult(Object value) {
    if (value instanceof Long) {
      return new Date((Long) value);
    }
    
    return null;
  }

  @GET
  @Path("/students/{ID}")
  @RESTPermit (handling = Handling.INLINE)
  public Response findUser(@Context Request request, @PathParam("ID") String id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.FORBIDDEN).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(id);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", id)).build();
    }
    
    UserEntity userEntity = userEntityController.findUserEntityByUserIdentifier(studentIdentifier);
    if (userEntity == null) {
      return Response.status(Status.NOT_FOUND).entity("UserEntity not found").build();
    }

    EntityTag tag = new EntityTag(DigestUtils.md5Hex(String.valueOf(userEntity.getVersion())));

    ResponseBuilder builder = request.evaluatePreconditions(tag);
    if (builder != null) {
      return builder.build();
    }

    CacheControl cacheControl = new CacheControl();
    cacheControl.setMustRevalidate(true);
    
    User user = userController.findUserByIdentifier(studentIdentifier);
    if (user == null) {
      return Response.status(Status.NOT_FOUND).entity("User not found").build();
    }
    
    String emailAddress = userEmailEntityController.getUserDefaultEmailAddress(userEntity, true); 
    Date studyStartDate = user.getStudyStartDate() != null ? user.getStudyStartDate().toDate() : null;
    Date studyEndDate = user.getStudyEndDate() != null ? user.getStudyEndDate().toDate() : null;
    Date studyTimeEnd = user.getStudyTimeEnd() != null ? user.getStudyTimeEnd().toDate() : null;
    
    Student student = new Student(
        studentIdentifier.toId(), 
        user.getFirstName(), 
        user.getLastName(), 
        user.getStudyProgrammeName(),
        false, 
        user.getNationality(), 
        user.getLanguage(), 
        user.getMunicipality(), 
        user.getSchool(), 
        emailAddress, 
        studyStartDate,
        studyEndDate,
        studyTimeEnd);
    
    return Response
        .ok(student)
        .cacheControl(cacheControl)
        .tag(tag)
        .build();
  }
  
  @GET
  @Path("/students/{ID}/flags")
  @RESTPermit (handling = Handling.INLINE)
  public Response listStudentFlags(@Context Request request, @PathParam("ID") String id, @QueryParam("ownerIdentifier") String ownerId) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.FORBIDDEN).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(id);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", id)).build();
    }
    
    if (StringUtils.isBlank(ownerId)) {
      return Response.status(Response.Status.NOT_IMPLEMENTED).entity("Listing student flags without owner is not implemented").build();
    }
    
    SchoolDataIdentifier ownerIdentifier = SchoolDataIdentifier.fromId(ownerId);
    if (ownerIdentifier == null) {
      return Response.status(Status.BAD_REQUEST).entity("ownerIdentifier is malformed").build();
    }

    if (!ownerIdentifier.equals(sessionController.getLoggedUser())) {
      return Response.status(Status.FORBIDDEN).build();
    }
    
    List<FlagStudent> flags = flagController.listByOwnedAndSharedStudentFlags(studentIdentifier, ownerIdentifier);
    return Response.ok(createRestModel(flags.toArray(new FlagStudent[0]))).build();
  }
  
  @POST
  @Path("/students/{ID}/flags")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response createStudentFlag(@Context Request request, @PathParam("ID") String id, fi.otavanopisto.muikku.rest.model.StudentFlag payload) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.FORBIDDEN).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(id);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", id)).build();
    }
    
    if (payload.getFlagId() == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity("Missing flagId").build();
    }
     
    Flag flag = flagController.findFlagById(payload.getFlagId());
    if (flag == null) {
      return Response.status(Status.NOT_FOUND).entity(String.format("Flag #%d not found", payload.getFlagId())).build();
    }
    
    if (!flagController.hasFlagPermission(flag, sessionController.getLoggedUser())) {
      return Response.status(Status.FORBIDDEN).entity(String.format("You do not have permission to flag students to flag %d", payload.getFlagId())).build();
    }
    
    return Response.ok(createRestModel(flagController.flagStudent(flag, studentIdentifier))).build();
  }
  
  @DELETE
  @Path("/students/{STUDENTID}/flags/{ID}")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response deleteStudentFlag(@Context Request request, @PathParam("STUDENTID") String studentId, @PathParam("ID") Long id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.FORBIDDEN).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(studentId);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", studentId)).build();
    }
    
    FlagStudent flagStudent = flagController.findFlagStudentById(id);
    if (flagStudent == null) {
      return Response.status(Response.Status.NOT_FOUND).entity(String.format("Flag not found %d", id)).build();
    }
    
    if (!flagController.hasFlagPermission(flagStudent.getFlag(), sessionController.getLoggedUser())) {
      return Response.status(Status.FORBIDDEN).entity(String.format("You do not have permission to remove student flag %d", flagStudent.getId())).build();
    }

    flagController.unflagStudent(flagStudent);
    
    return Response.noContent().build();
  }
  
  @GET
  @Path("/students/{ID}/phoneNumbers")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listStudentPhoneNumbers(@PathParam("ID") String id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.UNAUTHORIZED).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(id);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", id)).build();
    }
    
    UserEntity studentEntity = userEntityController.findUserEntityByUserIdentifier(studentIdentifier);
    if (studentEntity == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Could not find user entity for identifier %s", id)).build();
    }
    
    if (!studentEntity.getId().equals(sessionController.getLoggedUserEntity().getId())) {
      if (!sessionController.hasEnvironmentPermission(MuikkuPermissions.LIST_STUDENT_PHONE_NUMBERS)) {
        return Response.status(Status.FORBIDDEN).build();
      }
    }
    
    List<UserPhoneNumber> phoneNumbers = userController.listUserPhoneNumbers(studentIdentifier);
    Collections.sort(phoneNumbers, new Comparator<UserPhoneNumber>() {
      @Override
      public int compare(UserPhoneNumber o1, UserPhoneNumber o2) {
        return o1.getDefaultNumber() ? -1 : o2.getDefaultNumber() ? 1 : 0;
      }
    });
    
    return Response.ok(createRestModel(phoneNumbers.toArray(new UserPhoneNumber[0]))).build();
  }
  
  @GET
  @Path("/students/{ID}/emails")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listStudentEmails(@PathParam("ID") String id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.UNAUTHORIZED).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(id);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", id)).build();
    }
    
    UserEntity studentEntity = userEntityController.findUserEntityByUserIdentifier(studentIdentifier);
    if (studentEntity == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Could not find user entity for identifier %s", id)).build();
    }
    
    if (!studentEntity.getId().equals(sessionController.getLoggedUserEntity().getId())) {
      if (!sessionController.hasEnvironmentPermission(MuikkuPermissions.LIST_STUDENT_EMAILS)) {
        return Response.status(Status.FORBIDDEN).build();
      }
    }
    
    List<UserEmail> emails = userController.listUserEmails(studentIdentifier);
    Collections.sort(emails, new Comparator<UserEmail>() {
      @Override
      public int compare(UserEmail o1, UserEmail o2) {
        return o1.getDefaultAddress() ? -1 : o2.getDefaultAddress() ? 1 : 0;
      }
    });
    
    return Response.ok(createRestModel(emails.toArray(new UserEmail[0]))).build();
  }
  
  @GET
  @Path("/students/{ID}/addresses")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listStudentAddressses(@PathParam("ID") String id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.UNAUTHORIZED).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(id);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", id)).build();
    }
    
    UserEntity studentEntity = userEntityController.findUserEntityByUserIdentifier(studentIdentifier);
    if (studentEntity == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Could not find user entity for identifier %s", id)).build();
    }
    
    if (!studentEntity.getId().equals(sessionController.getLoggedUserEntity().getId())) {
      if (!sessionController.hasEnvironmentPermission(MuikkuPermissions.LIST_STUDENT_ADDRESSES)) {
        return Response.status(Status.FORBIDDEN).build();
      }
    }
    
    List<UserAddress> addresses = userController.listUserAddresses(studentIdentifier);
    Collections.sort(addresses, new Comparator<UserAddress>() {
      @Override
      public int compare(UserAddress o1, UserAddress o2) {
        return o1.getDefaultAddress() ? -1 : o2.getDefaultAddress() ? 1 : 0;
      }
    });
    
    return Response.ok(createRestModel(addresses.toArray(new UserAddress[0]))).build();
  }

  @GET
  @Path("/students/{ID}/transferCredits")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listStudentTransferCredits(@PathParam("ID") String id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.UNAUTHORIZED).build();
    }
    
    SchoolDataIdentifier studentIdentifier = SchoolDataIdentifier.fromId(id);
    if (studentIdentifier == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid studentIdentifier %s", id)).build();
    }
    
    UserEntity studentEntity = userEntityController.findUserEntityByUserIdentifier(studentIdentifier);
    if (studentEntity == null) {
      return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Could not find user entity for identifier %s", id)).build();
    }
    
    if (!studentEntity.getId().equals(sessionController.getLoggedUserEntity().getId())) {
      if (!sessionController.hasEnvironmentPermission(MuikkuPermissions.LIST_STUDENT_TRANSFER_CREDITS)) {
        return Response.status(Status.FORBIDDEN).build();
      }
    }
    
    List<TransferCredit> transferCredits = gradingController.listStudentTransferCredits(studentIdentifier);
    
    return Response.ok(createRestModel(transferCredits.toArray(new TransferCredit[0]))).build();
  }
  
  @GET
  @Path("/flags/")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listFlags(@QueryParam("ownerIdentifier") String ownerId) {
    SchoolDataIdentifier ownerIdentifier = null;

    if (StringUtils.isNotBlank(ownerId)) {
      ownerIdentifier = SchoolDataIdentifier.fromId(ownerId);
      if (ownerIdentifier == null) {
        return Response.status(Status.BAD_REQUEST).entity("ownerIdentifier is malformed").build();
      }

      // TODO: Add permission to list flags owned by others
      if (!ownerIdentifier.equals(sessionController.getLoggedUser())) {
        return Response.status(Status.FORBIDDEN).build();
      }
    } else {
      return Response.status(Status.FORBIDDEN).build();
    }
    
    List<Flag> flags = flagController.listByOwnedAndSharedFlags(ownerIdentifier);
    List<fi.otavanopisto.muikku.rest.model.Flag> response = new ArrayList<>();
    for (Flag flag : flags) {
      response.add(new fi.otavanopisto.muikku.rest.model.Flag(flag.getId(), flag.getName(), flag.getColor(), flag.getDescription(), ownerIdentifier.toId()));
    }
    
    return Response.ok(response).build();
  }

  @GET
  @Path("/studentFlagTypes")
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listStudentFlags(@QueryParam("ownerIdentifier") String ownerId) {
    SchoolDataIdentifier ownerIdentifier = null;

    if (StringUtils.isNotBlank(ownerId)) {
      ownerIdentifier = SchoolDataIdentifier.fromId(ownerId);
      if (ownerIdentifier == null) {
        return Response.status(Status.BAD_REQUEST).entity("ownerIdentifier is malformed").build();
      }

      if (!ownerIdentifier.equals(sessionController.getLoggedUser())) {
        return Response.status(Status.FORBIDDEN).build();
      }
    }
    
    List<StudentFlagType> studentFlagTypes = null;
    
    if (ownerIdentifier != null) {
      studentFlagTypes = studentFlagController.listOwnerFlagTypes(ownerIdentifier);
    } else {
      studentFlagTypes = Arrays.asList(StudentFlagType.values());
    }
    
    List<fi.otavanopisto.muikku.rest.model.StudentFlagType> response = new ArrayList<>();
    for (StudentFlagType studentFlagType : studentFlagTypes) {
      response.add(new fi.otavanopisto.muikku.rest.model.StudentFlagType(studentFlagType.name()));
    }
    
    return Response.ok(response).build();
  }
  
	@GET
	@Path("/users")
	@RESTPermitUnimplemented
	public Response searchUsers(
			@QueryParam("searchString") String searchString,
			@QueryParam("firstResult") @DefaultValue("0") Integer firstResult,
			@QueryParam("maxResults") @DefaultValue("10") Integer maxResults,
			@QueryParam("userGroupIds") List<Long> userGroupIds,
      @QueryParam("myUserGroups") Boolean myUserGroups,
			@QueryParam("workspaceIds") List<Long> workspaceIds,
      @QueryParam("myWorkspaces") Boolean myWorkspaces,
			@QueryParam("archetype") String archetype) {
	  
	  // TODO: Add new endpoint for listing staff members and deprecate this.
	  
	  if (!sessionController.isLoggedIn()) {
	    return Response.status(Status.FORBIDDEN).build();
	  }

	  if (CollectionUtils.isNotEmpty(userGroupIds) && Boolean.TRUE.equals(myUserGroups))
	    return Response.status(Status.BAD_REQUEST).build();
	  
    if (CollectionUtils.isNotEmpty(workspaceIds) && Boolean.TRUE.equals(myWorkspaces))
      return Response.status(Status.BAD_REQUEST).build();
    
	  UserEntity loggedUser = sessionController.getLoggedUserEntity();
	  
	  EnvironmentRoleArchetype roleArchetype = archetype != null ? EnvironmentRoleArchetype.valueOf(archetype) : null;

    Set<Long> userGroupFilters = null;
    Set<Long> workspaceFilters = new HashSet<Long>();

	  if ((myUserGroups != null) && myUserGroups) {
	    userGroupFilters = new HashSet<Long>();

	    // Groups where user is a member
	    
	    List<UserGroupEntity> userGroups = userGroupEntityController.listUserGroupsByUserIdentifier(sessionController.getLoggedUser());
	    for (UserGroupEntity userGroup : userGroups) {
	      userGroupFilters.add(userGroup.getId());
	    }
	  } else if (!CollectionUtils.isEmpty(userGroupIds)) {
	    userGroupFilters = new HashSet<Long>();
	    
      // Defined user groups
	    userGroupFilters.addAll(userGroupIds);
	  }

    if ((myWorkspaces != null) && myWorkspaces) {
      // Workspaces where user is a member
      List<WorkspaceEntity> workspaces = workspaceUserEntityController.listWorkspaceEntitiesByUserEntity(loggedUser);
      Set<Long> myWorkspaceIds = new HashSet<Long>();
      for (WorkspaceEntity ws : workspaces)
        myWorkspaceIds.add(ws.getId());

      workspaceFilters.addAll(myWorkspaceIds);
    } else if (!CollectionUtils.isEmpty(workspaceIds)) {
      // Defined workspaces
      workspaceFilters.addAll(workspaceIds);
    }

    SearchProvider elasticSearchProvider = getProvider("elastic-search");
		if (elasticSearchProvider != null) {
			String[] fields = new String[] { "firstName", "lastName" };

			SearchResult result = elasticSearchProvider.searchUsers(searchString, fields, roleArchetype, userGroupFilters, workspaceFilters, null, firstResult, maxResults);
			
			List<Map<String, Object>> results = result.getResults();
			boolean hasImage = false;

			List<fi.otavanopisto.muikku.rest.model.User> ret = new ArrayList<fi.otavanopisto.muikku.rest.model.User>();

			if (!results.isEmpty()) {
				for (Map<String, Object> o : results) {
					String[] id = ((String) o.get("id")).split("/", 2);
					UserEntity userEntity = userEntityController
							.findUserEntityByDataSourceAndIdentifier(id[1],
									id[0]);
					
					if (userEntity != null) {
					  String emailAddress = userEmailEntityController.getUserDefaultEmailAddress(userEntity, true);
					  Date studyStartDate = getDateResult(o.get("studyStartDate"));
	          Date studyTimeEnd = getDateResult(o.get("studyTimeEnd"));
	          
						ret.add(new fi.otavanopisto.muikku.rest.model.User(userEntity
								.getId(), (String) o.get("firstName"),
								(String) o.get("lastName"), hasImage,
								(String) o.get("nationality"), (String) o
										.get("language"), (String) o
										.get("municipality"), (String) o
										.get("school"), emailAddress,
										studyStartDate,
										studyTimeEnd));
					}
				}

				return Response.ok(ret).build();
			} else
				return Response.noContent().build();
		}

		return Response.status(Status.INTERNAL_SERVER_ERROR).build();
	}

  @GET
	@Path("/users/{ID}")
  @RESTPermitUnimplemented
	public Response findUser(@Context Request request, @PathParam("ID") Long id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.FORBIDDEN).build();
    }

		UserEntity userEntity = userEntityController.findUserEntityById(id);
		if (userEntity == null) {
			return Response.status(Response.Status.NOT_FOUND).build();
		}

    EntityTag tag = new EntityTag(DigestUtils.md5Hex(String.valueOf(userEntity.getVersion())));

    ResponseBuilder builder = request.evaluatePreconditions(tag);
    if (builder != null) {
      return builder.build();
    }

    CacheControl cacheControl = new CacheControl();
    cacheControl.setMustRevalidate(true);

		User user = userController.findUserByDataSourceAndIdentifier(
				userEntity.getDefaultSchoolDataSource(),
				userEntity.getDefaultIdentifier());
		if (user == null) {
			return Response.status(Response.Status.NOT_FOUND).build();
		}

		return Response
		    .ok(createRestModel(userEntity, user))
        .cacheControl(cacheControl)
        .tag(tag)
		    .build();
	}

  @GET
  @Path("/users/{ID}/basicinfo")
  @RESTPermitUnimplemented
  public Response findUserBasicInfo(@Context Request request, @PathParam("ID") String id) {
    if (!sessionController.isLoggedIn()) {
      return Response.status(Status.FORBIDDEN).build();
    }
    
    UserEntity userEntity = null;
    
    SchoolDataIdentifier userIdentifier = SchoolDataIdentifier.fromId(id);
    if (userIdentifier == null) {
      if (!StringUtils.isNumeric(id)) {
        return Response.status(Response.Status.BAD_REQUEST).entity(String.format("Invalid user id %s", id)).build();
      }
      
      userEntity = userEntityController.findUserEntityById(NumberUtils.createLong(id));
      userIdentifier = new SchoolDataIdentifier(userEntity.getDefaultIdentifier(), userEntity.getDefaultSchoolDataSource().getIdentifier());
    } else {
      userEntity = userEntityController.findUserEntityByUserIdentifier(userIdentifier);
    }

    if (userEntity == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
    
    EntityTag tag = new EntityTag(DigestUtils.md5Hex(String.valueOf(userEntity.getVersion())));

    ResponseBuilder builder = request.evaluatePreconditions(tag);
    if (builder != null) {
      return builder.build();
    }

    CacheControl cacheControl = new CacheControl();
    cacheControl.setMustRevalidate(true);

    schoolDataBridgeSessionController.startSystemSession();
    try {
      User user = userController.findUserByIdentifier(userIdentifier);
      if (user == null) {
        return Response.status(Response.Status.NOT_FOUND).build();
      }

      // TODO: User image
      boolean hasImage = false;
      return Response
          .ok(new UserBasicInfo(userEntity.getId(), user.getFirstName(), user.getLastName(), user.getStudyProgrammeName(), hasImage, user.hasEvaluationFees()))
          .cacheControl(cacheControl)
          .tag(tag)
          .build();
    } finally {
      schoolDataBridgeSessionController.endSystemSession();
    }
  }

  private fi.otavanopisto.muikku.rest.model.User createRestModel(UserEntity userEntity,
			User user) {
		// TODO: User Image
		boolean hasImage = false;
		
		String emailAddress = userEmailEntityController.getUserDefaultEmailAddress(userEntity, true); 
		
		Date startDate = user.getStudyStartDate() != null ? user.getStudyStartDate().toDate() : null;
		Date endDate = user.getStudyTimeEnd() != null ? user.getStudyTimeEnd().toDate() : null;
		
		return new fi.otavanopisto.muikku.rest.model.User(userEntity.getId(),
				user.getFirstName(), user.getLastName(), hasImage,
				user.getNationality(), user.getLanguage(),
				user.getMunicipality(), user.getSchool(), emailAddress,
				startDate, endDate);
	}

  private fi.otavanopisto.muikku.rest.model.StudentFlag createRestModel(FlagStudent flagStudent) {
    SchoolDataIdentifier studentIdentifier = new SchoolDataIdentifier(flagStudent.getStudentIdentifier().getIdentifier(), flagStudent.getStudentIdentifier().getDataSource().getIdentifier());
    return new fi.otavanopisto.muikku.rest.model.StudentFlag(flagStudent.getId(), flagStudent.getFlag().getId(), studentIdentifier.toId());
  }

  private List<fi.otavanopisto.muikku.rest.model.StudentFlag> createRestModel(FlagStudent[] flagStudents) {
    List<fi.otavanopisto.muikku.rest.model.StudentFlag> result = new ArrayList<>();
    
    for (FlagStudent flagStudent : flagStudents) {
      result.add(createRestModel(flagStudent));
    }
    
    return result;
  }
  
  private List<fi.otavanopisto.muikku.rest.model.TransferCredit> createRestModel(TransferCredit[] transferCredits) {
    List<fi.otavanopisto.muikku.rest.model.TransferCredit> result = new ArrayList<>();
    
    if (transferCredits != null) {
      for (TransferCredit transferCredit : transferCredits) {
        result.add(createRestModel(transferCredit));
      }
    }
    
    return result;
  }
  
  private fi.otavanopisto.muikku.rest.model.TransferCredit createRestModel(TransferCredit transferCredit) {
    return new fi.otavanopisto.muikku.rest.model.TransferCredit(
        toId(transferCredit.getIdentifier()), 
        toId(transferCredit.getStudentIdentifier()), 
        transferCredit.getDate(), 
        toId(transferCredit.getGradeIdentifier()), 
        toId(transferCredit.getGradingScaleIdentifier()), 
        transferCredit.getVerbalAssessment(), 
        toId(transferCredit.getAssessorIdentifier()), 
        transferCredit.getCourseName(), 
        transferCredit.getCourseNumber(), 
        transferCredit.getLength(), 
        toId(transferCredit.getLengthUnitIdentifier()), 
        toId(transferCredit.getSchoolIdentifier()), 
        toId(transferCredit.getSubjectIdentifier()));
  }
  
  private String toId(SchoolDataIdentifier identifier) {
    if (identifier == null) {
      return null;
    }
    
    return identifier.toId();
  }
  
	private SearchProvider getProvider(String name) {
		Iterator<SearchProvider> i = searchProviders.iterator();
		while (i.hasNext()) {
			SearchProvider provider = i.next();
			if (name.equals(provider.getName())) {
				return provider;
			}
		}
		return null;
	}

  private List<StudentPhoneNumber> createRestModel(UserPhoneNumber[] entities) {
    List<StudentPhoneNumber> result = new ArrayList<>();
    
    for (UserPhoneNumber entity : entities) {
      result.add(new StudentPhoneNumber(toId(entity.getUserIdentifier()), entity.getType(), entity.getNumber(), entity.getDefaultNumber()));
    }

    return result;
  }

  private List<StudentEmail> createRestModel(UserEmail[] entities) {
    List<StudentEmail> result = new ArrayList<>();
    
    for (UserEmail entity : entities) {
      result.add(new StudentEmail(toId(entity.getUserIdentifier()), entity.getType(), entity.getAddress(), entity.getDefaultAddress()));
    }

    return result;
  }

  private List<StudentAddress> createRestModel(UserAddress[] entities) {
    List<StudentAddress> result = new ArrayList<>();
    
    for (UserAddress entity : entities) {
      result.add(new StudentAddress(toId(entity.getUserIdentifier()), 
          entity.getStreet(),
          entity.getPostalCode(),
          entity.getCity(),
          entity.getRegion(),
          entity.getCountry(),
          entity.getType(),
          entity.getDefaultAddress())
      );
    }

    return result;
  }
}
