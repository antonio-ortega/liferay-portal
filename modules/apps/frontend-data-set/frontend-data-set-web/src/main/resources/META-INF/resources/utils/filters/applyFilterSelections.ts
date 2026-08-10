/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {IBaseFilterState} from '../types';
import {activateFilter} from './activateFilter';
import {deactivateFilter} from './deactivateFilter';
import {validateSelectedData} from './validateSelectedData';

import type {
	FDSFilterSelection,
	FDSFilterWriteResult,
} from '@liferay/js-api/data-set';

export interface ApplyFilterSelectionsResult extends FDSFilterWriteResult {
	filters: Array<IBaseFilterState>;

	/**
	 * Why each rejected id was rejected, so the caller can log something
	 * actionable instead of a bare list of ids.
	 */
	rejectionMessages: Array<string>;
}

/**
 * Applies selections coming from outside the widget — today, from an
 * `FDSConnection` held by a Client Extension — to the current filters.
 *
 * Two things have to happen here rather than at the caller. First, a
 * consumer can only drive filters the FDS declares: it cannot create new
 * ones, and it cannot address a filter that has been removed from the
 * configuration, so unknown ids are dropped. Second, activating a filter
 * means recomputing its OData query and its selection label through the
 * implementation registered for its `type`, which is what
 * `activateFilter` does; writing raw `selectedData` into the state would
 * leave those derived fields stale.
 *
 * Rejected entries are skipped, never fatal: the accepted ones are still
 * applied, so a consumer that is partially out of sync with the FDS
 * configuration still gets the filters it got right.
 */
export function applyFilterSelections({
	filters,
	selections,
}: {
	filters: Array<IBaseFilterState>;
	selections: Array<FDSFilterSelection>;
}): ApplyFilterSelectionsResult {
	const activations = new Map<string, IBaseFilterState>();

	const rejectionMessages: Array<string> = [];
	const unknownFilterIds: Array<string> = [];
	const invalidFilterIds: Array<string> = [];

	for (const {filterId, selectedData} of selections) {
		const filter = filters.find(({id}) => id === filterId);

		if (!filter) {
			unknownFilterIds.push(filterId);

			rejectionMessages.push(
				`"${filterId}" is not declared by this data set. Declared filters: ${filters.map(({id}) => id).join(', ') || '(none)'}`
			);

			continue;
		}

		const validationError = validateSelectedData({filter, selectedData});

		if (validationError) {
			invalidFilterIds.push(filterId);

			rejectionMessages.push(`"${filterId}": ${validationError}`);

			continue;
		}

		activations.set(filterId, activateFilter({filter, selectedData}));
	}

	const rejectedFilterIds = [...unknownFilterIds, ...invalidFilterIds];

	return {
		accepted: activations.size > 0,
		filters: activations.size
			? filters.map((filter) => activations.get(filter.id) ?? filter)
			: filters,
		rejectionMessages,
		...(rejectedFilterIds.length
			? {
					reason: unknownFilterIds.length
						? ('unknown-filter' as const)
						: ('invalid-selected-data' as const),
					rejectedFilterIds,
				}
			: {}),
	};
}

/**
 * Deactivates the given filters, or every filter when `filterIds` is
 * omitted. Unknown ids are reported the same way as in
 * `applyFilterSelections`.
 */
export function clearFilterSelections({
	filterIds,
	filters,
}: {
	filterIds?: Array<string>;
	filters: Array<IBaseFilterState>;
}): ApplyFilterSelectionsResult {
	if (!filterIds) {
		return {
			accepted: true,
			filters: filters.map(deactivateFilter),
			rejectionMessages: [],
		};
	}

	const declaredIds = new Set(filters.map(({id}) => id));

	const rejectedFilterIds = filterIds.filter((id) => !declaredIds.has(id));

	const clearedIds = new Set(filterIds.filter((id) => declaredIds.has(id)));

	return {
		accepted: clearedIds.size > 0,
		filters: clearedIds.size
			? filters.map((filter) =>
					clearedIds.has(filter.id)
						? deactivateFilter(filter)
						: filter
				)
			: filters,
		rejectionMessages: rejectedFilterIds.map(
			(id) => `"${id}" is not declared by this data set.`
		),
		...(rejectedFilterIds.length
			? {reason: 'unknown-filter' as const, rejectedFilterIds}
			: {}),
	};
}
