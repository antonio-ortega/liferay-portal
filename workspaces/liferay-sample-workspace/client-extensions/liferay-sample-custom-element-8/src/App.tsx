/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

// The "@liferay/frontend-data-set-web/api" import-map module is resolved at
// runtime by the portal. At build time, tsconfig "paths" redirects it to the
// types provided by "@liferay/js-api", so the value and its types come from a
// single import.

// This element declares that it owns the filtering when it connects, so the
// data set knows what to stop offering: taking the filtering over drops its
// filters dropdown and its filter chips, and disconnecting hands them back.
// Driving the search of a data set is what
// "liferay-sample-custom-element-7" shows.

// Owning the filtering means owning what a data set otherwise does with it:
// the filters a data set applies itself go in the page URL, and the ones sent
// through a connection do not. So this element keeps them there itself, in a
// parameter of its own beside the data set's. Every apply below therefore
// comes in two forms, one that only filters and one that also records what it
// filtered by, because restoring from the URL must not write the URL back.

import {
	FDSConnection,
	FDSConnectionInfo,
} from '@liferay/frontend-data-set-web/api';
import React, {useEffect, useRef, useState} from 'react';

import AppliedFilters from './AppliedFilters';
import FilterPanels from './FilterPanels';
import {readFilterURLState, writeFilterURLState} from './filterURL';
import {
	FILTERS,
	FilterDefinition,
	MANUAL_FILTER_ID,
	Selections,
	getOdataFilterString,
	getSelectedValues,
	getValidSelections,
	toggleOption,
} from './filters';

interface AppProps {
	fdsName: string;
}

function App({fdsName}: AppProps) {
	const [disabled, setDisabled] = useState<boolean>(true);
	const [expression, setExpression] = useState('');
	const [manual, setManual] = useState(false);
	const [selections, setSelections] = useState<Selections>({});
	const fdsConnectionRef = useRef<FDSConnection | null>(null);
	const readyRef = useRef(false);

	const applySelections = (selections: Selections) => {
		setSelections(selections);

		fdsConnectionRef.current?.setFilters(
			FILTERS.map((filterDefinition) => ({
				id: filterDefinition.id,
				odataFilterString: getOdataFilterString(
					filterDefinition,
					getSelectedValues(selections, filterDefinition.id)
				),
			}))
		);
	};

	const applyExpression = (expression: string) => {
		setExpression(expression);

		fdsConnectionRef.current?.setFilters(
			expression
				? [{id: MANUAL_FILTER_ID, odataFilterString: expression}]
				: []
		);
	};

	// What the user did, as opposed to what the URL already said: only a
	// change the user makes belongs in the browser's history.

	const changeSelections = (selections: Selections) => {
		applySelections(selections);

		writeFilterURLState(fdsName, {selections});
	};

	const changeExpression = (expression: string) => {
		applyExpression(expression);

		writeFilterURLState(fdsName, {expression});
	};

	// Filters the URL carries, applied without being written back. Which of
	// the two ways of filtering was in use is restored along with them, since
	// a manually typed expression can only be seen or undone in the mode that
	// produced it.
	//
	// Nothing can be applied before the connection is ready, so a URL that
	// arrives first has to wait for it. The data set is not told any of this
	// is coming and has already asked for the unfiltered page by then, which
	// is why a filtered link shows its results twice: once unfiltered, then
	// again as the filters land.

	const restoreFromURL = () => {
		if (!readyRef.current) {
			return;
		}

		const filterURLState = readFilterURLState(fdsName);

		if (filterURLState?.expression !== undefined) {
			setManual(true);
			setSelections({});

			applyExpression(filterURLState.expression);

			return;
		}

		setManual(false);
		setExpression('');

		applySelections(getValidSelections(filterURLState?.selections || {}));
	};

	useEffect(() => {

		// The connection reports the search query to every consumer, whether
		// it drives the search or not. This one only filters, so it ignores it.

		fdsConnectionRef.current = new FDSConnection(
			fdsName,
			{
				search: () => {},
			},
			(fdsConnectionInfo: FDSConnectionInfo) => {
				readyRef.current = fdsConnectionInfo.status === 'ready';

				setDisabled(!readyRef.current);

				if (readyRef.current) {
					restoreFromURL();
				}
			},
			{owns: ['filters']}
		);

		return () => {
			if (fdsConnectionRef?.current) {
				fdsConnectionRef?.current.disconnect();
				fdsConnectionRef.current = null;
			}
		};
	}, [fdsName]);

	// The back and forward buttons move a data set between filters the way
	// they move it between pages, and the data set listens for them to do it.
	// Nothing tells this element, so it listens too.

	useEffect(() => {
		const handlePopState = () => restoreFromURL();

		window.addEventListener('popstate', handlePopState);

		return () => window.removeEventListener('popstate', handlePopState);
	}, [fdsName]);

	// Only one of the two ways of filtering is on screen at a time, so
	// leaving one behind applied would filter the data set by something the
	// user can no longer see, let alone undo.

	const handleSwapMode = () => {
		setExpression('');
		setSelections({});
		setManual((manual) => !manual);

		fdsConnectionRef.current?.clearFilters();

		writeFilterURLState(fdsName, {});
	};

	return (
		<div className="p-3">
			<div className="align-items-center d-flex justify-content-between mb-3">
				<h4 className="h5 mb-0">Filters</h4>

				<button
					className="btn btn-unstyled link"
					disabled={disabled}
					onClick={handleSwapMode}
					type="button"
				>
					{manual ? 'Choose from the options' : 'Filter manually'}
				</button>
			</div>

			{manual ? (
				<div className="d-flex" style={{gap: '0.5rem'}}>
					<input
						aria-label="OData filter expression"
						className="form-control"
						disabled={disabled}
						onChange={(event) => setExpression(event.target.value)}
						placeholder="Filter with OData, such as name eq 'Liferay'"
						style={{minWidth: 0}}
						type="text"
						value={expression}
					/>

					<button
						className="btn btn-primary flex-shrink-0"
						disabled={disabled || !expression.trim()}
						onClick={() => changeExpression(expression.trim())}
						type="button"
					>
						Apply
					</button>
				</div>
			) : (
				<>
					<AppliedFilters
						onClearAll={() => changeSelections({})}
						onClearFilter={(filterId: string) =>
							changeSelections({...selections, [filterId]: []})
						}
						selections={selections}
					/>

					<FilterPanels
						disabled={disabled}
						onToggleOption={(
							filterDefinition: FilterDefinition,
							value: string
						) =>
							changeSelections(
								toggleOption(
									selections,
									filterDefinition,
									value
								)
							)
						}
						selections={selections}
					/>
				</>
			)}
		</div>
	);
}

export default App;
