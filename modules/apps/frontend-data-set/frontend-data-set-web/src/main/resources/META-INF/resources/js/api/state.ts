/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

// What the data set adds to the state on top of the published contract. It
// stays here, rather than in "@liferay/js-api", because only the data set
// deals with it: a consumer influences the data set through the FDSConnection
// API alone, and the package publishes the shared contracts only.

import type {FDSState} from '@liferay/js-api/data-set';

/**
 * The whole shape of the data set atom, as the connection reads it: the
 * published state, plus the filters the data set declares in its
 * configuration.
 *
 * Those filters are absent from `FDSState`, which is what the atom is bound
 * to, and that is what makes writing them a compile error rather than a
 * convention.
 *
 * `filters` is readonly, like the rest of the state once it is read: the
 * connection reads this shape through `Liferay.State.read()`, which hands
 * back a deep frozen value.
 */
export interface FDSAtomState extends FDSState {
	readonly filters?: ReadonlyArray<FDSAtomStateFilter>;
}

/**
 * A declared filter as the connection needs to read it, which is the part of
 * the data set's filter state a consumer can act on without understanding the
 * filter. Everything the data set tracks to draw the filter and to work out
 * what it matches is left out, so a filter type it grows a new member for
 * needs nothing here.
 *
 * `type` is a plain string on purpose: a consumer reads it to recognize the
 * filters it means to replace, and a type the data set adds arrives as a value
 * it does not know rather than as a change to this contract.
 */
interface FDSAtomStateFilter {
	readonly active?: boolean;
	readonly id: string;
	readonly label: string;

	/**
	 * What the data set contributes to the request for this filter, which it
	 * writes as it applies the filter and drops as it clears it. Absent for a
	 * filter the data set is not applying.
	 */
	readonly odataFilterString?: string;

	/**
	 * What is picked now, shaped after the filter type. Only the selection
	 * members are declared, because those are the only ones handed over: the
	 * data set copies `preloadedData` in here while preloading, so this covers
	 * both what the configuration picked and what the user picked since.
	 */
	readonly selectedData?: {
		readonly exclude?: boolean;
		readonly selectedItems?: ReadonlyArray<{readonly value: string}>;
	} | null;

	readonly type: string;
}
