package fi.muikku.plugins.materialfields;

import java.util.Arrays;
import java.util.List;

import fi.muikku.plugin.PersistencePluginDescriptor;
import fi.muikku.plugin.PluginDescriptor;
import fi.muikku.plugins.materialfields.dao.QueryConnectFieldCounterpartDAO;
import fi.muikku.plugins.materialfields.dao.QueryConnectFieldDAO;
import fi.muikku.plugins.materialfields.dao.QueryConnectFieldTermDAO;
import fi.muikku.plugins.materialfields.dao.QueryDrawFieldDAO;
import fi.muikku.plugins.materialfields.dao.QueryFieldDAO;
import fi.muikku.plugins.materialfields.dao.QuerySelectFieldDAO;
import fi.muikku.plugins.materialfields.dao.QueryTextFieldDAO;
import fi.muikku.plugins.materialfields.dao.QuerySelectFieldOptionDAO;
import fi.muikku.plugins.materialfields.model.QueryConnectField;
import fi.muikku.plugins.materialfields.model.QueryConnectFieldCounterpart;
import fi.muikku.plugins.materialfields.model.QueryConnectFieldOption;
import fi.muikku.plugins.materialfields.model.QueryConnectFieldTerm;
import fi.muikku.plugins.materialfields.model.QueryDrawField;
import fi.muikku.plugins.materialfields.model.QueryField;
import fi.muikku.plugins.materialfields.model.QuerySelectField;
import fi.muikku.plugins.materialfields.model.QueryTextField;
import fi.muikku.plugins.materialfields.model.QuerySelectFieldOption;

public class MaterialHtmlFieldPluginDescriptor implements PluginDescriptor, PersistencePluginDescriptor {

  @Override
  public String getName() {
    return "materialhtmlfield";
  }

  @Override
  public void init() {
    
  }

  @Override
  public List<Class<?>> getBeans() {
    return Arrays.asList(new Class<?>[] {
        
      HtmlMaterialFieldListeners.class,
      
      /** DAOs **/
      
      QueryFieldDAO.class,
      QueryDrawFieldDAO.class,
      QuerySelectFieldDAO.class,
      QueryTextFieldDAO.class,
      QuerySelectFieldOptionDAO.class,
      QueryConnectFieldDAO.class,
      QueryConnectFieldTermDAO.class,
      QueryConnectFieldCounterpartDAO.class
      
    });
  }

  @Override
  public Class<?>[] getEntities() {
    return new Class<?>[] {
        QueryDrawField.class,
        QueryTextField.class,
        QueryField.class,
        QuerySelectField.class,
        QuerySelectFieldOption.class,
        QueryConnectField.class,
        QueryConnectFieldOption.class,
        QueryConnectFieldTerm.class,
        QueryConnectFieldCounterpart.class,
    };
  }
}
