package fi.otavanopisto.muikku.plugins.worklist.rest;

import java.text.MessageFormat;
import java.util.List;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.Status;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;

import fi.otavanopisto.muikku.i18n.LocaleController;
import fi.otavanopisto.muikku.mail.MailType;
import fi.otavanopisto.muikku.mail.Mailer;
import fi.otavanopisto.muikku.schooldata.BridgeResponse;
import fi.otavanopisto.muikku.schooldata.RestCatchSchoolDataExceptions;
import fi.otavanopisto.muikku.schooldata.SchoolDataBridgeSessionController;
import fi.otavanopisto.muikku.schooldata.UserSchoolDataController;
import fi.otavanopisto.muikku.schooldata.payload.WorklistApproverRestModel;
import fi.otavanopisto.muikku.schooldata.payload.WorklistItemRestModel;
import fi.otavanopisto.muikku.schooldata.payload.WorklistItemStateChangeRestModel;
import fi.otavanopisto.muikku.schooldata.payload.WorklistItemTemplateRestModel;
import fi.otavanopisto.muikku.schooldata.payload.WorklistSummaryItemRestModel;
import fi.otavanopisto.muikku.security.MuikkuPermissions;
import fi.otavanopisto.muikku.session.SessionController;
import fi.otavanopisto.muikku.users.UserEntityController;
import fi.otavanopisto.muikku.users.UserEntityName;
import fi.otavanopisto.security.rest.RESTPermit;
import fi.otavanopisto.security.rest.RESTPermit.Handling;

@Path("/worklist")
@RequestScoped
@Stateful
@Produces ("application/json")
@RestCatchSchoolDataExceptions
public class WorklistRESTService {
  
  @Inject
  private Logger logger;

  @Inject
  private SessionController sessionController;

  @Inject
  private UserSchoolDataController userSchoolDataController;

  @Inject
  private SchoolDataBridgeSessionController schoolDataBridgeSessionController;

  @Inject
  private LocaleController localeController;

  @Inject
  private UserEntityController userEntityController;

  @Inject
  private Mailer mailer;

  /**
   * GET mApi().worklist.templates
   * 
   * Returns a list of templates from which new worklist items can be created.
   * 
   * Payload: <none>
   * 
   * Output: List of templates
   *  
   * [
   *   {id: 123,
   *    description: "Teachers' meeting",
   *    price: 25,
   *    factor: 1,
   *    editableFields: [
   *      "ENTRYDATE,"
   *      "DESCRIPTION",
   *      "PRICE",
   *      "FACTOR",
   *      "BILLING_NUMBER"
   *    ]
   *   },
   *    
   *    ...
   *  ]
   */
  @Path("/templates")
  @GET
  @RESTPermit(MuikkuPermissions.LIST_WORKLISTITEMTEMPLATES)
  public Response listWorklistItemTemplates() {
    String dataSource = sessionController.getLoggedUserSchoolDataSource();
    BridgeResponse<List<WorklistItemTemplateRestModel>> response = userSchoolDataController.listWorklistTemplates(dataSource);
    if (response.ok()) {
      return Response.status(response.getStatusCode()).entity(response.getEntity()).build();
    }
    else {
      return Response.status(response.getStatusCode()).entity(response.getMessage()).build();
    }
  }

  /**
   * POST mApi().worklist.worklistItems
   * 
   * Creates a new worklist item from the given template.
   * 
   * Payload: Worklist item with templateId and editable fields set
   * 
   * {templateId: 1
   *  entryDate: 2021-02-15
   *  description: "Something something",
   *  price: 25,
   *  factor: 2,
   *  billingNumber: 123456
   * }
   *  
   * NOTE: If trying to pass along a value for a field that is not editable according
   * to the chosen template, the template value will be used instead.
   * 
   * Output: Created worklist item 
   * 
   * {id: 123,
   *  templateId: 1,
   *  state: ENTERED|PROPOSED|APPROVED|PAID,
   *  entryDate: 2021-02-15,
   *  description: "Something something",
   *  price: 25,
   *  factor: 2,
   *  billingNumber: 123456
   *  editableFields: [
   *    "ENTRYDATE",
   *    "DESCRIPTION",
   *    "PRICE",
   *    "FACTOR",
   *    "BILLING_NUMBER"
   *  ]
   * }
   */
  @Path("/worklistItems")
  @POST
  @RESTPermit(MuikkuPermissions.CREATE_WORKLISTITEM)
  public Response createWorklistItem(WorklistItemRestModel item) {
    String dataSource = sessionController.getLoggedUserSchoolDataSource();
    BridgeResponse<WorklistItemRestModel> response = userSchoolDataController.createWorklistItem(dataSource, item);
    if (response.ok()) {
      return Response.status(response.getStatusCode()).entity(response.getEntity()).build();
    }
    else {
      return Response.status(response.getStatusCode()).entity(response.getMessage()).build();
    }
  }

