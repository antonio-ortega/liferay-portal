/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import type {
	FDSFilterSelection,
	FDSFilterWriteResult,
} from '@liferay/js-api/data-set';

/**
 * The write operations the widget publishes for the connection to call,
 * under the `${fdsName}_fdsCommands` atom.
 *
 * This is the seam between the two halves of the feature. Everything a
 * filter write needs — validating the payload against the filter's
 * `type`, recomputing the OData query and the selection label through
 * the filter implementation — lives in the widget, which files under
 * `js/api/` cannot import. So the connection stays a thin facade: it
 * resolves the FDS by name, reads state straight from the state atom,
 * and delegates every write here.
 *
 * The widget writes the object on mount and resets it to `null` on
 * unmount, so a connection can tell a live FDS from a stale key.
 */
export interface FDSCommands {

	/**
	 * Activates each listed filter with the given selection. Entries
	 * naming a filter the FDS does not declare, or carrying a payload
	 * that does not match the filter's `type`, are skipped and reported
	 * back; the remaining ones are applied in a single state write.
	 */
	applyFilterSelections: (
		selections: Array<FDSFilterSelection>
	) => FDSFilterWriteResult;

	/**
	 * Deactivates the listed filters, or every filter when `filterIds`
	 * is omitted.
	 */
	clearFilterSelections: (filterIds?: Array<string>) => FDSFilterWriteResult;
}
