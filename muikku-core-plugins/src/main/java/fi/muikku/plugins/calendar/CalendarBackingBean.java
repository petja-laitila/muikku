package fi.muikku.plugins.calendar;

import javax.ejb.Stateful;
import javax.enterprise.context.RequestScoped;
import javax.inject.Named;

import org.ocpsoft.rewrite.annotation.Join;
import org.ocpsoft.rewrite.annotation.RequestAction;

import fi.muikku.security.LoggedIn;

@Named
@Stateful
@RequestScoped
@Join(path = "/calendar", to = "/calendars/index.jsf")
@LoggedIn
public class CalendarBackingBean {
	
	@RequestAction
	public String init() {
    return null;
	}
}

