<%--
/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
--%>

<%@ include file="/init.jsp" %>

<%
FDSSampleDisplayContext fdsSampleDisplayContext = (FDSSampleDisplayContext)request.getAttribute(FDSSampleWebKeys.FDS_SAMPLE_DISPLAY_CONTEXT);
%>

<p>
	This data set declares filters and shows them, until a client extension
	takes the filtering over through an FDS connection. From the first
	<code>setFilters()</code> call on, the filters dropdown and the filter
	chips go away on their own: filtering has a single owner, and the data set
	stops offering controls that no longer tell the truth about the results.
	Place the sample custom element that connects to
	<code><%= FDSSampleFDSNames.DELEGATED_FILTERS %></code> on this page to
	watch it happen.
</p>

<frontend-data-set:headless-display
	apiURL="<%= fdsSampleDisplayContext.getAPIURL() %>"
	emptyState="<%= fdsSampleDisplayContext.getEmptyState() %>"
	id="<%= FDSSampleFDSNames.DELEGATED_FILTERS %>"
	itemsPerPage="<%= 10 %>"
	style="fluid"
/>