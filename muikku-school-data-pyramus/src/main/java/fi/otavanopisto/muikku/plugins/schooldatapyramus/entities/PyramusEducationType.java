package fi.otavanopisto.muikku.plugins.schooldatapyramus.entities;

import fi.otavanopisto.muikku.plugins.schooldatapyramus.SchoolDataPyramusPluginDescriptor;
import fi.otavanopisto.muikku.schooldata.entity.EducationType;

public class PyramusEducationType implements EducationType {

  public PyramusEducationType(String identifier, String name) {
    this.name = name;
    this.identifier = identifier;
  }

  @Override
  public String getSchoolDataSource() {
    return SchoolDataPyramusPluginDescriptor.SCHOOL_DATA_SOURCE;
  }

  @Override
  public String getIdentifier() {
    return identifier;
  }

  @Override
  public String getName() {
    return name;
  }

  private String name;
  private String identifier;
}