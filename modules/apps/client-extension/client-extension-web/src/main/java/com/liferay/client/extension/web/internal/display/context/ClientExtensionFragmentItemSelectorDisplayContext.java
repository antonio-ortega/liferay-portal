/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.client.extension.web.internal.display.context;

import com.liferay.object.model.ObjectDefinition;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.PortalUtil;
import com.liferay.portal.kernel.util.WebKeys;

import jakarta.servlet.http.HttpServletRequest;

/**
 * @author Antonio Ortega
 */
public class ClientExtensionFragmentItemSelectorDisplayContext {

	public ClientExtensionFragmentItemSelectorDisplayContext(
		HttpServletRequest httpServletRequest) {

		_themeDisplay = (ThemeDisplay)httpServletRequest.getAttribute(
			WebKeys.THEME_DISPLAY);
	}

	public String getClassName() {
		return ObjectDefinition.class.getName();
	}

	public long getClassNameId() {
		return PortalUtil.getClassNameId(getClassName());
	}

	private final ThemeDisplay _themeDisplay;

}