package fi.muikku.plugins.dnm.parser.content;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.transform.TransformerException;
import javax.xml.xpath.XPathExpressionException;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.commons.lang3.StringUtils;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import fi.muikku.plugins.dnm.parser.DeusNexException;
import fi.muikku.plugins.dnm.parser.DeusNexInternalException;
import fi.muikku.plugins.dnm.parser.DeusNexSyntaxException;
import fi.muikku.plugins.dnm.parser.DeusNexXmlUtils;

public class DeusNexContentParser {
	
	public DeusNexContentParser() {
	}
	
	public DeusNexContentParser setEmbeddedItemElementHandler(DeusNexEmbeddedItemElementHandler deusNexEmbeddedItemElementHandler) {
		this.embeddedItemElementHandler = deusNexEmbeddedItemElementHandler;
		return this;
	}
	
	public DeusNexContentParser setFieldElementHandler(DeusNexFieldElementHandler fieldElementHandler) {
		this.fieldElementHandler = fieldElementHandler;
		return this;
	}

	public Map<String, String> parseContent(Element documentElement) throws DeusNexException {
		if (!"document".equals(documentElement.getTagName())) {
			throw new DeusNexSyntaxException("Invalid content document");
		}
		
		Map<String, String> contents = new HashMap<>();
		
		Document ownerDocument = documentElement.getOwnerDocument();
		
		try {
			List<Element> localeDocuments = DeusNexXmlUtils.getElementsByXPath(documentElement, "fckdocument");
			for (Element localeDocument : localeDocuments) {
				String lang = localeDocument.getAttribute("lang");
				if (StringUtils.isBlank(lang)) {
					throw new DeusNexSyntaxException("Locale document does not specify lang");
				}

				// TODO: Sometimes document and fckdocument nodes are duplicated, when and why?
				
				NodeList embeddedItemNodeList = localeDocument.getElementsByTagName("ix:embeddeditem");
				for (int i = embeddedItemNodeList.getLength() - 1; i >= 0; i--) {
					Element embeddedItemElement = (Element) embeddedItemNodeList.item(i);
					Node replacement = handleEmbeddedItem(ownerDocument, embeddedItemElement);
					replaceElement(ownerDocument, embeddedItemElement, replacement);
				}
				
				NodeList textFieldNodeList = localeDocument.getElementsByTagName("ixf:textfield");
				for (int i = textFieldNodeList.getLength() - 1; i >= 0; i--) {
					Element element = (Element) textFieldNodeList.item(i);
					Node replacement = handleTextField(ownerDocument, element);
					replaceElement(ownerDocument, element, replacement);
				}
				
				NodeList optionListNodeList = localeDocument.getElementsByTagName("ixf:optionlist");
				for (int i = optionListNodeList.getLength() - 1; i >= 0; i--) {
					Element element = (Element) optionListNodeList.item(i);
					Node replacement = handleOptionListField(ownerDocument, element);
					replaceElement(ownerDocument, element, replacement);
				}
				
				NodeList connectFieldNodeList = localeDocument.getElementsByTagName("ixf:connectfield");
				for (int i = connectFieldNodeList.getLength() - 1; i >= 0; i--) {
					Element element = (Element) connectFieldNodeList.item(i);
					Node replacement = handleConnectField(ownerDocument, element);
					replaceElement(ownerDocument, element, replacement);
				}
				
				
				Element htmlElement = ownerDocument.createElement("html"); 
				Element bodyElement = ownerDocument.createElement("body");
				htmlElement.appendChild(bodyElement);
				
				NodeList childNodes = localeDocument.getChildNodes();
				for (int i = childNodes.getLength() - 1; i >= 0; i--) {
					if (bodyElement.getFirstChild() != null) {
						bodyElement.insertBefore(childNodes.item(i), bodyElement.getFirstChild());
					} else {
						bodyElement.appendChild(childNodes.item(i));
					}
				}
				
				contents.put(lang, DeusNexXmlUtils.serializeElement(htmlElement));
			}
		} catch (XPathExpressionException | TransformerException e) {
			throw new DeusNexInternalException("Internal Error occurred while processing document", e);
		}
		
		return contents;
	}

	private void replaceElement(Document ownerDocument, Element element, Node replacement) throws XPathExpressionException, DeusNexInternalException {
		Node nextSibling = element.getNextSibling();
		Node parent = element.getParentNode();
		parent.removeChild(element);
		
		if (replacement != null) {
			if (nextSibling != null) {
				parent.insertBefore(replacement, nextSibling);
			} else {
				parent.appendChild(replacement);
			}
		}
	}

	private Node handleEmbeddedItem(Document ownerDocument, Element embeddedItemElement) throws XPathExpressionException, DeusNexInternalException {
	  String type = DeusNexXmlUtils.getChildValue(embeddedItemElement, "type");
//	  String id = embeddedItemElement.getAttribute("id");
  
		switch (type) {
			case "image":
				return handleEmbeddedItemImage(ownerDocument, embeddedItemElement);
			case "document":
				return handleEmbeddedItemDocument(ownerDocument, embeddedItemElement);
			case "audio":
				return handleEmbeddedItemAudio(ownerDocument, embeddedItemElement);
		}
		
		throw new DeusNexInternalException("Unknown ix:embeddeditem type '" + type + "'");
	}

