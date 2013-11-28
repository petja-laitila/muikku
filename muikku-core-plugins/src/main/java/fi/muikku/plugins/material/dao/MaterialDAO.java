package fi.muikku.plugins.material.dao;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import fi.muikku.plugin.PluginDAO;
import fi.muikku.plugins.material.model.Material;
import fi.muikku.plugins.material.model.Material_;

public class MaterialDAO extends PluginDAO<Material> {

	private static final long serialVersionUID = 148925841493479490L;

	public Material create(String type, String title) {
		Material material = new Material();
		material.setType(type);
		material.setTitle(title);
		return persist(material);
	}

	public Material findByUrlName(String urlName) {
		EntityManager entityManager = getEntityManager();

		CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
		CriteriaQuery<Material> criteria = criteriaBuilder.createQuery(Material.class);
		Root<Material> root = criteria.from(Material.class);
		criteria.select(root);
		criteria.where(criteriaBuilder.equal(root.get(Material_.urlName), urlName));

		return getSingleResult(entityManager.createQuery(criteria));
	}
	
}