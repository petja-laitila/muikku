package fi.muikku.dao.workspace;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import fi.muikku.dao.CoreDAO;
import fi.muikku.model.users.UserEntity;
import fi.muikku.model.workspace.WorkspaceEntity;
import fi.muikku.model.workspace.WorkspaceRoleEntity;
import fi.muikku.model.workspace.WorkspaceUserEntity;
import fi.muikku.model.workspace.WorkspaceUserEntity_;

public class WorkspaceUserEntityDAO extends CoreDAO<WorkspaceUserEntity> {

	private static final long serialVersionUID = -850520598378547048L;

	public WorkspaceUserEntity create(UserEntity user, WorkspaceEntity workspace, String identifier, WorkspaceRoleEntity workspaceUserRole) {
    return create(user, workspace, workspaceUserRole, identifier, Boolean.FALSE);
  }
  
  public WorkspaceUserEntity create(UserEntity user, WorkspaceEntity workspaceEntity, WorkspaceRoleEntity workspaceUserRole, String identifier, Boolean archived) {
    WorkspaceUserEntity workspaceUserEntity = new WorkspaceUserEntity();
    
    workspaceUserEntity.setUser(user);
    workspaceUserEntity.setWorkspaceEntity(workspaceEntity);
    workspaceUserEntity.setWorkspaceUserRole(workspaceUserRole);
    workspaceUserEntity.setIdentifier(identifier);
    workspaceUserEntity.setArchived(archived);
    
    return persist(workspaceUserEntity);
  }

  public WorkspaceUserEntity findByWorkspaceAndUser(WorkspaceEntity workspaceEntity, UserEntity userEntity) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<WorkspaceUserEntity> criteria = criteriaBuilder.createQuery(WorkspaceUserEntity.class);
    Root<WorkspaceUserEntity> root = criteria.from(WorkspaceUserEntity.class);
    
    criteria.select(root);
    criteria.where(
        criteriaBuilder.and(
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.archived), Boolean.FALSE),
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.workspaceEntity), workspaceEntity),
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.user), userEntity)
        )
    );
    
    return getSingleResult(entityManager.createQuery(criteria));
  }

  public WorkspaceUserEntity findByWorkspaceAndIdentifier(WorkspaceEntity workspaceEntity, String identifier) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<WorkspaceUserEntity> criteria = criteriaBuilder.createQuery(WorkspaceUserEntity.class);
    Root<WorkspaceUserEntity> root = criteria.from(WorkspaceUserEntity.class);
    
    criteria.select(root);
    criteria.where(
      criteriaBuilder.and(
        criteriaBuilder.equal(root.get(WorkspaceUserEntity_.workspaceEntity), workspaceEntity),
        criteriaBuilder.equal(root.get(WorkspaceUserEntity_.identifier), identifier)
      ) 
    );
    
    return getSingleResult(entityManager.createQuery(criteria));
  }

  public List<WorkspaceUserEntity> listByUser(UserEntity userEntity) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<WorkspaceUserEntity> criteria = criteriaBuilder.createQuery(WorkspaceUserEntity.class);
    Root<WorkspaceUserEntity> root = criteria.from(WorkspaceUserEntity.class);
    
    criteria.select(root);
    criteria.where(
        criteriaBuilder.and(
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.archived), Boolean.FALSE),
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.user), userEntity)
        )
    );
    
    return entityManager.createQuery(criteria).getResultList();
  }

  public List<WorkspaceUserEntity> listByWorkspace(WorkspaceEntity workspaceEntity) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<WorkspaceUserEntity> criteria = criteriaBuilder.createQuery(WorkspaceUserEntity.class);
    Root<WorkspaceUserEntity> root = criteria.from(WorkspaceUserEntity.class);
    
    criteria.select(root);
    criteria.where(
        criteriaBuilder.and(
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.archived), Boolean.FALSE),
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.workspaceEntity), workspaceEntity)
        )
    );
    
    return entityManager.createQuery(criteria).getResultList();
  }
  
  public List<WorkspaceUserEntity> listByWorkspaceAndRole(WorkspaceEntity workspaceEntity, WorkspaceRoleEntity workspaceUserRole) {
    EntityManager entityManager = getEntityManager(); 
    
    CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
    CriteriaQuery<WorkspaceUserEntity> criteria = criteriaBuilder.createQuery(WorkspaceUserEntity.class);
    Root<WorkspaceUserEntity> root = criteria.from(WorkspaceUserEntity.class);
    
    criteria.select(root);
    criteria.where(
        criteriaBuilder.and(
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.archived), Boolean.FALSE),
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.workspaceEntity), workspaceEntity),
            criteriaBuilder.equal(root.get(WorkspaceUserEntity_.workspaceUserRole), workspaceUserRole)
        )
    );
    
    return entityManager.createQuery(criteria).getResultList();
  }
  
  public void delete(WorkspaceUserEntity workspaceUserEntity) {
    super.delete(workspaceUserEntity);
  }

}
