package fi.muikku.plugins.material;

import javax.ejb.Stateless;
import javax.enterprise.context.Dependent;
import javax.enterprise.event.Event;
import javax.inject.Inject;

import fi.muikku.plugins.material.dao.BinaryMaterialDAO;
import fi.muikku.plugins.material.events.BinaryMaterialCreateEvent;
import fi.muikku.plugins.material.model.BinaryMaterial;

@Dependent
@Stateless
public class BinaryMaterialController {

	@Inject
	private BinaryMaterialDAO binaryMaterialDAO;
  
  @Inject
  private Event<BinaryMaterialCreateEvent> materialCreated;

	public BinaryMaterial createBinaryMaterial(String title, String urlName, String contentType, byte[] content) {
	  BinaryMaterial material = binaryMaterialDAO.create(title, urlName, contentType, content);
    materialCreated.fire(new BinaryMaterialCreateEvent(material));
    return material;
	}
	
	public BinaryMaterial finBinaryMaterialById(Long id) {
		return binaryMaterialDAO.findById(id);
	}

	public BinaryMaterial findBinaryMaterialdByUrlName(String urlName) {
		return binaryMaterialDAO.findByUrlName(urlName);
	}

	public BinaryMaterial updateBinaryMaterialContent(BinaryMaterial binaryMaterial, byte[] content) {
		return binaryMaterialDAO.updateContent(binaryMaterial, content);
	}
	
}
