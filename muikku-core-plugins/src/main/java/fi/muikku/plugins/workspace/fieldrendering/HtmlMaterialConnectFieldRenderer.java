package fi.muikku.plugins.workspace.fieldrendering;

import java.io.IOException;

import javax.enterprise.context.RequestScoped;

import org.codehaus.jackson.JsonParseException;
import org.codehaus.jackson.map.JsonMappingException;
import org.codehaus.jackson.map.ObjectMapper;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import fi.muikku.plugins.material.model.field.ConnectField;
import fi.muikku.plugins.workspace.model.WorkspaceMaterialField;

@RequestScoped
public class HtmlMaterialConnectFieldRenderer implements HtmlMaterialFieldRenderer {

  private static final int ALPHABET_SIZE = 26;

  @Override
  public String getType() {
    return "application/vnd.muikku.field.connect";
  }

  @Override
  public void renderField(Document ownerDocument, Element objectElement, String content, WorkspaceMaterialField workspaceMaterialField) throws JsonParseException, JsonMappingException, IOException {
    ConnectField connectField = (new ObjectMapper()).readValue(content, ConnectField.class);
    
    Element tableElement = ownerDocument.createElement("table");
    tableElement.setAttribute("class", "muikku-connect-field-table");

    Element tbodyElement = ownerDocument.createElement("tbody");
    
    int fieldsSize = connectField.getFields().size();
    int counterpartsSize = connectField.getCounterparts().size();
    int rowCount = Math.max(fieldsSize, counterpartsSize);
    
    for (int rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      Element trElement = ownerDocument.createElement("tr");
      Element tdTermElement = ownerDocument.createElement("td");
      Element tdValueElement = ownerDocument.createElement("td");
      Element tdCounterpartElement = ownerDocument.createElement("td");
      Element inputElement = ownerDocument.createElement("input");
      
      fi.muikku.plugins.material.model.field.ConnectField.Field field = rowIndex < fieldsSize ? connectField.getFields().get(rowIndex) : null;
      fi.muikku.plugins.material.model.field.ConnectField.Field counterpart = rowIndex < counterpartsSize ? connectField.getCounterparts().get(rowIndex) : null;

      tdTermElement.setAttribute("class", "muikku-connect-field-term-cell");
      tdValueElement.setAttribute("class", "muikku-connect-field-value-cell");
      tdCounterpartElement.setAttribute("class", "muikku-connect-field-counterpart-cell");
      
      if (field != null) {
        tdTermElement.setTextContent((rowIndex + 1) + " - " + field.getText());
        tdTermElement.setAttribute("data-muikku-connect-field-option-name", field.getName());

        inputElement.setAttribute("type", "text");
        inputElement.setAttribute("name", workspaceMaterialField.getName() + "." + field.getName());
        inputElement.setAttribute("class", "muikku-connect-field-value");
        
        tdValueElement.appendChild(inputElement);
      }

      if (counterpart != null) {
        tdCounterpartElement.setTextContent(getExcelStyleLetterIndex(rowIndex) + " - " + counterpart.getText());
        tdCounterpartElement.setAttribute("data-muikku-connect-field-option-name", counterpart.getName());
      }
      
      trElement.appendChild(tdTermElement);
      trElement.appendChild(tdValueElement);
      trElement.appendChild(tdCounterpartElement);
      tbodyElement.appendChild(trElement);
    }
    
    tableElement.appendChild(tbodyElement);
    Node objectParent = objectElement.getParentNode();
    
    objectParent.insertBefore(tableElement, objectElement);
    objectParent.removeChild(objectElement);
  }

  private String getExcelStyleLetterIndex(int numericIndex) {   
    String result = "";
    
    do {
      int charIndex = numericIndex % ALPHABET_SIZE;
      numericIndex /= ALPHABET_SIZE;
      numericIndex -= 1;
      
      result = new String(Character.toChars(charIndex + 'A')) + result;
    } while (numericIndex > -1);
    
    return result;
  }
  
}
