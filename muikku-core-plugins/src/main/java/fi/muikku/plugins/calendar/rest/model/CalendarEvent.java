package fi.muikku.plugins.calendar.rest.model;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.TimeZone;

import fi.muikku.calendar.CalendarEventStatus;

public class CalendarEvent {

  public CalendarEvent(Long calendarId, String summary, String description, CalendarEventStatus status, Date start, TimeZone startTimeZone, Date end,
      TimeZone endTimeZone, Date created, Date updated, Map<String, String> extendedProperties, List<CalendarEventAttendee> attendees,
      List<CalendarEventReminder> reminders) {
    this.calendarId = calendarId;
    this.summary = summary;
    this.description = description;
    this.status = status;
    this.start = start;
    this.startTimeZone = startTimeZone;
    this.end = end;
    this.endTimeZone = endTimeZone;
    this.created = created;
    this.updated = updated;
    this.extendedProperties = extendedProperties;
    this.attendees = attendees;
    this.reminders = reminders;
  }

  public Long getCalendarId() {
    return calendarId;
  }

  public void setCalendarId(Long calendarId) {
    this.calendarId = calendarId;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public CalendarEventStatus getStatus() {
    return status;
  }

  public void setStatus(CalendarEventStatus status) {
    this.status = status;
  }

  public Date getStart() {
    return start;
  }

  public void setStart(Date start) {
    this.start = start;
  }

  public TimeZone getStartTimeZone() {
    return startTimeZone;
  }

  public void setStartTimeZone(TimeZone startTimeZone) {
    this.startTimeZone = startTimeZone;
  }

  public Date getEnd() {
    return end;
  }

  public void setEnd(Date end) {
    this.end = end;
  }

  public TimeZone getEndTimeZone() {
    return endTimeZone;
  }

  public void setEndTimeZone(TimeZone endTimeZone) {
    this.endTimeZone = endTimeZone;
  }

  public Date getCreated() {
    return created;
  }

  public void setCreated(Date created) {
    this.created = created;
  }

  public Date getUpdated() {
    return updated;
  }

  public void setUpdated(Date updated) {
    this.updated = updated;
  }

  public Map<String, String> getExtendedProperties() {
    return extendedProperties;
  }

  public void setExtendedProperties(Map<String, String> extendedProperties) {
    this.extendedProperties = extendedProperties;
  }

  public List<CalendarEventAttendee> getAttendees() {
    return attendees;
  }

  public void setAttendees(List<CalendarEventAttendee> attendees) {
    this.attendees = attendees;
  }

  public List<CalendarEventReminder> getReminders() {
    return reminders;
  }

  public void setReminders(List<CalendarEventReminder> reminders) {
    this.reminders = reminders;
  }

  private Long calendarId;
  private String summary;
  private String description;
  private CalendarEventStatus status;
  private Date start;
  private TimeZone startTimeZone;
  private Date end;
  private TimeZone endTimeZone;
  private Date created;
  private Date updated;
  private Map<String, String> extendedProperties;
  private List<CalendarEventAttendee> attendees;
  private List<CalendarEventReminder> reminders;
  // TODO: recurrence
}