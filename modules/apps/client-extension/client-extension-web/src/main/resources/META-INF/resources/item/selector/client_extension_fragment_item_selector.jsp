<%--
/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<aui:style type="text/css">
	.management-bar-wrapper {
		background: #fff;
		margin-left: -100%;
		margin-right: -100%;
		padding-left: 100%;
		padding-right: 100%;
	}

	.portlet-body {
		overflow: hidden;
	}
</aui:style>

<div class="container-fluid container-fluid-max-xxxl">
	<frontend-data-set:classic-display
		actionParameterName="externalReferenceCode"
		dataProviderKey="<%= ClientExtensionAdminFDSNames.CLIENT_EXTENSION_TYPES %>"
		id="<%= ClientExtensionAdminFDSNames.CLIENT_EXTENSION_TYPES %>"
		itemsPerPage="<%= 10 %>"
		selectedItemsKey="externalReferenceCode"
		selectionType="single"
		uniformActionsDisplay="<%= true %>"
	/>
</div>

<!-- react:component
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
/ -->