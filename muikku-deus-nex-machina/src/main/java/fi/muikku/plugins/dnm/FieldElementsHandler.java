package fi.muikku.plugins.dnm;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.codehaus.jackson.map.ObjectMapper;
import org.w3c.dom.DOMException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;

import fi.muikku.plugins.dnm.parser.DeusNexException;
import fi.muikku.plugins.dnm.parser.DeusNexInternalException;
import fi.muikku.plugins.dnm.parser.content.ConnectFieldOption;
import fi.muikku.plugins.dnm.parser.content.DeusNexFieldElementHandler;
import fi.muikku.plugins.dnm.parser.content.OptionListOption;
import fi.muikku.plugins.dnm.parser.content.RightAnswer;
import fi.muikku.plugins.dnm.parser.structure.DeusNexDocument;
import fi.muikku.plugins.dnm.translator.FieldTranslator;
import fi.muikku.plugins.material.fieldmeta.ChecklistFieldMeta;
import fi.muikku.plugins.material.fieldmeta.ChecklistFieldOptionMeta;
import fi.muikku.plugins.material.fieldmeta.ConnectFieldMeta;
import fi.muikku.plugins.material.fieldmeta.FieldMeta;
import fi.muikku.plugins.material.fieldmeta.MemoFieldMeta;
import fi.muikku.plugins.material.fieldmeta.SelectFieldMeta;
import fi.muikku.plugins.material.fieldmeta.SelectFieldOptionMeta;
import fi.muikku.plugins.material.fieldmeta.TextFieldMeta;

class FieldElementsHandler implements DeusNexFieldElementHandler {

  public FieldElementsHandler(DeusNexDocument deusNexDocument) {
    this.deusNexDocument = deusNexDocument;
    this.fieldTranslator = new FieldTranslator();
  }

  private Element wrapWithObjectElement(org.w3c.dom.Document ownerDocument, Element content, FieldMeta fieldMeta) {
    return wrapWithObjectElement(ownerDocument, new Element[] { content}, fieldMeta);
  }
  
  private Element wrapWithObjectElement(org.w3c.dom.Document ownerDocument, List<Element> contents, FieldMeta fieldMeta) {
    return wrapWithObjectElement(ownerDocument, contents.toArray(new Element[0]), fieldMeta);
  }

  private Element wrapWithObjectElement(org.w3c.dom.Document ownerDocument, Element[] contents, FieldMeta fieldMeta) {
    ObjectMapper objectMapper = new ObjectMapper();
    
    Element objectElement = ownerDocument.createElement("object");
    objectElement.setAttribute("type", fieldMeta.getType());

    Element paramTypeElement = ownerDocument.createElement("param");
    paramTypeElement.setAttribute("name", "type");
    paramTypeElement.setAttribute("value", "application/json");

    Element paramContentElement = ownerDocument.createElement("param");
    paramContentElement.setAttribute("name", "content");
    try {
      paramContentElement.setAttribute("value", objectMapper.writeValueAsString(fieldMeta));
    } catch (DOMException | IOException e) {
      e.printStackTrace();
    }

    objectElement.appendChild(paramTypeElement);
    objectElement.appendChild(paramContentElement);

    for (Element content : contents) {
      objectElement.appendChild(content);
    }
    
    return objectElement;
  }

  @Override
  public Node handleTextField(org.w3c.dom.Document ownerDocument, String paramName, Integer columns, List<RightAnswer> rightAnswers, String help, String hint) {
    // TODO: This is just for show, real implementation depends on QueryMaterial implementation
   
    TextFieldMeta textFieldData = fieldTranslator.translateTextField(paramName, columns, rightAnswers, help, hint);

    Element inputElement = ownerDocument.createElement("input");
    inputElement.setAttribute("type", "text");
    inputElement.setAttribute("name", paramName);
    inputElement.setAttribute("size", String.valueOf(columns));

    return wrapWithObjectElement(ownerDocument, inputElement, textFieldData);
  }

  @Override
  public Node handleMemoField(Document ownerDocument, String paramName, Integer columns, Integer rows, String help, String hint) {
    // TODO: This is just for show, real implementation depends on QueryMaterial implementation
    
    MemoFieldMeta fieldData = fieldTranslator.translateMemoField(paramName, columns, rows, help, hint);

    Element textAreaElement = ownerDocument.createElement("textarea");
    textAreaElement.setAttribute("name", paramName);
    textAreaElement.setAttribute("cols", String.valueOf(columns));
    textAreaElement.setAttribute("rows", String.valueOf(rows));
    textAreaElement.setAttribute("placeholder", help);
    textAreaElement.setAttribute("title", hint);

    return wrapWithObjectElement(ownerDocument, textAreaElement, fieldData);
  }

  @Override
  public Node handleOptionList(org.w3c.dom.Document ownerDocument, String paramName, String type, List<OptionListOption> options, Integer size, String help, String hint) throws DeusNexException {
    // TODO: This is just for show, real implementation depends on QueryMaterial implementation
    
    SelectFieldMeta selectFieldMeta = fieldTranslator.translateOptionList(paramName, type, size, options);

    switch (selectFieldMeta.getListType()) {
      case "radio_horz":
        return handleRadioHorzSelectField(ownerDocument, selectFieldMeta);
      case "radio":
        return handleRadioSelectField(ownerDocument, selectFieldMeta);
      case "list":
        return handleListSelectField(ownerDocument, selectFieldMeta);
      case "dropdown":
        return handleDropdownSelectField(ownerDocument, selectFieldMeta);
      default:
        throw new DeusNexInternalException("Unrecognized select field type: " + selectFieldMeta.getListType());
    }
  }

