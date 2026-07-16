/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

/**
 * @returns the country name resolved by the server-side IP Geocoder from the
 * current request's remote IP address, or an empty string when it cannot be
 * determined
 */
export function getIPGeocoder(): string {
	const metaElement = document.querySelector<HTMLMetaElement>(
		'meta[name="audiences-attribute-ip_geocoder"]'
	);

	return metaElement?.content ?? '';
}
