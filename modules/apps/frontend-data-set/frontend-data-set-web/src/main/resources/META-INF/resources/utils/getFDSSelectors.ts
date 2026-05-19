/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Atom, Immutable, Selector, State} from '@liferay/frontend-js-state-web';

import {IBaseFilterState, IFDSState} from './types';

type Getter = <T>(atomOrSelector: Atom<T> | Selector<T>) => Immutable<T>;

const getOrCreateSelector = <T>(
	key: string,
	deriveValue: (get: Getter) => T
): Selector<T> => {
	const existing = State.__unsafe__.getAtomOrSelectorKey(key) as
		| Selector<T>
		| null;

	return existing ?? State.selector<T>(key, deriveValue);
};

const getFDSActiveFiltersSelector = (
	fdsAtom: Atom<IFDSState>
): Selector<Array<IBaseFilterState>> =>
	getOrCreateSelector(`${fdsAtom.key}_activeFilters`, (get) =>
		get(fdsAtom).filters.filter((filter) => filter.active)
	);

const getFDSFilterByIdSelector = (
	fdsAtom: Atom<IFDSState>,
	filterId: string
): Selector<IBaseFilterState | undefined> =>
	getOrCreateSelector(`${fdsAtom.key}_filter_${filterId}`, (get) =>
		get(fdsAtom).filters.find((filter) => filter.id === filterId)
	);

const getFDSSearchQuerySelector = (
	fdsAtom: Atom<IFDSState>
): Selector<string> =>
	getOrCreateSelector(
		`${fdsAtom.key}_searchQuery`,
		(get) => get(fdsAtom).search.query
	);

export {
	getFDSActiveFiltersSelector,
	getFDSFilterByIdSelector,
	getFDSSearchQuerySelector,
};