  /**
   * PUT mApi().worklist.worklistItems
   * 
   * Updates an existing worklist item (entryDate, description, price, factor).
   * 
   * NOTE: If trying to pass along a value for a field that is not editable according
   * to the worklist item, the item's original value will be used instead.
   * 
   * Payload: An existing worklist item
   * 
   * Output: Updated worklist item
   * 
   * Errors:
   * 403 if trying to update a worklist item that is already approved or paid
   */
  @Path("/worklistItems")
  @PUT
  @RESTPermit(MuikkuPermissions.UPDATE_WORKLISTITEM)
  public Response updateWorklistItem(WorklistItemRestModel item) {
    String dataSource = sessionController.getLoggedUserSchoolDataSource();
    BridgeResponse<WorklistItemRestModel> response = userSchoolDataController.updateWorklistItem(dataSource, item);
    if (response.ok()) {
      return Response.status(response.getStatusCode()).entity(response.getEntity()).build();
    }
    else {
      return Response.status(response.getStatusCode()).entity(response.getMessage()).build();
    }
  }

  /**
   * DELETE mApi().worklist.worklistItems
   * 
   * Removes an existing worklist item.
   * 
   * Payload: An existing worklist item
   * 
   * Output: 204 (no content)
   * 
   * Errors:
   * 403 if trying to remove a worklist item that is already approved or paid
   */
  @Path("/worklistItems")
  @DELETE
  @RESTPermit(MuikkuPermissions.DELETE_WORKLISTITEM)
  public Response removeWorklistItem(WorklistItemRestModel item) {
    String dataSource = sessionController.getLoggedUserSchoolDataSource();
    userSchoolDataController.removeWorklistItem(dataSource, item);
    return Response.noContent().build();
  }

  /**
   * GET mApi().worklist.worklistItems
   * 
   * Returns an array of worklist items belonging to a user. Timeframe can also be specified.
   * 
   * Query parameters:
   * owner: PYRAMUS-STAFF-123
   * beginDate: 2021-02-01
   * endDate: 2021-02-28 
   * 
   * Output: List of worklist items matching the query.
   * 
   * [
   *   {id: 1,
   *    templateId: 1,
   *    state: ENTERED|PROPOSED|APPROVED|PAID,
   *    entryDate: 2021-02-15,
   *    description: "Something something",
   *    price: 25,
   *    factor: 2,
   *    billingNumber: 123456
   *    editableFields: [
   *      "ENTRYDATE",
   *      "DESCRIPTION",
   *      "PRICE",
   *      "FACTOR",
   *      "BILLING_NUMBER"
   *    ],
   *    removable: true
   *   },
   *   
   *   {id: 123,
   *    templateId: 2,
   *    state: ENTERED|PROPOSED|APPROVED|PAID,
   *    entryDate: 2021-03-01,
   *    description: "Course assessment",
   *    price: 75,
   *    factor: 1,
   *    billingNumber: 123456,
   *    courseAssessment: {
   *      courseName: "BI1 - Ihmisen biologia",
   *      studentName: "John "Joe" Doe (Nettilukio)",
   *      grade: 10,
   *      raisedGrade: true 
   *    }
   *    editableFields: [],
   *    removable: false
   *   },
   *    
   *   ...
   * ]
   */
  @Path("/worklistItems")
  @GET
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listWorklistItemsByOwnerAndTimeframe(@QueryParam("owner") String identifier, @QueryParam("beginDate") String beginDate, @QueryParam("endDate") String endDate) {
    if (!sessionController.hasEnvironmentPermission(MuikkuPermissions.LIST_WORKLISTITEMS)) {
      if (!StringUtils.equals(identifier, sessionController.getLoggedUserIdentifier())) {
        return Response.status(Status.FORBIDDEN).build();
      }
    }
    String dataSource = sessionController.getLoggedUserSchoolDataSource();
    BridgeResponse<List<WorklistItemRestModel>> response = userSchoolDataController.listWorklistItemsByOwnerAndTimeframe(dataSource, identifier, beginDate, endDate);
    if (response.ok()) {
      return Response.status(response.getStatusCode()).entity(response.getEntity()).build();
    }
    else {
      return Response.status(response.getStatusCode()).entity(response.getMessage()).build();
    }
  }

