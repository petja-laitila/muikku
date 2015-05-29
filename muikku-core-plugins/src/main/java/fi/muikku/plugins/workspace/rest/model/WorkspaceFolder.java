package fi.muikku.plugins.workspace.rest.model;

public class WorkspaceFolder {

  public WorkspaceFolder() {
  }

  public WorkspaceFolder(Long id, Long parentId, Long nextSiblingId, Boolean hidden, String title) {
    super();
    this.id = id;
    this.parentId = parentId;
    this.nextSiblingId = nextSiblingId;
    this.hidden = hidden;
    this.title = title;
  }
  
  public Long getId() {
    return id;
  }
  
  public void setId(Long id) {
    this.id = id;
  }

  public Long getParentId() {
    return parentId;
  }

  public void setParentId(Long parentId) {
    this.parentId = parentId;
  }

  public Long getNextSiblingId() {
    return nextSiblingId;
  }
  
  public void setNextSiblingId(Long nextSiblingId) {
    this.nextSiblingId = nextSiblingId;
  }
  
  public Boolean getHidden() {
    return hidden;
  }

  public void setHidden(Boolean hidden) {
    this.hidden = hidden;
  }
  
  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  private Long id;
  private Long parentId;
  private Long nextSiblingId;
  private Boolean hidden;
  private String title;
}