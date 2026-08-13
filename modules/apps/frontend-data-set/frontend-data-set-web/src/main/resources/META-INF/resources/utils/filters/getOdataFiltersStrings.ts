/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {FILTER_IMPLEMENTATIONS} from '../../management_bar/controls/filters/Filter';
import {IBaseFilterState, IFDSState} from '../types';

import type {FDSConnectionFilter} from '@liferay/js-api/data-set';

/**
 * The data set state as a connection leaves it, which only this module reads.
 *
 * `connectionFilters` stays out of `IFDSState` so that no data set code can
 * write it: keeping it out of the type the data set writes makes any attempt
 * to change it a compile error rather than a convention. Its element type is
 * the published one, so what the data set reads here is exactly what a
 * consumer wrote through the connection.
 *
 * It lives here, rather than next to `IFDSState`, because the modules that
 * consume `@liferay/frontend-data-set-web` types do not depend on
 * `@liferay/js-api`, and this file is internal to the data set.
 */
export interface IConnectedFDSState extends IFDSState {

	/**
	 * Absent while no connection drives the filtering, which is the case
	 * for every data set that has no external consumer. Once present, it
	 * supersedes `filters` as the only contribution to the request.
	 */
	connectionFilters?: ReadonlyArray<FDSConnectionFilter>;
}

/**
 * The OData expressions the data set sends along with the request, one per
 * filter in play.
 *
 * A connection that has taken over the filtering owns the whole
 * expression: the configured filters are then informative only, and the
 * consumer applies the ones it wants to obey.
 */
export function getOdataFiltersStrings(
	fdsState: IConnectedFDSState
): Array<string> {
	if (fdsState.connectionFilters) {
		return fdsState.connectionFilters
			.map(({odataFilterString}) => odataFilterString)
			.filter(Boolean);
	}

	const activeFilters: Array<IBaseFilterState> =
		fdsState.filters.filter((filter) => filter.active) || [];

	return activeFilters.map((filter) => {
		const filterImplementation = FILTER_IMPLEMENTATIONS[filter.type];

		return filterImplementation.getOdataString(filter);
	});
}

/**
 * Whether a connection has taken the filtering over, which the presence of the
 * slice it owns settles: it appears with the first `setFilters()` call and stays
 * from then on, so that dropping the expressions a consumer applied does not
 * hand the filtering back.
 *
 * The data set reads this to stop offering filter controls of its own, since
 * filtering belongs either to the data set or to the consumer, never to both. A
 * consumer that only reads the search never takes anything over, and leaves the
 * filter UI where it was.
 *
 * The state is taken in either form the data set has it in, frozen as it holds
 * it or cloned as it works on it, so that reading this costs no clone.
 */
export function isFilteringDelegated(
	fdsState: IConnectedFDSState | Liferay.State.Immutable<IConnectedFDSState>
): boolean {
	return Boolean(fdsState.connectionFilters);
}
