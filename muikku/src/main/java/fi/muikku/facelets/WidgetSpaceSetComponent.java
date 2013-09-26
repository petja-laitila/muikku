package fi.muikku.facelets;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.faces.component.FacesComponent;
import javax.faces.component.UIComponent;
import javax.faces.component.UIComponentBase;
import javax.faces.context.FacesContext;

import fi.muikku.widgets.WidgetSpaceSizingStrategy;

@FacesComponent ("fi.muikku.facelet.WidgetSpaceSet")
public class WidgetSpaceSetComponent extends UIComponentBase {
	
	private final static int GRID_SIZE = 24;

	@Override
	public boolean getRendersChildren() {
		return true;
	}
	
	@Override
	public void encodeBegin(FacesContext context) throws IOException {
		int spaceLeft = GRID_SIZE;
		
		List<WidgetSpaceComponent> widgetSpaces = getWidgetSpaces();
		List<WidgetSpaceComponent> maximizeWidgetSpaces = new ArrayList<>();
		
		for (WidgetSpaceComponent widgetSpace : widgetSpaces) {
			List<WidgetComponent> widgets = getWidgetComponents(widgetSpace);
			widgetSpace.setEmpty(widgets.size() == 0);
			
			if (widgetSpace.getSizing() != WidgetSpaceSizingStrategy.MAXIMIZE) {
				int size = 0;
				for (UIComponent widgetComponent : widgets) {
					if (widgetComponent instanceof WidgetComponent) {
						WidgetComponent widget = (WidgetComponent) widgetComponent;
						if (widget.isRendered()) {
							switch (widgetSpace.getSizing()) {
								case MINIMIZE:
									if (widget.getSize() > size) {
										size = widget.getSize();
									}
								break;
								case SUM:
									size += widget.getSize();
								break;
								default:
							  break;
							}
						}
					}
				}
				
				widgetSpace.setSize(size);
				spaceLeft -= size;
			} else {
				maximizeWidgetSpaces.add(widgetSpace);
			}
		}
		
		for (WidgetSpaceComponent widgetSpace : maximizeWidgetSpaces) {
			widgetSpace.setSize(spaceLeft / maximizeWidgetSpaces.size());
		}

		super.encodeBegin(context);
	}
	
	private List<WidgetComponent> getWidgetComponents(WidgetSpaceComponent widgetSpace) {
		List<WidgetComponent> result = new ArrayList<>();
		
		List<UIComponent> widgets = widgetSpace.getChildren();
		for (UIComponent widgetComponent : widgets) {
			if (widgetComponent instanceof WidgetComponent) {
				WidgetComponent widget = (WidgetComponent) widgetComponent;
				if (widget.isRendered()) {
					result.add(widget);
				}
			}
		}
		
		return Collections.unmodifiableList(result);
	}

	private List<WidgetSpaceComponent> getWidgetSpaces() {
		List<WidgetSpaceComponent> result = new ArrayList<>();
		
		for (UIComponent widgetSpaceComponent : getChildren()) {
			if (widgetSpaceComponent instanceof WidgetSpaceComponent) {
				result.add((WidgetSpaceComponent) widgetSpaceComponent);
			}
		}
		
		return Collections.unmodifiableList(result);
	}

	@Override
	public String getFamily() {
		return getClass().getPackage().toString();
	}
	
}