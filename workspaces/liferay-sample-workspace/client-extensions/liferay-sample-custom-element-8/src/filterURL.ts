/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

// Keeping the filters of this element in the page URL, so that a filtered
// data set can be shared as a link and survives a reload or the back button.
//
// A data set filtering for itself already does all of this, under its own
// "_fdsConfig" parameter. None of it comes along when a client extension
// takes the filtering over: the connection carries an OData expression to the
// data set for the request and nowhere else, and the data set could not put
// that expression in a URL anyway, since it cannot turn one back into a
// filter UI it knows nothing about. So the element keeps its own parameter,
// beside the one the data set keeps, and this module is what that costs.

import {Selections} from './filters';

/**
 * What the element has applied, in the shape it travels in. The manual
 * expression and the selections are mutually exclusive, since only one of the
 * two ways of filtering is ever on screen.
 */
export interface FilterURLState {
	expression?: string;
	selections?: Selections;
}

/**
 * The parameter this element keeps its filters in, named after the data set
 * so that two data sets on one page do not read each other's filters. The
 * data set's own parameter is "${id}_fdsConfig", and this sits beside it.
 */
function getParameterName(fdsName: string): string {
	return `${fdsName}_ceFilters`;
}

/**
 * The filters the URL carries, or null when it carries none.
 *
 * Everything is checked rather than trusted: a URL is hand-editable, and the
 * previous visit it came from may have been an older version of this element.
 * Anything that does not survive the check is dropped, so a stale link
 * filters by as much of itself as still holds instead of failing.
 */
export function readFilterURLState(fdsName: string): FilterURLState | null {
	const parameter = new URLSearchParams(window.location.search).get(
		getParameterName(fdsName)
	);

	if (!parameter) {
		return null;
	}

	let parsed: unknown;

	try {
		parsed = JSON.parse(parameter);
	}
	catch (error) {
		return null;
	}

	if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
		return null;
	}

	const {expression, selections} = parsed as Record<string, unknown>;

	if (typeof expression === 'string') {
		return {expression};
	}

	if (!selections || typeof selections !== 'object') {
		return null;
	}

	const checked: Record<string, ReadonlyArray<string>> = {};

	Object.entries(selections as Record<string, unknown>).forEach(
		([filterId, values]) => {
			if (!Array.isArray(values)) {
				return;
			}

			const strings = values.filter(
				(value): value is string => typeof value === 'string'
			);

			if (strings.length) {
				checked[filterId] = strings;
			}
		}
	);

	return {selections: checked};
}

/**
 * Puts the given filters in the URL, or takes the parameter out when there
 * are none: the address of the unfiltered data set is the plain one.
 *
 * Only this element's parameter is touched. The data set writes its own the
 * same way, so the two survive each other as long as neither rebuilds the
 * query string from scratch.
 *
 * The first write of a visit replaces the current entry and every later one
 * pushes, which is what makes the back button walk through the filters the
 * user applied rather than through an entry they never chose.
 *
 * The value is plain JSON, so the query string percent-encodes every brace,
 * quote, and colon in it. The data set spends a dependency on JsonURL to
 * avoid exactly that, and its parameter stays readable where this one does
 * not; matching it would mean taking that dependency here too.
 */
export function writeFilterURLState(
	fdsName: string,
	filterURLState: FilterURLState
): void {
	const parameterName = getParameterName(fdsName);
	const parameters = new URLSearchParams(window.location.search);

	const applied = Boolean(
		filterURLState.expression ||
			Object.values(filterURLState.selections || {}).some(
				(values) => values.length
			)
	);

	const written = parameters.has(parameterName);

	if (applied) {
		parameters.set(parameterName, JSON.stringify(filterURLState));
	}
	else if (written) {
		parameters.delete(parameterName);
	}
	else {
		return;
	}

	const search = parameters.toString();

	const url = `${window.location.pathname}${search ? `?${search}` : ''}`;

	// The data set reaches for Liferay.SPA when one is running, so that a
	// single page application knows where it now is. This element cannot:
	// that is internal portal API. Under SPA navigation the entry written
	// here is therefore the browser's alone, which is one more thing the data
	// set already got right and a client extension has to live without.

	if (written) {
		window.history.pushState(
			{...window.history.state},
			document.title,
			url
		);
	}
	else {
		window.history.replaceState(
			{...window.history.state},
			document.title,
			url
		);
	}
}
