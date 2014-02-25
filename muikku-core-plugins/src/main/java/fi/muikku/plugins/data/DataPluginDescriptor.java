package fi.muikku.plugins.data;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.ejb.Stateful;
import javax.enterprise.context.ApplicationScoped;
import javax.enterprise.event.Observes;
import javax.inject.Inject;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.lang3.StringUtils;
import org.xml.sax.SAXException;

import fi.muikku.plugin.AfterPluginsInitEvent;
import fi.muikku.plugin.PersistencePluginDescriptor;
import fi.muikku.plugin.PluginDescriptor;
import fi.muikku.plugins.data.dao.ProcessedScriptDAO;
import fi.muikku.plugins.data.model.ProcessedScript;

@ApplicationScoped
@Stateful
public class DataPluginDescriptor implements PluginDescriptor, PersistencePluginDescriptor {
	
	@Inject
	private DataPluginController dataPluginController;
	
	@Override
	public String getName() {
		return "data";
	}
	
	@Override
	public void init() {
		
	}

	@Override
	public List<Class<?>> getBeans() {
		return new ArrayList<Class<?>>(Arrays.asList(
			/* DAOs */	
				
		  ProcessedScriptDAO.class,
				
		  /* Controllers */

		  DataPluginController.class,
		  
		  /* ScriptHandlers */
		  
		  MySQLDataPluginScriptHandler.class
		));
	}
	
	@Override
	public Class<?>[] getEntities() {
		return new Class<?>[] {
			ProcessedScript.class
		};
	}

	public void onAfterPluginsInit(@Observes AfterPluginsInitEvent event) {
		String xmlFilePaths = System.getProperty("muikku-data");
		if (StringUtils.isNotBlank(xmlFilePaths)) {
			try {
			  String[] files = xmlFilePaths.split(",");
			  for (String file : files) {
  				dataPluginController.processScripts(new File(file));
			  }
			} catch (ParserConfigurationException | SAXException | IOException e) {
				// TODO: Proper error handling
				e.printStackTrace();
				throw new RuntimeException(e);
			}
		}
	}
	
}
