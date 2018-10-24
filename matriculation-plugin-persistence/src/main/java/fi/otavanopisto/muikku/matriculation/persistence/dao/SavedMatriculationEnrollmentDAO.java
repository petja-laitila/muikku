package fi.otavanopisto.muikku.matriculation.persistence.dao;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import fi.otavanopisto.muikku.dao.PluginDAO;
import fi.otavanopisto.muikku.matriculation.persistence.model.SavedMatriculationEnrollment;
import fi.otavanopisto.muikku.matriculation.persistence.model.SavedMatriculationEnrollment_;
import fi.otavanopisto.muikku.schooldata.SchoolDataIdentifier;

public class SavedMatriculationEnrollmentDAO extends PluginDAO<SavedMatriculationEnrollment> {

  private static final long serialVersionUID = 1062901330769382376L;

  protected EntityManager getEntityManager() {
    return entityManager;
  }

  @PersistenceContext (unitName = "muikku-core-plugins")
  private EntityManager entityManager;
  
  public SavedMatriculationEnrollment create(
    SchoolDataIdentifier userIdentifier,
    String savedEnrollmentJson
  ) {
    SavedMatriculationEnrollment savedEnrollment = new SavedMatriculationEnrollment();
    savedEnrollment.setUserIdentifier(userIdentifier);
    savedEnrollment.setSavedEnrollmentJson(savedEnrollmentJson);
    getEntityManager().persist(savedEnrollment);
    return savedEnrollment;
  }

  public SavedMatriculationEnrollment updateSavedEnrollmentJson(
    SavedMatriculationEnrollment savedEnrollment,
    String savedEnrollmentJson
  ) {
    savedEnrollment.setSavedEnrollmentJson(savedEnrollmentJson);
    getEntityManager().persist(savedEnrollment);
    return savedEnrollment;
  }
  
  public SavedMatriculationEnrollment findByUser(SchoolDataIdentifier userIdentifier) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<SavedMatriculationEnrollment> criteria = criteriaBuilder.createQuery(SavedMatriculationEnrollment.class);
    Root<SavedMatriculationEnrollment> root = criteria.from(SavedMatriculationEnrollment.class);
    criteria.select(root);
    criteria.where(
        criteriaBuilder.equal(root.get(SavedMatriculationEnrollment_.userIdentifier), userIdentifier.toId())
    );
    
    return getSingleResult(entityManager.createQuery(criteria));
  }
}
