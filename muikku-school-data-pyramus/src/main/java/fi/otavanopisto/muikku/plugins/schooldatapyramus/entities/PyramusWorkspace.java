package fi.otavanopisto.muikku.plugins.schooldatapyramus.entities;

import java.util.Date;

import org.joda.time.DateTime;

import fi.otavanopisto.muikku.plugins.schooldatapyramus.SchoolDataPyramusPluginDescriptor;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;
import fi.otavanopisto.muikku.schooldata.entity.AbstractWorkspace;

public class PyramusWorkspace extends AbstractWorkspace {
  
  public PyramusWorkspace() {
    super();
  }

  public PyramusWorkspace(String identifier, String name, String nameExtension, String viewLink,
      SchoolDataIdentifier workspaceTypeId, String courseIdentifierIdentifier, String description,
      String subjectIdentifier, String educationTypeIdentifier, Date modified, Double length,
      String lengthUnitIdentifier, DateTime beginDate, DateTime endDate, boolean archived,
      boolean evaluationFeeApplicable) {
    super(identifier, name, nameExtension, viewLink, workspaceTypeId, courseIdentifierIdentifier, description,
        subjectIdentifier, educationTypeIdentifier, modified, length, lengthUnitIdentifier, beginDate, endDate, archived,
        evaluationFeeApplicable);
  }

  @Override
  public String getSchoolDataSource() {
    return SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE;
  }
}