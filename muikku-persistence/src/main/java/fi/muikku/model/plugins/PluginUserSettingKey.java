package fi.muikku.model.plugins;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.NotEmpty;

@Entity
public class PluginUserSettingKey {

  /**
   * Returns internal unique id
   * 
   * @return Internal unique id
   */
  public Long getId() {
    return id;
  }

  public String getPlugin() {
		return plugin;
	}
  
  public void setPlugin(String plugin) {
		this.plugin = plugin;
	}
  
  public String getName() {
		return name;
	}
  
  public void setName(String name) {
		this.name = name;
	}

  @Id
  @GeneratedValue (strategy = GenerationType.IDENTITY)
  private Long id;
  
  @Column (nullable = false)
  @NotNull
  @NotEmpty
  private String plugin;
  
  @Column (nullable = false)
  @NotNull
  @NotEmpty
  private String name;
}
