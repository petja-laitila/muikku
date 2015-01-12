package fi.muikku.plugins.schooldatapyramus;

import java.util.ArrayList;
import java.util.List;

import javax.inject.Inject;

import org.apache.commons.lang3.math.NumberUtils;

import fi.muikku.plugins.schooldatapyramus.entities.PyramusGradingScale;
import fi.muikku.plugins.schooldatapyramus.entities.PyramusGradingScaleItem;
import fi.muikku.plugins.schooldatapyramus.rest.UserPyramusClient;
import fi.muikku.schooldata.GradingSchoolDataBridge;
import fi.muikku.schooldata.SchoolDataBridgeRequestException;
import fi.muikku.schooldata.UnexpectedSchoolDataBridgeException;
import fi.muikku.schooldata.entity.GradingScale;
import fi.muikku.schooldata.entity.GradingScaleItem;
import fi.pyramus.rest.model.Grade;

public class PyramusGradingSchoolDataBridge implements GradingSchoolDataBridge {

  @Inject
  private UserPyramusClient pyramusClient;
  
  @Override
  public String getSchoolDataSource() {
    return SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE;
  }

	@Override
	public GradingScale findGradingScale(String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
		if (!NumberUtils.isNumber(identifier)) {
			throw new SchoolDataBridgeRequestException("Identifier has to be numeric");
		}

    return createGradingScaleEntity(pyramusClient.get("/common/gradingScales/" + identifier, fi.pyramus.rest.model.GradingScale.class));
	}

	@Override
	public List<GradingScale> listGradingScales() throws UnexpectedSchoolDataBridgeException {
	  fi.pyramus.rest.model.GradingScale[] gradingScales = pyramusClient.get("/common/gradingScales/", fi.pyramus.rest.model.GradingScale[].class);
    if (gradingScales == null) {
      throw new UnexpectedSchoolDataBridgeException("Null response");
    }
    
    return createGradingScaleEntities(gradingScales);
	}

	@Override
	public GradingScaleItem findGradingScaleItem(String gradingScaleIdentifier, String identifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {
		if (!NumberUtils.isNumber(identifier) || !NumberUtils.isNumber(gradingScaleIdentifier)) {
			throw new SchoolDataBridgeRequestException("Identifier has to be numeric");
		}

    return createGradingScaleItemEntity(pyramusClient.get("/common/gradingScales/" + gradingScaleIdentifier + "/grades/" + identifier, fi.pyramus.rest.model.Grade.class));
	}

	@Override
	public List<GradingScaleItem> listGradingScaleItems(String gradingScaleIdentifier) throws SchoolDataBridgeRequestException, UnexpectedSchoolDataBridgeException {

    Grade[] grades = pyramusClient.get("/gradingScales/" + gradingScaleIdentifier + "/grades/", Grade[].class);
    if (grades == null) {
      throw new UnexpectedSchoolDataBridgeException("Null response");
    }
    
    return createGradingScaleItemEntities(grades);
	}

  private GradingScaleItem createGradingScaleItemEntity(Grade grade) {
    if (grade == null) {
      return null;
    }
    
    return new PyramusGradingScaleItem(grade.getId().toString(), grade.getGradingScaleId().toString(), grade.getName());
  }

  private List<GradingScaleItem> createGradingScaleItemEntities(Grade[] grades) {
    List<GradingScaleItem> result = new ArrayList<>();

    for (Grade g : grades)
      result.add(createGradingScaleItemEntity(g));
      
    return result;
  }

  private GradingScale createGradingScaleEntity(fi.pyramus.rest.model.GradingScale g) {
    if (g == null) {
      return null;
    }
    
    return new PyramusGradingScale(g.getId().toString(), g.getName());
  }

  private List<GradingScale> createGradingScaleEntities(fi.pyramus.rest.model.GradingScale[] gradingScales) {
    List<GradingScale> result = new ArrayList<>();

    for (fi.pyramus.rest.model.GradingScale g : gradingScales)
      result.add(createGradingScaleEntity(g));
      
    return result;
  }

}