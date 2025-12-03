/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.frontend.data.set.sample.web.internal.frontend.data.set.action;

import com.liferay.frontend.data.set.FDSEntryItemImportPolicy;
import com.liferay.frontend.data.set.action.FDSItemsActions;
import com.liferay.frontend.data.set.model.FDSActionDropdownItem;
import com.liferay.frontend.data.set.model.FDSActionDropdownItemBuilder;
import com.liferay.frontend.data.set.model.FDSActionDropdownItemList;
import com.liferay.frontend.data.set.sample.web.internal.constants.FDSSampleFDSNames;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.portlet.LiferayPortletResponse;
import com.liferay.portal.kernel.portlet.LiferayWindowState;
import com.liferay.portal.kernel.portlet.url.builder.PortletURLBuilder;
import com.liferay.portal.kernel.util.JavaConstants;
import com.liferay.portal.kernel.util.PortalUtil;

import jakarta.portlet.PortletResponse;

import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Marko Cikos
 */
@Component(
	property = "frontend.data.set.name=" + FDSSampleFDSNames.ADVANCED,
	service = FDSItemsActions.class
)
public class AdvancedFDSItemsActions implements FDSItemsActions {

	@Override
	public List<FDSActionDropdownItem> getFDSActionDropdownItems(
		HttpServletRequest httpServletRequest) {

		//String href = "/o/c/fdssamples/{id}";

		PortletResponse portletResponse =
			(PortletResponse)httpServletRequest.getAttribute(
				JavaConstants.JAKARTA_PORTLET_RESPONSE);

		LiferayPortletResponse liferayPortletResponse =
			PortalUtil.getLiferayPortletResponse(portletResponse);

		return FDSActionDropdownItemList.of(
			FDSActionDropdownItemBuilder.putData(
				"disableHeader", "false"
			).putData(
				"title", "Side Panel Title Provided by Action"
			).setHref(
				PortletURLBuilder.createRenderURL(
					liferayPortletResponse
				).setMVCRenderCommandName(
					"/side_panel/empty"
				).setWindowState(
					LiferayWindowState.POP_UP
				).buildString()
			).setIcon(
				"rectangle-split"
			).setId(
				"open-side-panel-no-title"
			).setLabel(
				"Side Panel With Action Title"
			).setTarget(
				"sidePanel"
			).build(),
			FDSActionDropdownItemBuilder.putData(
				"disableHeader", "false"
			).putData(
				"title", "Side Panel Title Provided by Action"
			).setHref(
				PortletURLBuilder.createRenderURL(
					liferayPortletResponse
				).setMVCRenderCommandName(
					"/side_panel/full"
				).setWindowState(
					LiferayWindowState.POP_UP
				).buildString()
			).setIcon(
				"rectangle-split"
			).setId(
			 	"open-side-panel-no-title"
			).setLabel(
				"Side Panel With Action and Content Title"
			).setTarget(
				"sidePanel"
			).build(),
			FDSActionDropdownItemBuilder.putData(
				"disableHeader", "false"
			).setHref(
				PortletURLBuilder.createRenderURL(
					liferayPortletResponse
				).setMVCRenderCommandName(
					"/side_panel/full"
				).setWindowState(
					LiferayWindowState.POP_UP
				).buildString()
			).setIcon(
				"rectangle-split"
			).setId(
				"open-side-panel-no-title"
			).setLabel(
				"Side Panel With Content Title"
			).setTarget(
				"sidePanel"
			).build()
		);
	}

	@Override
	public FDSEntryItemImportPolicy getFDSEntryItemImportPolicy() {
		return FDSEntryItemImportPolicy.ITEM_PROXY;
	}

	@Reference
	private Language _language;

}