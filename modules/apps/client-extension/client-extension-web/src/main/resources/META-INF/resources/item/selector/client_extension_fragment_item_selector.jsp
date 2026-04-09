<%--
/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<react:component
	module="{ClientExtensionFragmentItemSelector} from client-extension-web"
	props='<%=
		HashMapBuilder.<String, Object>put(
			"className", clientExtensionFragmentItemSelectorDisplayContext.getClassName()
		).put(
			"classNameId", clientExtensionFragmentItemSelectorDisplayContext.getClassNameId()
		).put(
			"namespace", liferayPortletResponse.getNamespace()
		).build()
	%>'
/>