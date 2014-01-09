package fi.muikku.security;

public class AbstractMuikkuPermissionCollection extends AbstractPermissionCollection {
  
  public static final String EVERYONE = "Everyone";

  public static final String MANAGER = "Manager";
  public static final String TEACHER = "Teacher";
  public static final String STUDENT = "Student";
  
  public static final String WORKSPACE_TEACHER = "Workspace Teacher";
  public static final String WORKSPACE_STUDENT = "Workspace Student";
  
  protected String[] getDefaultRoles(Class<?> collectionClass, String permission) throws NoSuchFieldException {
    DefaultPermissionRoles annotation = collectionClass.getField(permission).getAnnotation(DefaultPermissionRoles.class);

    if (annotation != null)
      return annotation.value();
    else
      return null;
  }
  
}