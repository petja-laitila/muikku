package fi.muikku.plugins.material.processing;

import org.w3c.dom.Document;

public class HtmlMaterialBeforeProcessingContext extends AbstractHtmlMaterialDomProcessingContext {

  public HtmlMaterialBeforeProcessingContext() {
  }
  
  public HtmlMaterialBeforeProcessingContext(Long materialId, Document document) {
    super(materialId, document);
  }
  
}