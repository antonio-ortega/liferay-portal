/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.ip.geocoder.internal.audiences;

import com.liferay.frontend.js.audiences.AudiencesServerAttributeProvider;
import com.liferay.ip.geocoder.IPGeocoder;
import com.liferay.ip.geocoder.IPInfo;

import jakarta.servlet.http.HttpServletRequest;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Antonio Ortega
 */
@Component(service = AudiencesServerAttributeProvider.class)
public class IPGeocoderAudiencesServerAttributeProvider
	implements AudiencesServerAttributeProvider {

	@Override
	public String getName() {
		return "ip_geocoder";
	}

	@Override
	public String getValue(HttpServletRequest httpServletRequest) {
		IPInfo ipInfo = _ipGeocoder.getIPInfo(httpServletRequest);

		return ipInfo.getCountryName();
	}

	@Reference
	private IPGeocoder _ipGeocoder;

}