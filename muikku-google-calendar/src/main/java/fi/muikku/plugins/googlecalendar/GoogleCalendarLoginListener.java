package fi.muikku.plugins.googlecalendar;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.ejb.Stateless;
import javax.enterprise.event.Observes;
import javax.inject.Inject;

import fi.muikku.calendar.Calendar;
import fi.muikku.calendar.CalendarServiceException;
import fi.muikku.events.LoginEvent;
import fi.muikku.model.users.UserEntity;
import fi.muikku.plugins.calendar.CalendarController;
import fi.muikku.plugins.calendar.model.UserCalendar;
import fi.muikku.users.UserEmailEntityController;
import fi.muikku.users.UserEntityController;

@Stateless
public class GoogleCalendarLoginListener {
  
  // TODO: Localize
  private static final String CALENDAR_SUMMARY = "Muikku";
  private static final String CALENDAR_DESCRIPTION = "Muikku";
  
  @Inject
  private Logger logger;
  
  @Inject
  private UserEntityController userEntityController;
  
  @Inject
  private UserEmailEntityController userEmailEntityController;

  @Inject
  private CalendarController calendarController;

  @Inject
  private GoogleCalendarClient googleCalendarClient;

  public void onLogin(@Observes LoginEvent event) {
    UserEntity userEntity = userEntityController.findUserEntityById(event.getUserEntityId());
    if (userEntity != null) {
      UserCalendar userCalendar = calendarController.findUserCalendarByUserAndProvider(userEntity, "google");
      if (userCalendar == null) {
        logger.info("User does not have a calendar, creating one");
        Calendar calendar = null;
        try {
          userCalendar = calendarController.createCalendar(userEntity, "google", CALENDAR_SUMMARY, CALENDAR_DESCRIPTION, Boolean.TRUE);
          calendar = calendarController.loadCalendar(userCalendar);

          for (String email : userEmailEntityController.listAddressesByUserEntity(userEntity)) {
            try {
              logger.info(String.format("Sharing Google calendar with %s", email));
              googleCalendarClient.insertCalendarUserAclRule(calendar.getId(), email, "owner");
            } catch (CalendarServiceException e) {
              logger.log(Level.WARNING, String.format("Could not share calendar with %s", email), e);
            }
          }
        } catch (CalendarServiceException e) {
          logger.log(Level.SEVERE, "Failed to create new Google calendar", e);
        }
      }
    }
    
  }
  
}