  /**
   * GET mApi().worklist.worklistSummary
   * 
   * Returns an array of monthly worklist summary items for the given user; mainly the number
   * of worklist items the user has created that month.
   * 
   * Query parameters:
   * owner: PYRAMUS-STAFF-123
   * 
   * Output: Monnthly summary items of all worklist items of the user.
   * 
   * [
   *   {displayName: March 2021,
   *    beginDate: 2021-03-01,
   *    endDate: 2021-03-31,
   *    count: 28
   *   },
   *    
   *    ...
   * ]
   */
  @Path("/worklistSummary")
  @GET
  @RESTPermit (handling = Handling.INLINE, requireLoggedIn = true)
  public Response listWorklistItemsByOwnerAndTimeframe(@QueryParam("owner") String identifier) {
    if (!sessionController.hasEnvironmentPermission(MuikkuPermissions.LIST_WORKLISTITEMS)) {
      if (!StringUtils.equals(identifier, sessionController.getLoggedUserIdentifier())) {
        return Response.status(Status.FORBIDDEN).build();
      }
    }
    String dataSource = sessionController.getLoggedUserSchoolDataSource();
    BridgeResponse<List<WorklistSummaryItemRestModel>> response = userSchoolDataController.getWorklistSummary(dataSource, identifier);
    if (response.ok()) {
      return Response.status(response.getStatusCode()).entity(response.getEntity()).build();
    }
    else {
      return Response.status(response.getStatusCode()).entity(response.getMessage()).build();
    }
  }
  
  /**
   * PUT mApi().worklist.updateWorklistItemsState
   * 
   * Updates all worklist items of the given user in the given timeframe to the given state.
   * 
   * Payload: State change payload item
   * 
   * {userIdentifier: PYRAMUS-STAFF-123,
   *  startDate: 2021-02-01,
   *  endDate: 2021-02-28,
   *  state: "PROPOSED"
   * }
   *  
   * Output: All worklist items of the timeframe, with an updated state
   */
  @PUT
  @Path("/updateWorklistItemsState")
  @RESTPermit(MuikkuPermissions.UPDATE_WORKLISTITEM)
  public Response updateWorklistItemsState(WorklistItemStateChangeRestModel stateChange) {
    
    // Do the actual update
    
    String dataSource = sessionController.getLoggedUserSchoolDataSource();
    userSchoolDataController.updateWorklistItemsState(dataSource, stateChange);
    
    // If changing state to PROPOSED, notify approvers via e-mail
    
    if (StringUtils.equals("PROPOSED", stateChange.getState())) {
      List<WorklistApproverRestModel> approvers = null;
      
      // Ask Pyramus for users marked as worklist approvers
      
      schoolDataBridgeSessionController.startSystemSession();
      try {
        BridgeResponse<List<WorklistApproverRestModel>> response = userSchoolDataController.listWorklistApprovers(dataSource);
        if (response.ok()) {
          approvers = response.getEntity();
        }
        else {
          logger.severe(String.format("Error retrieving worklist approvers: %d (%s)", response.getStatusCode(), response.getMessage()));
        }
      }
      finally {
        schoolDataBridgeSessionController.endSystemSession();
      }
      
      // If we have approvers, send the notification
      
      if (!CollectionUtils.isEmpty(approvers)) {
        List<String> approverEmails = approvers.stream().map(WorklistApproverRestModel::getEmail).collect(Collectors.toList());
        String mailSubject = localeController.getText(sessionController.getLocale(), "rest.worklist.approveMail.subject");
        String mailContent = localeController.getText(sessionController.getLocale(), "rest.worklist.approveMail.content");
        UserEntityName currentUserName = userEntityController.getName(sessionController.getLoggedUserEntity());
        mailContent = MessageFormat.format(
            mailContent,
            currentUserName.getDisplayName(),
            stateChange.getBeginDate().toString(),
            stateChange.getEndDate().toString(),
            // TODO Not the prettiest way of resolving current user's id in Pyramus but about the only one that can be used here :| 
            StringUtils.substringAfterLast(stateChange.getUserIdentifier(), "-"),
            stateChange.getBeginDate().toString(),
            stateChange.getEndDate().toString()
        );
        mailer.sendMail(MailType.HTML, approverEmails, mailSubject, mailContent);
      }
    }
    
    // Fetch and return user's all worklist items in the timeframe  
    
    BridgeResponse<List<WorklistItemRestModel>> response = userSchoolDataController.listWorklistItemsByOwnerAndTimeframe(
        dataSource,
        stateChange.getUserIdentifier(),
        stateChange.getBeginDate().toString(),
        stateChange.getEndDate().toString());
    if (response.ok()) {
      return Response.status(response.getStatusCode()).entity(response.getEntity()).build();
    }
    else {
      return Response.status(response.getStatusCode()).entity(response.getMessage()).build();
    }
  }
  
}
