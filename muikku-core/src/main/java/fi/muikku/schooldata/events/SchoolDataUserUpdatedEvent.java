package fi.muikku.schooldata.events;

import java.util.List;

public class SchoolDataUserUpdatedEvent {

  public SchoolDataUserUpdatedEvent(String dataSource, String identifier, List<String> emails) {
    super();
    this.dataSource = dataSource;
    this.identifier = identifier;
    this.emails = emails;
  }

  public String getDataSource() {
    return dataSource;
  }

  public String getIdentifier() {
    return identifier;
  }

  public List<String> getEmails() {
    return emails;
  }

  private String dataSource;
  private String identifier;
  private List<String> emails;
}