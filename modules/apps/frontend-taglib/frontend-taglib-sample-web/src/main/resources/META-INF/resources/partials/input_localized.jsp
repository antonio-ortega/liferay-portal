<%--
/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<clay:container-fluid>
	<form>
		<aui:input id="inputLocalizedId!" label="Sample label" localized="<%= true %>" name="input-localized-name" type="text" value="" />
	</form>

	<aui:form name="fm2">
		<div class="form-group">
			<aui:fieldset id="myFieldsetId">
				<div class="lfr-form-row lfr-form-row-inline">
					<div class="row-fields">
						<aui:row>
							<aui:input label="Campo de texto" localized="<%= true %>" name="test-Field-0" type="text" value="" />
						</aui:row>
					</div>
				</div>
	
			<aui:input name="testIndexes" type="hidden" value="0" />
		</aui:fieldset>
	</div>
	
	</aui:form>
	
	<aui:script use="liferay-auto-fields">
		var autoFields = new Liferay.AutoFields(
			{
				contentBox: 'fieldset#myFieldsetId',
				fieldIndexes: '<portlet:namespace />testIndexes',
				namespace: '<portlet:namespace />'
			}
		).render();
	</aui:script>
</clay:container-fluid>