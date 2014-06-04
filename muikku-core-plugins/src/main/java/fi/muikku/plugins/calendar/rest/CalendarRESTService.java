package fi.muikku.plugins.calendar.rest;

import java.util.ArrayList;
import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Response;

import fi.muikku.calendar.CalendarServiceException;
import fi.muikku.plugin.PluginRESTService;
import fi.muikku.plugins.calendar.CalendarController;
import fi.muikku.plugins.calendar.model.UserCalendar;
import fi.muikku.plugins.calendar.rest.model.Calendar;
import fi.muikku.plugins.calendar.rest.model.CalendarEvent;
import fi.muikku.security.LoggedIn;
import fi.muikku.session.SessionController;

@RequestScoped
@Path ("/calendar")
@Produces ("application/json")
public class CalendarRESTService extends PluginRESTService {

	@Inject
	private CalendarController calendarController;

  @Inject
	private SessionController sessionController;
	
	@POST
  @Path ("/calendars/")
  @LoggedIn
	public Response createCalendar(Calendar calendar) {
	  return Response.status(501).build();
	}
	
  @GET
  @Path ("/calendars/")
  @LoggedIn
  public Response listCalendars() {
    List<Calendar> result = new ArrayList<>();
    
    try {
      List<UserCalendar> userCalendars = calendarController.listUserCalendars(sessionController.getUser());
      for (UserCalendar userCalendar : userCalendars) {
        fi.muikku.calendar.Calendar calendar = calendarController.loadCalendar(userCalendar);
        result.add(new Calendar(
          userCalendar.getId(), 
          calendar.getSummary(), 
          calendar.getDescription())
        );
      }      
    } catch (CalendarServiceException e) {
      e.printStackTrace();
      return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(e.getMessage()).build();
    }
    
    return Response.ok(result).build();
  }
  
  @PUT
  @Path ("/calendars/{CALID}")
  @LoggedIn
  public Response updateCalendar(@PathParam ("CALID") Long calendarId, Calendar calendar) {
    return Response.status(501).build();
  }
  
  @DELETE
  @Path ("/calendars/{CALID}")
  @LoggedIn
  public Response deleteCalendar(@PathParam ("CALID") Long calendarId, Calendar calendar) {
    return Response.status(501).build();
  }
  
  @POST
  @Path ("/calendars/{CALID}/events/")
  @LoggedIn
  public Response createEvent(@PathParam ("CALID") Long calendarId, CalendarEvent event) {
    return Response.status(501).build();
  }
  
  @GET
  @Path ("/calendars/{CALID}/events/")
  @LoggedIn
  public Response getEvents(@PathParam ("CALID") Long calendarId) {
    return Response.status(501).build();
  }
  
  @GET
  @Path ("/calendars/{CALID}/events/{EVTID}")
  @LoggedIn
  public Response getEvent(@PathParam ("CALID") Long calendarId, @PathParam ("EVTID") Long eventId) {
    return Response.status(501).build();
  }
  
  @PUT
  @Path ("/calendars/{CALID}/events/{EVTID}")
  @LoggedIn
  public Response getEvent(@PathParam ("CALID") Long calendarId, @PathParam ("EVTID") Long eventId, CalendarEvent event) {
    return Response.status(501).build();
  }
  
  @DELETE
  @Path ("/calendars/{CALID}/events/{EVTID}")
  @LoggedIn
  public Response deleteEvent(@PathParam ("CALID") Long calendarId, @PathParam ("EVTID") Long eventId) {
    return Response.status(501).build();
  }
  
  
//
//  @POST
//  @Path ("/localEventTypes")
//  public Response createLocalEventType(@FormParam ("name") String name) throws SystemException {
//  	LocalEventType eventType = calendarController.createLocalEventType(name);
//
//  	TranquilityBuilder tranquilityBuilder = tranquilityBuilderFactory.createBuilder();
//    Tranquility tranquility = tranquilityBuilder.createTranquility();
//
//    return Response.ok(
//    	tranquility.entity(eventType)
//    ).build();
//  }
//
//  @GET
//  @Path ("/localEventTypes")
//  public Response listLocalEventTypes() {
//  	List<LocalEventType> eventTypes = calendarController.listLocalEventTypes();
//
//  	TranquilityBuilder tranquilityBuilder = tranquilityBuilderFactory.createBuilder();
//    Tranquility tranquility = tranquilityBuilder.createTranquility();
//
//    return Response.ok(
//    	tranquility.entities(eventTypes)
//    ).build();
//  }
//
//  @GET
//  @Path ("/settings")
//  public Response listSettings() {
//  	UserEntity user = sessionController.getUser();
//
//  	Map<String, Object> settings = new HashMap<>();
//
//  	String firstDay = pluginSettingsController.getPluginUserSetting("calendar", CalendarPluginDescriptor.DEFAULT_FIRSTDAY_SETTING, user);
//  	if (StringUtils.isBlank(firstDay)) {
//  		firstDay = pluginSettingsController.getPluginSetting("calendar", CalendarPluginDescriptor.DEFAULT_FIRSTDAY_SETTING);
//  	}
//
//  	settings.put("firstDay", firstDay);
//
//    return Response.ok(
//      settings
//    ).build();
//  }
//
//  @PUT
//  @Path ("/settings")
//  public Response updateSetting(String data) {
//  	UserEntity user = sessionController.getUser();
//
//  	JSONObject jsonData = JSONObject.fromObject(data);
//  	@SuppressWarnings("unchecked") Set<String> keys = jsonData.keySet();
//
//		for (String key : keys) {
//			switch (key) {
//				case "firstDay":
//					pluginSettingsController.setPluginUserSetting("calendar", CalendarPluginDescriptor.DEFAULT_FIRSTDAY_SETTING, jsonData.getString(key), user);
//			  break;
//				default:
//					// TODO: Proper error handling
//					throw new RuntimeException("Calendar setting " + key + " can not be updated");
//			}
//		}
//
//    return Response.ok(data).build();
//  }
//
//	private BigDecimal getBigDecimal(JSONObject jsonData, String key) {
//		Object object = jsonData.get(key);
//		if (object == null) {
//			return null;
//		}
//
//		String value = null;
//
//		if (object instanceof JSONObject) {
//			JSONObject jsonObject = (JSONObject) object;
//
//  		if (jsonObject.isNullObject()) {
//  			return null;
//  		}
//
//  		value = jsonObject.toString();
//		} else if (object instanceof String) {
//			value = (String) object;
//		}
//
//		return NumberUtils.createBigDecimal(value);
//	}
//
//  public static class CalendarVisiblityValueGetter implements ValueGetter<Boolean> {
//
//  	public CalendarVisiblityValueGetter(List<UserCalendar> userCalendars) {
//			for (UserCalendar userCalendar : userCalendars) {
//				visibilities.put(userCalendar.getCalendar().getId(), userCalendar.getVisible());
//			}
//		}
//
//  	@Override
//  	public Boolean getValue(TranquilizingContext context) {
//  		Calendar calendar = (Calendar) context.getEntityValue();
//  		return visibilities.get(calendar.getId());
//  	}
//
//  	private Map<Long, Boolean> visibilities = new HashMap<>();
//  }
}
