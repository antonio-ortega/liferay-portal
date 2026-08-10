/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import type {FDSFilterState} from '@liferay/js-api/data-set';

/**
 * Narrows a filter held in the FDS state down to the public
 * `FDSFilterState` contract.
 *
 * The stored object is a superset: it also carries preloaded data, the
 * filter's API URL and item cache, the compiled OData string, the
 * resolved Client Extension binding (which holds live functions), the
 * module URL, and more. Picking fields explicitly — rather than
 * spreading — is what keeps those out of a consumer's hands.
 */
export function toFDSFilterState(filter: FDSFilterState): FDSFilterState {
	return {
		active: !!filter.active,
		id: filter.id,
		label: filter.label,
		multiple: filter.multiple,
		selectedData: filter.active ? filter.selectedData : undefined,
		selectedItemsLabel: filter.selectedItemsLabel ?? '',
		type: filter.type,
	};
}

/**
 * A cheap signature of the public projection of the filters, used to
 * decide whether subscribers need to be notified.
 *
 * The FDS atom is rewritten wholesale (the widget clones it before every
 * write), so the `filters` array gets a new identity even when only
 * `search` changed. Comparing the serialized public projection instead
 * keeps `filters` callbacks from firing on unrelated updates.
 *
 * Returns `null` when the projection cannot be serialized — for example
 * when a Client Extension filter stores a cyclic `selectedData`. Callers
 * treat `null` as "assume it changed".
 */
export function getFDSFiltersSignature(
	filters: Array<FDSFilterState>
): string | null {
	try {
		return JSON.stringify(filters);
	}
	catch (error) {
		return null;
	}
}
