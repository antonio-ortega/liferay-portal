/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Atom, Immutable, State} from '@liferay/frontend-js-state-web';
import {deepClone} from 'frontend-js-web';
import {useEffect, useRef} from 'react';

import {
	ApplyFilterSelectionsResult,
	applyFilterSelections,
	clearFilterSelections,
} from './filters/applyFilterSelections';
import {IFDSState} from './types';

import type {
	FDSFilterSelection,
	FDSFilterWriteResult,
} from '@liferay/js-api/data-set';

import type {FDSCommands} from '../js/api/fdsCommands';

/**
 * Publishes this data set's filter write operations under
 * `${fdsName}_fdsCommands` so an `FDSConnection` can invoke them.
 *
 * The connection lives in `js/api/`, which cannot import widget code
 * (`@liferay/portal/no-api-submodule-import`), and filter writes need
 * widget code: `activateFilter` recomputes the OData query and the
 * selection label through the implementation registered for the
 * filter's `type`. The state registry — already the channel the
 * connection uses to find the FDS — is what carries those operations
 * across the boundary.
 *
 * The commands are published once and read the latest state through a
 * ref, so they never close over a stale render.
 */
export function useFDSCommands({
	fdsName,
	globalFDSState,
	setGlobalFDSState,
}: {
	fdsName?: string;
	globalFDSState: Immutable<IFDSState>;
	setGlobalFDSState: (state: IFDSState) => void;
}): void {
	const stateRef = useRef(globalFDSState);
	const setStateRef = useRef(setGlobalFDSState);

	useEffect(() => {
		stateRef.current = globalFDSState;
		setStateRef.current = setGlobalFDSState;
	}, [globalFDSState, setGlobalFDSState]);

	useEffect(() => {
		if (!fdsName) {
			return;
		}

		const key = `${fdsName}_fdsCommands`;

		const commandsAtom =
			(State.__unsafe__.getAtomOrSelectorKey(
				key
			) as Atom<FDSCommands | null> | null) ??
			State.atom<FDSCommands | null>(key, null);

		const readState = (): IFDSState => deepClone(stateRef.current);

		const write = (
			state: IFDSState,
			result: ApplyFilterSelectionsResult
		): FDSFilterWriteResult => {
			if (result.accepted) {
				setStateRef.current({...state, filters: result.filters});
			}

			result.rejectionMessages.forEach((message) => {
				console.warn(`[FDS ${fdsName}] Ignored filter ${message}`);
			});

			return {
				accepted: result.accepted,
				...(result.reason ? {reason: result.reason} : {}),
				...(result.rejectedFilterIds
					? {rejectedFilterIds: result.rejectedFilterIds}
					: {}),
			};
		};

		const commands: FDSCommands = {
			applyFilterSelections: (selections: Array<FDSFilterSelection>) => {
				const state = readState();

				return write(
					state,
					applyFilterSelections({
						filters: state.filters,
						selections,
					})
				);
			},
			clearFilterSelections: (filterIds?: Array<string>) => {
				const state = readState();

				return write(
					state,
					clearFilterSelections({filterIds, filters: state.filters})
				);
			},
		};

		State.write(commandsAtom, commands);

		return () => {
			State.write(commandsAtom, null);
		};
	}, [fdsName]);
}
