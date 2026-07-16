/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.frontend.js.audiences;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Contributes the value of a detection attribute that can only be resolved on
 * the server. The value is injected into the page so the client-side detection
 * can read it without the audiences modules knowing where it comes from.
 *
 * @author Antonio Ortega
 */
public interface AudiencesServerAttributeProvider {

	public String getName();

	public String getValue(HttpServletRequest httpServletRequest);

}