  @Override
  public Node handleChecklistField(Document ownerDocument, String paramName, List<ChecklistFieldOptionMeta> options, String helpOf, String hintOf) {
    ChecklistFieldMeta checklistFieldMeta = fieldTranslator.translateChecklistField(paramName, options);
    
    List<Element> elements = new ArrayList<>();

    for (ChecklistFieldOptionMeta option : checklistFieldMeta.getOptions()) {
      Element inputElement = ownerDocument.createElement("input");
      inputElement.setAttribute("type", "checkbox");
      inputElement.setAttribute("value", option.getName());
      inputElement.setAttribute("name", checklistFieldMeta.getName());
      
      // TODO: Label For ...
      Element labelElement = ownerDocument.createElement("label");
      labelElement.setTextContent(option.getText());
      
      elements.add(inputElement);
      elements.add(labelElement);
    }

    return wrapWithObjectElement(ownerDocument, elements, checklistFieldMeta);
  }
  
  private Node handleRadioHorzSelectField(Document ownerDocument, SelectFieldMeta selectFieldMeta) {
    List<Element> elements = new ArrayList<>();

    for (SelectFieldOptionMeta option : selectFieldMeta.getOptions()) {
      Element inputElement = ownerDocument.createElement("input");
      inputElement.setAttribute("type", "radio");
      inputElement.setAttribute("value", option.getName());
      inputElement.setAttribute("name", selectFieldMeta.getName());
      
      // TODO: Label For ...
      Element labelElement = ownerDocument.createElement("label");
      labelElement.setTextContent(option.getText());
      
      elements.add(inputElement);
      elements.add(labelElement);
    }

    return wrapWithObjectElement(ownerDocument, elements, selectFieldMeta);
  }
  
  private Node handleRadioSelectField(Document ownerDocument, SelectFieldMeta selectFieldMeta) {
    List<Element> elements = new ArrayList<>();

    for (SelectFieldOptionMeta option : selectFieldMeta.getOptions()) {
      Element inputElement = ownerDocument.createElement("input");
      inputElement.setAttribute("type", "radio");
      inputElement.setAttribute("value", option.getName());
      inputElement.setAttribute("name", selectFieldMeta.getName());
      
      // TODO: Label For ...
      Element labelElement = ownerDocument.createElement("label");
      labelElement.setTextContent(option.getText());
      
      elements.add(inputElement);
      elements.add(labelElement);
      elements.add(ownerDocument.createElement("br"));
    }

    return wrapWithObjectElement(ownerDocument, elements, selectFieldMeta);
  }
  
  private Node handleDropdownSelectField(Document ownerDocument, SelectFieldMeta selectFieldMeta) {
    Element selectElement = ownerDocument.createElement("select");
    selectElement.setAttribute("name", selectFieldMeta.getName());

    for (SelectFieldOptionMeta option : selectFieldMeta.getOptions()) {
      Element optionElement = ownerDocument.createElement("option");
      optionElement.setAttribute("value", option.getName());
      optionElement.setTextContent(option.getText());
      selectElement.appendChild(optionElement);
    }

    return wrapWithObjectElement(ownerDocument, selectElement, selectFieldMeta);
  }
  
  private Node handleListSelectField(Document ownerDocument, SelectFieldMeta selectFieldMeta) {
    Element selectElement = ownerDocument.createElement("select");
    selectElement.setAttribute("name", selectFieldMeta.getName());
    
    if (selectFieldMeta.getSize() != null) {
      selectElement.setAttribute("size", String.valueOf(selectFieldMeta.getSize()));
    }
    
    for (SelectFieldOptionMeta option : selectFieldMeta.getOptions()) {
      Element optionElement = ownerDocument.createElement("option");
      optionElement.setAttribute("value", option.getName());
      optionElement.setTextContent(option.getText());
      selectElement.appendChild(optionElement);
    }

    return wrapWithObjectElement(ownerDocument, selectElement, selectFieldMeta);
  }

  @Override
  public Node handleConnectField(org.w3c.dom.Document ownerDocument, String paramName, List<ConnectFieldOption> options, String help, String hint) {
    ConnectFieldMeta connectFieldData = fieldTranslator.translateConnectField(paramName, options);

    Element table = ownerDocument.createElement("table");
    Element tbody = ownerDocument.createElement("tbody");
    int fieldCount = 0;
    for (ConnectFieldOption connectFieldOption : options) {
      Element tr = ownerDocument.createElement("tr");
      Element tdLeft = ownerDocument.createElement("td");
      Element tdCenter = ownerDocument.createElement("td");
      Element tdRight = ownerDocument.createElement("td");
      Element input = ownerDocument.createElement("input");
      input.setAttribute("type", "text");
      input.setAttribute("name", paramName);
      input.setAttribute("data-fieldcount", String.valueOf(fieldCount));

      tdLeft.setTextContent(connectFieldOption.getTerm());
      tdCenter.appendChild(input);
      tdRight.setTextContent(connectFieldOption.getEquivalent());
      tr.appendChild(tdLeft);
      tr.appendChild(tdCenter);
      tr.appendChild(tdRight);
      tbody.appendChild(tr);
      fieldCount++;
    }

    table.appendChild(tbody);

    return wrapWithObjectElement(ownerDocument, table, connectFieldData);
  }

  @SuppressWarnings("unused")
  private DeusNexDocument deusNexDocument;

  private FieldTranslator fieldTranslator;
}