	private Node handleEmbeddedItemAudio(Document ownerDocument, Element embeddedItemElement) throws XPathExpressionException {
		Integer resourceNo = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/resourceno");
		Boolean showAsLink = "1".equals(DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/showaslink"));
		String fileName = DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/filename");
		String linkText = DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/linktext");
		Boolean autoStart = "1".equals(DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/autostart"));
		Boolean loop = "1".equals(DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/loop"));
		
		if (embeddedItemElementHandler != null) {
  		return embeddedItemElementHandler.handleEmbeddedAudio(ownerDocument, resourceNo, showAsLink, fileName, linkText, autoStart, loop);
		} else {
			return null;
		}
	}

	private Node handleEmbeddedItemDocument(Document ownerDocument, Element embeddedItemElement) throws XPathExpressionException {
		String title =  DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/title");
		Integer queryType = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/querytype");
		Integer resourceNo = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/resourceno");
		Integer embeddedResourceNo = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/embeddedresourceno");

		if (embeddedItemElementHandler != null) {
  		return embeddedItemElementHandler.handleEmbeddedDocument(ownerDocument, title, queryType, resourceNo, embeddedResourceNo);
		} else {
			return null;
		}
	}

	private Node handleEmbeddedItemImage(Document ownerDocument, Element embeddedItemElement) throws XPathExpressionException {
		String title =  DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/title");
		String alt =  DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/alt");
		Integer width = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/width");
		Integer height = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/height");
		Integer hspace = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/hspace");
		String align =  DeusNexXmlUtils.getChildValue(embeddedItemElement, "parameters/align");
		Integer resourceno = DeusNexXmlUtils.getChildValueInteger(embeddedItemElement, "parameters/resourceno");
		
		if (embeddedItemElementHandler != null) {
  		return embeddedItemElementHandler.handleEmbeddedImage(ownerDocument, title, alt, width, height, hspace, align, resourceno);
		} else {
			return null;
		}
	}
	
	private Node handleOptionListField(Document ownerDocument, Element fieldElement) throws XPathExpressionException {
		String paramName = DeusNexXmlUtils.getChildValue(fieldElement, "paramname");
		String type = DeusNexXmlUtils.getChildValue(fieldElement, "type");
		List<OptionListOption> options = new ArrayList<>();
		
		List<Element> optionElements = DeusNexXmlUtils.getElementsByXPath(fieldElement, "option");
		for (Element optionElement : optionElements) {
			String optionName = optionElement.getAttribute("name");
			String pointsStr = optionElement.getAttribute("points");
			Double optionPoints = StringUtils.isNotBlank(pointsStr) ? NumberUtils.createDouble(pointsStr) : null;
			String optionText = optionElement.getTextContent();
			
			options.add(new OptionListOption(optionName, optionPoints, optionText));
		}
		
		if (fieldElementHandler != null) {
			return fieldElementHandler.handleOptionList(ownerDocument, paramName, type, options);
		}
		
		return null;
	}
	
	private Node handleTextField(Document ownerDocument, Element fieldElement) throws XPathExpressionException {
		String paramName = DeusNexXmlUtils.getChildValue(fieldElement, "paramname");
		Integer columns = DeusNexXmlUtils.getChildValueInteger(fieldElement, "columns");
		
		List<RightAnswer> rightAnswers = new ArrayList<>();
		List<Element> answerElements = DeusNexXmlUtils.getElementsByXPath(fieldElement, "rightanswers/answer");
		for (Element answerElement : answerElements) {
			String answerText = DeusNexXmlUtils.getChildValue(answerElement, "text");
			Double answerPoints = DeusNexXmlUtils.getChildValueDoble(answerElement, "points");
			rightAnswers.add(new RightAnswer(answerPoints, answerText));
		}
		
		if (fieldElementHandler != null) {
			return fieldElementHandler.handleTextField(ownerDocument, paramName, columns, rightAnswers);
		}
		
		return null;
	}
	
	private Node handleConnectField(Document ownerDocument, Element fieldElement) throws XPathExpressionException {
		String paramName = DeusNexXmlUtils.getChildValue(fieldElement, "paramname");
		
		List<ConnectFieldOption> options = new ArrayList<>();
		List<Element> optionElements = DeusNexXmlUtils.getElementsByXPath(fieldElement, "option");
		for (Element answerElement : optionElements) {
			String optionAnswer = answerElement.getAttribute("answer");
			String optionEquivalent = answerElement.getAttribute("equivalent");
			String optionTerm = answerElement.getAttribute("term");
			String optionPointsStr = answerElement.getAttribute("points");
			Double optionPoints = StringUtils.isNotBlank(optionPointsStr) ? NumberUtils.createDouble(optionPointsStr) : null;
			options.add(new ConnectFieldOption(optionAnswer, optionEquivalent, optionTerm, optionPoints));
		}
		
		if (fieldElementHandler != null) {
			return fieldElementHandler.handleConnectField(ownerDocument, paramName, options);
		}
		
		return null;
	}
	
	private DeusNexEmbeddedItemElementHandler embeddedItemElementHandler;
	private DeusNexFieldElementHandler fieldElementHandler;
}