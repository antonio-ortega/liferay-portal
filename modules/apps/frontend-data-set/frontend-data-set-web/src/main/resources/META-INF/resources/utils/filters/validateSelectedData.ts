/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {IBaseFilterState, ISelectionFilterState} from '../types';

/**
 * Validates a selection payload coming from outside the widget (today,
 * from an `FDSConnection` held by a Client Extension) before it is
 * written into the FDS state.
 *
 * The widget's own filter components produce well-formed payloads by
 * construction; an external caller does not, so the shape is checked
 * against the filter `type` here. `clientExtension` filters are opaque:
 * only the Client Extension that contributed the filter knows what its
 * `selectedData` looks like, so anything is accepted for them.
 *
 * Returns `null` when the payload is valid, or a human readable reason
 * when it is not.
 */
export function validateSelectedData({
	filter,
	selectedData,
}: {
	filter: IBaseFilterState;
	selectedData: unknown;
}): string | null {
	if (
		selectedData === null ||
		typeof selectedData !== 'object' ||
		Array.isArray(selectedData)
	) {
		return 'selectedData must be a plain object';
	}

	if (filter.type === 'selection') {
		return validateSelectionFilterSelectedData({
			filter: filter as ISelectionFilterState,
			selectedData: selectedData as Record<string, unknown>,
		});
	}

	if (filter.type === 'dateRange' || filter.type === 'dateTimeRange') {
		return validateDateRangeFilterSelectedData(
			selectedData as Record<string, unknown>
		);
	}

	return null;
}

const DATE_PART_KEYS = ['day', 'hour', 'minute', 'month', 'year'];

function validateDateRangeFilterSelectedData(
	selectedData: Record<string, unknown>
): string | null {
	const bounds = ['from', 'to'];

	if (!bounds.some((bound) => selectedData[bound])) {
		return 'selectedData must define at least one of "from" or "to"';
	}

	for (const bound of bounds) {
		const value = selectedData[bound];

		if (value === undefined || value === null) {
			continue;
		}

		if (typeof value !== 'object' || Array.isArray(value)) {
			return `selectedData.${bound} must be an object of date parts or null`;
		}

		const dateParts = value as Record<string, unknown>;

		for (const key of DATE_PART_KEYS) {
			if (
				dateParts[key] !== undefined &&
				typeof dateParts[key] !== 'number'
			) {
				return `selectedData.${bound}.${key} must be a number`;
			}
		}
	}

	return null;
}

function validateSelectionFilterSelectedData({
	filter,
	selectedData,
}: {
	filter: ISelectionFilterState;
	selectedData: Record<string, unknown>;
}): string | null {
	const {exclude, selectedItems} = selectedData;

	if (exclude !== undefined && typeof exclude !== 'boolean') {
		return 'selectedData.exclude must be a boolean';
	}

	if (!Array.isArray(selectedItems)) {
		return 'selectedData.selectedItems must be an array';
	}

	if (
		selectedItems.some(
			(item) =>
				!item ||
				typeof item !== 'object' ||
				typeof item.value !== 'string'
		)
	) {
		return 'every selectedData.selectedItems entry must be an object with a string "value"';
	}

	if (!filter.multiple && selectedItems.length > 1) {
		return `filter "${filter.id}" is not multiple, so selectedData.selectedItems cannot hold more than one item`;
	}

	// When the filter offers a closed set of options (no autocomplete),
	// the caller cannot invent values that the filter does not know
	// about. With autocomplete the options are fetched on demand, so
	// there is no local list to validate against.

	if (!filter.autocompleteEnabled && filter.items?.length) {
		const allowedValues = new Set(filter.items.map(({value}) => value));

		const unknownValues = selectedItems
			.map(({value}) => value)
			.filter((value) => !allowedValues.has(value));

		if (unknownValues.length) {
			return `filter "${filter.id}" does not offer the value(s): ${unknownValues.join(', ')}`;
		}
	}

	return null;
}
