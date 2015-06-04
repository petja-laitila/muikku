package fi.muikkku.ui;
import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlEqualTo;
import static com.github.tomakehurst.wiremock.client.WireMock.urlMatching;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.joda.time.DateTime;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.joda.JodaModule;

import fi.pyramus.rest.model.Course;
import fi.pyramus.rest.model.CourseStaffMemberRole;
import fi.pyramus.rest.model.CourseType;
import fi.pyramus.rest.model.EducationType;
import fi.pyramus.rest.model.EducationalTimeUnit;
import fi.pyramus.rest.model.Email;
import fi.pyramus.rest.model.Person;
import fi.pyramus.rest.model.StaffMember;
import fi.pyramus.rest.model.Student;
import fi.pyramus.rest.model.Subject;
import fi.pyramus.rest.model.WhoAmI;

public class PyramusMocks{
  
  public static void student1LoginMock() throws JsonProcessingException {
    stubFor(get(urlEqualTo("/dnm")).willReturn(aResponse().withHeader("Content-Type", "application/json").withBody("").withStatus(204)));

    stubFor(get(urlMatching("/users/authorize.*"))
      .willReturn(aResponse()
        .withStatus(302)
        .withHeader("Location",
          "http://dev.muikku.fi:8080/login?_stg=rsp&code=1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111")));
    
    stubFor(post(urlEqualTo("/1/oauth/token"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody("{\"expires_in\":3600,\"refresh_token\":\"12312ewsdf34fsd234r43rfsw32rf33e\",\"access_token\":\"ur84ur839843ruwf39843ru39ru37y2e\"}")
        .withStatus(200)));

    List<String> emails = new ArrayList<String>();
    emails.add("testuser@made.up");
    WhoAmI whoAmI = new WhoAmI((long) 1, "Test", "User", emails);

    ObjectMapper objectMapper = new ObjectMapper().registerModule(new JodaModule()).enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    String whoAmIJson = objectMapper.writeValueAsString(whoAmI);

    stubFor(get(urlEqualTo("/1/system/whoami"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(whoAmIJson)
        .withStatus(200)));
  }

  public static void adminLoginMock() throws JsonProcessingException {
    stubFor(get(urlEqualTo("/dnm")).willReturn(aResponse().withHeader("Content-Type", "application/json").withBody("").withStatus(204)));

    stubFor(get(urlMatching("/users/authorize.*"))
      .willReturn(aResponse()
        .withStatus(302)
        .withHeader("Location",
          "http://dev.muikku.fi:8080/login?_stg=rsp&code=1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111")));

    stubFor(post(urlEqualTo("/1/oauth/token"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody("{\"expires_in\":3600,\"refresh_token\":\"12312ewsdf34fsd234r43rfsw32rf33e\",\"access_token\":\"ur84ur839843ruwf39843ru39ru37y2e\"}")
        .withStatus(200)));

    List<String> emails = new ArrayList<String>();
    emails.add("admin@made.up");
    WhoAmI whoAmI = new WhoAmI((long) 4, "Admin", "User", emails);

    ObjectMapper objectMapper = new ObjectMapper().registerModule(new JodaModule()).enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    String whoAmIJson = objectMapper.writeValueAsString(whoAmI);

    stubFor(get(urlEqualTo("/1/system/whoami"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(whoAmIJson)
        .withStatus(200)));
  }    
  
  public static void personsPyramusMocks() throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper().registerModule(new JodaModule()).enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);    
    Map<String, String> variables = null;
    List<String> tags = null;
    Student student = new Student((long) 1, (long) 1, "Test", "User", null, null, null, null, null, null, null, null, null, null, null, (long) 1, null, null,
      false, null, null, null, null, variables, tags, false);
    String studentJson = objectMapper.writeValueAsString(student);
    
    stubFor(get(urlEqualTo("/1/students/students/1"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(studentJson)
        .withStatus(200)));

    Email email = new Email((long) 1, (long) 2, true, "testuser@made.up");
    String emailJson = objectMapper.writeValueAsString(email);
    stubFor(get(urlEqualTo("/1/students/students/1/emails"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(emailJson).withStatus(200)));

    Student[] studentArray = { student };
    String studentArrayJson = objectMapper.writeValueAsString(studentArray);
    stubFor(get(urlEqualTo("/1/students/students?email=testuser@made.up"))
    // .withQueryParam("email", matching(".*"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(studentArrayJson)
        .withStatus(200)));

    DateTime birthday = new DateTime(1990, 2, 2, 0, 0, 0, 0);

    Person person = new Person((long) 1, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 1);
    String personJson = objectMapper.writeValueAsString(person);
    stubFor(get(urlEqualTo("/1/persons/persons/1"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(personJson)
        .withStatus(200)));

    Person staff1 = new Person((long) 2, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 2);
    String staff1Json = objectMapper.writeValueAsString(staff1);
    stubFor(get(urlEqualTo("/1/persons/persons/2"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staff1Json)
        .withStatus(200)));

    Person staff2 = new Person((long) 3, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 3);
    String staff2Json = objectMapper.writeValueAsString(staff2);
    stubFor(get(urlEqualTo("/1/persons/persons/3"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staff2Json)
        .withStatus(200)));
    
    Person staff3 = new Person((long) 4, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 4);
    String staff3Json = objectMapper.writeValueAsString(staff3);
    stubFor(get(urlEqualTo("/1/persons/persons/4"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staff3Json)
        .withStatus(200)));
    
    Person[] personArray = {person, staff1, staff2, staff3};
    String personArrayJson = objectMapper.writeValueAsString(personArray);
    stubFor(get(urlEqualTo("/1/persons/persons?filterArchived=false"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(personArrayJson)
        .withStatus(200)));
    
    stubFor(get(urlEqualTo("/1/students/students?filterArchived=false&firstResult=0&maxResults=100"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(studentArrayJson)
        .withStatus(200)));

    StaffMember staffMember1 = new StaffMember((long) 2, (long) 2, null, "Test", "Staff1member", null, fi.pyramus.rest.model.UserRole.MANAGER, tags, variables);
    String staffMemberJson = objectMapper.writeValueAsString(staffMember1);
    stubFor(get(urlEqualTo("/1/staff/members/2"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffMemberJson)
        .withStatus(200)));
    
    StaffMember staffMember2 = new StaffMember((long) 3, (long) 3, null, "Test", "Staff2member", null, fi.pyramus.rest.model.UserRole.MANAGER, tags, variables);
    staffMemberJson = objectMapper.writeValueAsString(staffMember2);
    stubFor(get(urlEqualTo("/1/staff/members/3"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffMemberJson)
        .withStatus(200)));
    
    StaffMember staffMember3 = new StaffMember((long) 4, (long) 4, null, "Test", "Administrator", null, fi.pyramus.rest.model.UserRole.ADMINISTRATOR, tags, variables);
    staffMemberJson = objectMapper.writeValueAsString(staffMember3);
    stubFor(get(urlEqualTo("/1/staff/members/4"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffMemberJson)
        .withStatus(200)));
    
    StaffMember[] staffArray = { staffMember1, staffMember2, staffMember3 };
    String staffArrayJson = objectMapper.writeValueAsString(staffArray);

    stubFor(get(urlEqualTo("/1/staff/members"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffArrayJson)
        .withStatus(200)));
    
    stubFor(get(urlEqualTo("1/courses/courses/1/staffMembers"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffArrayJson)
        .withStatus(200)));
    
    Email staff1Email = new Email((long) 2, (long) 1, true, "teacher@made.up");
    Email[] staff1Emails = {staff1Email};
    String staff1EmailJson = objectMapper.writeValueAsString(staff1Emails);
    stubFor(get(urlEqualTo("/1/members/2/emails"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staff1EmailJson)
        .withStatus(200)));

    Email staff2Email = new Email((long) 3, (long) 1, true, "mana@made.up");
    Email[] staff2Emails = {staff2Email};
    String staff2EmailJson = objectMapper.writeValueAsString(staff2Emails);
    stubFor(get(urlEqualTo("/1/members/3/emails"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staff2EmailJson)
        .withStatus(200)));

    Email staff3Email = new Email((long) 4, (long) 1, true, "admin@made.up");
    Email[] staff3Emails = {staff3Email};
    String staff3EmailJson = objectMapper.writeValueAsString(staff3Emails);
    stubFor(get(urlEqualTo("/1/members/4/emails"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staff3EmailJson)
        .withStatus(200)));
    
    CourseStaffMemberRole teacherRole = new CourseStaffMemberRole((long) 1, "Opettaja");
    CourseStaffMemberRole tutorRole = new CourseStaffMemberRole((long) 2, "Tutor");
    CourseStaffMemberRole vRole = new CourseStaffMemberRole((long) 3, "Vastuuhenkilö");
    CourseStaffMemberRole[] cRoleArray = {teacherRole, tutorRole, vRole};
    String cRoleJson = objectMapper.writeValueAsString(cRoleArray);
    stubFor(get(urlEqualTo("/1/courses/staffMemberRoles"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(cRoleJson)
        .withStatus(204)));

    stubFor(get(urlEqualTo("/1/courses/courses/1/students?filterArchived=false"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(studentArrayJson)
        .withStatus(200)));

    stubFor(get(urlEqualTo("/1/courses/courses/1/staffMembers"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffArrayJson)
        .withStatus(200)));
  }
  
  public static void workspace1PyramusMock() throws JsonProcessingException {
      DateTime created = new DateTime(1990, 2, 2, 0, 0, 0, 0);
      DateTime begin = new DateTime(2000, 1, 1, 0, 0, 0, 0);
      DateTime end = new DateTime(2050, 1, 1, 0, 0, 0, 0);
      Course course = new Course((long) 1, "testCourse", created, created, "test course for testing", false, 1, 
        (long) 25, begin, end, "test extension", (double) 15, (double) 45,
        (double) 15, (double) 45, (double) 45, end, (long) 1,
        (long) 1, (long) 1, (double) 45, (long) 1, (long) 1, (long) 1, (long) 1, 
        null, null);
      ObjectMapper objectMapper = new ObjectMapper().registerModule(new JodaModule()).enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
      String courseJson = objectMapper.writeValueAsString(course);
      
      stubFor(get(urlEqualTo("/1/courses/courses/1"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(courseJson)
          .withStatus(200)));
      
      Course[] courseArray = { course };
      String courseArrayJson = objectMapper.writeValueAsString(courseArray);
      stubFor(get(urlEqualTo("/1/courses/courses"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(courseArrayJson)
          .withStatus(200)));
      
      Subject subject = new Subject((long) 1, "tc_11", "Test course", (long) 1, false);
      String subjectJson = objectMapper.writeValueAsString(subject);
      stubFor(get(urlMatching("/1/common/subjects/.*"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(subjectJson)
          .withStatus(200)));
      
      Subject[] subjectArray = { subject };
      String subjectArrayJson = objectMapper.writeValueAsString(subjectArray);
      stubFor(get(urlMatching("/1/common/subjects"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(subjectArrayJson)
          .withStatus(200)));
      
      fi.pyramus.rest.model.CourseType courseType = new fi.pyramus.rest.model.CourseType((long) 1, "Nonstop", false);
      CourseType[] courseTypeArray = { courseType };
      String courseTypeJson = objectMapper.writeValueAsString(courseTypeArray);
      stubFor(get(urlEqualTo("/1/courses/courseTypes"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(courseTypeJson)
          .withStatus(200)));
  
      String courseTypeSingleJson = objectMapper.writeValueAsString(courseType);
      stubFor(get(urlEqualTo("/1/courses/courseTypes/1"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(courseTypeSingleJson)
          .withStatus(200)));
  
      EducationType educationType = new EducationType((long) 1, "testEduType", "ET", false);
      String educationTypeJson = objectMapper.writeValueAsString(educationType);
      stubFor(get(urlEqualTo("/1/common/educationTypes/1"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(educationTypeJson)
          .withStatus(200)));
      
      EducationType[] educationTypeArray = { educationType };
      String educationTypeArrayJson = objectMapper.writeValueAsString(educationTypeArray);
      stubFor(get(urlEqualTo("/1/common/educationTypes"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(educationTypeArrayJson)
          .withStatus(200)));
      
      EducationalTimeUnit educationalTimeUnit = new EducationalTimeUnit((long) 1, "test time unit", "h", (double) 1, false);
      String eduTimeUnitJson = objectMapper.writeValueAsString(educationalTimeUnit);
      stubFor(get(urlEqualTo("/1/common/educationalTimeUnits/1"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(eduTimeUnitJson)
          .withStatus(200)));
      
      EducationalTimeUnit[] eduTimeUnitArray = { educationalTimeUnit };
      String eduTimeUnitArrayJson = objectMapper.writeValueAsString(eduTimeUnitArray);
      stubFor(get(urlEqualTo("/1/common/educationalTimeUnits"))
        .willReturn(aResponse()
          .withHeader("Content-Type", "application/json")
          .withBody(eduTimeUnitArrayJson)
          .withStatus(200)));
      
    }
  
  public static void adminPyramusMocks() throws JsonProcessingException {
    ObjectMapper objectMapper = new ObjectMapper().registerModule(new JodaModule()).enable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);    
    Map<String, String> variables = null;
    List<String> tags = null;
//    Student student = new Student((long) 1, (long) 1, "Test", "User", null, null, null, null, null, null, null, null, null, null, null, (long) 1, null, null,
//      false, null, null, null, null, variables, tags, false);
//    String studentJson = objectMapper.writeValueAsString(student);
//    
//    stubFor(get(urlEqualTo("/1/students/students2"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(studentJson)
//        .withStatus(200)));
//
//    Email email = new Email((long) 1, (long) 2, true, "testuser@made.up");
//    String emailJson = objectMapper.writeValueAsString(email);
//    stubFor(get(urlEqualTo("/1/students/students/1/emails"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(emailJson).withStatus(200)));
//
//    Student[] studentArray = { student };
//    String studentArrayJson = objectMapper.writeValueAsString(studentArray);
//    stubFor(get(urlEqualTo("/1/students/students?email=testuser@made.up"))
//    // .withQueryParam("email", matching(".*"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(studentArrayJson)
//        .withStatus(200)));

    DateTime birthday = new DateTime(1990, 2, 2, 0, 0, 0, 0);

    Person person = new Person((long) 1, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 1);
    String personJson = objectMapper.writeValueAsString(person);
    stubFor(get(urlEqualTo("/1/persons/persons/1"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(personJson)
        .withStatus(200)));

//    Person staff1 = new Person((long) 2, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 2);
//    String staff1Json = objectMapper.writeValueAsString(staff1);
//    stubFor(get(urlEqualTo("/1/persons/persons/2"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(staff1Json)
//        .withStatus(200)));
//
//    Person staff2 = new Person((long) 3, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 3);
//    String staff2Json = objectMapper.writeValueAsString(staff2);
//    stubFor(get(urlEqualTo("/1/persons/persons/3"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(staff2Json)
//        .withStatus(200)));
//    
//    Person staff3 = new Person((long) 4, birthday, "345345-3453", fi.pyramus.rest.model.Sex.MALE, false, "empty", (long) 4);
//    String staff3Json = objectMapper.writeValueAsString(staff3);
//    stubFor(get(urlEqualTo("/1/persons/persons/4"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(staff3Json)
//        .withStatus(200)));
    
    Person[] personArray = {person};
    String personArrayJson = objectMapper.writeValueAsString(personArray);
    stubFor(get(urlEqualTo("/1/persons/persons?filterArchived=false"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(personArrayJson)
        .withStatus(200)));
    
//    stubFor(get(urlEqualTo("/1/students/students?filterArchived=false&firstResult=0&maxResults=100"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(studentArrayJson)
//        .withStatus(200)));

    StaffMember staffMember1 = new StaffMember((long) 1, (long) 1, null, "Test", "Staff1member", null, fi.pyramus.rest.model.UserRole.ADMINISTRATOR, tags, variables);
    String staffMemberJson = objectMapper.writeValueAsString(staffMember1);
    stubFor(get(urlMatching("/1/staff/members/1"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffMemberJson)
        .withStatus(200)));
    
//    StaffMember staffMember2 = new StaffMember((long) 3, (long) 3, null, "Test", "Staff2member", null, fi.pyramus.rest.model.UserRole.ADMINISTRATOR, tags, variables);
//    staffMemberJson = objectMapper.writeValueAsString(staffMember2);
//    stubFor(get(urlMatching("/1/staff/members/3"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(staffMemberJson)
//        .withStatus(200)));
//    
//    StaffMember staffMember3 = new StaffMember((long) 4, (long) 4, null, "Test", "Staff3member", null, fi.pyramus.rest.model.UserRole.ADMINISTRATOR, tags, variables);
//    staffMemberJson = objectMapper.writeValueAsString(staffMember3);
//    stubFor(get(urlMatching("/1/staff/members/4"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(staffMemberJson)
//        .withStatus(200)));
    
    StaffMember[] staffArray = { staffMember1 };
    String staffArrayJson = objectMapper.writeValueAsString(staffArray);

    stubFor(get(urlMatching("/1/staff/members"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffArrayJson)
        .withStatus(200)));
    
//    Email staff1Email = new Email((long) 2, (long) 1, true, "teacher@made.up");
//    Email[] staff1Emails = {staff1Email};
//    String staff1EmailJson = objectMapper.writeValueAsString(staff1Emails);
//    stubFor(get(urlMatching("/1/members/2/emails"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(staff1EmailJson)
//        .withStatus(200)));
//
//    Email staff2Email = new Email((long) 3, (long) 1, true, "mana@made.up");
//    Email[] staff2Emails = {staff2Email};
//    String staff2EmailJson = objectMapper.writeValueAsString(staff2Emails);
//    stubFor(get(urlMatching("/1/members/3/emails"))
//      .willReturn(aResponse()
//        .withHeader("Content-Type", "application/json")
//        .withBody(staff2EmailJson)
//        .withStatus(200)));

    Email staff3Email = new Email((long) 1, (long) 1, true, "admin@made.up");
    Email[] staff3Emails = {staff3Email};
    String staff3EmailJson = objectMapper.writeValueAsString(staff3Emails);
    stubFor(get(urlMatching("/1/members/1/emails"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staff3EmailJson)
        .withStatus(200)));
    
    CourseStaffMemberRole teacherRole = new CourseStaffMemberRole((long) 1, "Opettaja");
    CourseStaffMemberRole tutorRole = new CourseStaffMemberRole((long) 2, "Tutor");
    CourseStaffMemberRole vRole = new CourseStaffMemberRole((long) 3, "Vastuuhenkilö");
    CourseStaffMemberRole[] cRoleArray = {teacherRole, tutorRole, vRole};
    String cRoleJson = objectMapper.writeValueAsString(cRoleArray);
    stubFor(get(urlMatching("/1/courses/staffMemberRoles"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(cRoleJson)
        .withStatus(204)));

    stubFor(get(urlMatching("/1/courses/courses/.*/students?filterArchived=false"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody("")
        .withStatus(204)));

    stubFor(get(urlMatching("/1/courses/courses/.*/staffMembers"))
      .willReturn(aResponse()
        .withHeader("Content-Type", "application/json")
        .withBody(staffArrayJson)
        .withStatus(204)));
  }
  
}