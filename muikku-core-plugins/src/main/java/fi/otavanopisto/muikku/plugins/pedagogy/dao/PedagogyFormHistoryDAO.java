package fi.otavanopisto.muikku.plugins.pedagogy.dao;

import java.util.Date;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import fi.otavanopisto.muikku.plugins.CorePluginsDAO;
import fi.otavanopisto.muikku.plugins.pedagogy.model.PedagogyForm;
import fi.otavanopisto.muikku.plugins.pedagogy.model.PedagogyFormHistory;
import fi.otavanopisto.muikku.plugins.pedagogy.model.PedagogyFormHistory_;

public class PedagogyFormHistoryDAO extends CorePluginsDAO<PedagogyFormHistory> {

  private static final long serialVersionUID = -2764711782246722127L;
  
  public PedagogyFormHistory create(PedagogyForm form, String details, Long creator) {
    return create(form, details, creator, null);
  }

  public PedagogyFormHistory create(PedagogyForm form, String details, Long creator, String fields) {
    PedagogyFormHistory history = new PedagogyFormHistory();
    history.setCreated(new Date());
    history.setCreator(creator);
    history.setDetails(details);
    history.setFields(fields);
    history.setForm(form);
    return persist(history);
  }
  
  public List<PedagogyFormHistory> listByForm(PedagogyForm form) {
    EntityManager entityManager = getEntityManager();
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<PedagogyFormHistory> criteria = criteriaBuilder.createQuery(PedagogyFormHistory.class);
    Root<PedagogyFormHistory> root = criteria.from(PedagogyFormHistory.class);
    criteria.select(root);
    criteria.where(
      criteriaBuilder.equal(root.get(PedagogyFormHistory_.form), form)
    );
    
    return entityManager.createQuery(criteria).getResultList();
  }

}
