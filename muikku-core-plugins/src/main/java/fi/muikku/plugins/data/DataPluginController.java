	package fi.muikku.plugins.data;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.ejb.Stateful;
import javax.enterprise.context.Dependent;
import javax.enterprise.inject.Any;
import javax.enterprise.inject.Instance;
import javax.inject.Inject;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.apache.commons.lang3.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import fi.muikku.dao.DAO;
import fi.muikku.plugins.data.dao.ProcessedScriptDAO;

@Dependent
@Stateful
public class DataPluginController {
	
	@Inject
	@Any
	private Instance<DataPluginScriptHandler> scriptHandlers;  
	
	@Inject
	@DAO
	private ProcessedScriptDAO processedScriptDAO;
	
	public void processScripts(File file) throws ParserConfigurationException, SAXException, IOException {
		List<ScriptInfo> scriptInfos = new ArrayList<>();
		
	  DocumentBuilderFactory documentBuilderFactory = DocumentBuilderFactory.newInstance();
	  DocumentBuilder documentBuilder = documentBuilderFactory.newDocumentBuilder();
		Document document = documentBuilder.parse(file);
		
		NodeList documentElementChildNodes = document.getDocumentElement().getChildNodes();
		for (int i = 0, l = documentElementChildNodes.getLength(); i < l; i++) {
			Node item = documentElementChildNodes.item(i);
			if (item instanceof Element) {
			  Element script = (Element) item;
			  if ("script".equals(script.getTagName())) {
	  			Run run = null;
	  			String url = null;
	  			String handler = null;
	  			Map<String, String> parameters = new HashMap<String, String>();

	  			NodeList scriptChildNodes = script.getChildNodes();
			  	for (int j= 0, jl = scriptChildNodes.getLength(); j< jl; j++) {
			  		Node scriptChildItem = scriptChildNodes.item(j);
			  		if (scriptChildItem instanceof Element) {
			  			Element scriptChildElement = (Element) scriptChildItem;
			  			
			  			switch (scriptChildElement.getTagName()) {
				  			case "run":
				  				run = Run.valueOf(scriptChildElement.getTextContent());
				  		  break;
				  			case "url":
				  				url = scriptChildElement.getTextContent();
				  			break;				  			
				  			case "handler":
				  				handler = scriptChildElement.getTextContent();
					  		break;
				  			case "parameter":
				  				String name = scriptChildElement.getAttribute("name");
				  				String value = scriptChildElement.getTextContent();
				  				
				  				if (StringUtils.isBlank(name)) {
				  					// TODO: Proper error handling
				  					throw new RuntimeException("parameter element requires a name");
				  				}
				  				
				  				parameters.put(name, value);
				  			break;
				  		}
			  		}
			  	}

	  			if (run != null && StringUtils.isNotBlank(url) && StringUtils.isNotBlank(handler)) {
	  				scriptInfos.add(new ScriptInfo(url, run, handler, parameters));
	  			} else {
	  				// TODO: Proper error handling
				  	throw new RuntimeException("Malformed 'script' element either run, url or handler element is missing");
	  			}
	  			
			  } else {
					// TODO: Proper error handling
			  	throw new RuntimeException("Expected 'script' element but found " + script.getTagName());
			  }
			}
		}
		
		for (ScriptInfo scriptInfo : scriptInfos) {
			switch (scriptInfo.getRun()) {
				case ALWAYS:
					runScript(scriptInfo);
				break;
				case ONCE:
					if (processedScriptDAO.findByUrl(scriptInfo.getUrl()) == null) {
						runScript(scriptInfo);
						processedScriptDAO.create(scriptInfo.getUrl());
					}
				break;
			}
		}
	}
	
	private void runScript(ScriptInfo scriptInfo) {
		DataPluginScriptHandler scriptHandler = getHandler(scriptInfo.getHandler());
		if (scriptHandler == null) {
			// TODO: Proper error handling
			throw new RuntimeException("Could not find script handler '" + scriptInfo.getHandler() + "'");
		}
		
		scriptHandler.executeScript(scriptInfo.getUrl(), scriptInfo.getParameters());
	}
	
	private DataPluginScriptHandler getHandler(String name) {
		Iterator<DataPluginScriptHandler> handlers = scriptHandlers.iterator();
		while (handlers.hasNext()) {
			DataPluginScriptHandler handler = handlers.next();
			if (handler.getName().equals(name))
				return handler;
		}
		
		return null;
	}

	private enum Run {
		ONCE,
		ALWAYS
	}
	
	private class ScriptInfo {
		
		public ScriptInfo(String url, Run run, String handler, Map<String, String> parameters) {
			this.url = url;
			this.run = run;
			this.handler = handler;
			this.parameters = parameters;
		}
		
		public Map<String, String> getParameters() {
			return parameters;
		}
		
		public String getHandler() {
			return handler;
		}
		
		public Run getRun() {
			return run;
		}
		
		public String getUrl() {
			return url;
		}
		
		private Run run;
		private String url;
		private String handler;
		private Map<String, String> parameters;
	} 
	
}
