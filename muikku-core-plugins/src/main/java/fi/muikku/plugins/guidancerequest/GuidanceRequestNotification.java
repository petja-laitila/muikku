package fi.muikku.plugins.guidancerequest;

import java.text.MessageFormat;

import javax.enterprise.inject.Default;
import javax.inject.Inject;

import fi.muikku.i18n.LocaleController;
import fi.muikku.model.users.UserEntity;
import fi.muikku.notifier.NotifierAction;
import fi.muikku.notifier.NotifierContext;
import fi.muikku.plugins.notifier.email.NotifierEmailContent;
import fi.muikku.plugins.notifier.email.NotifierEmailMessageComposer;
import fi.muikku.schooldata.UserController;
import fi.muikku.schooldata.entity.User;
import fi.muikku.session.SessionController;

@Default
@NotifierEmailContent(GuidanceRequestNotification.NAME)
public class GuidanceRequestNotification implements NotifierAction, NotifierEmailMessageComposer {

  public static final String NAME = "guidancerequest-new";
  
  @Inject
  private SessionController sessionController;
  
  @Inject
  private LocaleController localeController;

  @Inject
  private UserController userController;
  
  @Override
  public String getEmailSubject(NotifierContext context) {
    GuidanceRequest guidanceRequest = getGuidanceRequest(context);
    UserEntity student = userController.findUserEntityById(guidanceRequest.getStudent());
    User user = userController.findUser(student);
    String userName = user.getFirstName() + " " + user.getLastName();
    
    String caption = localeController.getText(sessionController.getLocale(), "plugin.guidancerequest.newGuidanceRequest.mail.subject");

    return MessageFormat.format(caption, userName);
  }

  @Override
  public String getEmailContent(NotifierContext context) {
    GuidanceRequest guidanceRequest = getGuidanceRequest(context);
    UserEntity student = userController.findUserEntityById(guidanceRequest.getStudent());
    User user = userController.findUser(student);
    String userName = user.getFirstName() + " " + user.getLastName();
    
    String content = localeController.getText(sessionController.getLocale(), "plugin.guidancerequest.newGuidanceRequest.mail.content");
    
    return MessageFormat.format(content, userName, guidanceRequest.getMessage());
  }

  private GuidanceRequest getGuidanceRequest(NotifierContext context) {
    return (GuidanceRequest) context.getParameter("guidanceRequest");
  }
  
  @Override
  public String getName() {
    return NAME;
  }

  @Override
  public String getDisplayName() {
    return "Ohjauspyyntö - uusi ohjauspyyntö";
  }

}