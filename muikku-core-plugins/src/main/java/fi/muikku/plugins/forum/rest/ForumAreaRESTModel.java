package fi.muikku.plugins.forum.rest;


public class ForumAreaRESTModel {

  public ForumAreaRESTModel() {
    
  }
  
  public ForumAreaRESTModel(Long id, String name) {
    this.id = id;
    this.name = name;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  private Long id;

  private String name;

}