/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

// The "@liferay/frontend-data-set-web/api" import-map module is resolved at
// runtime by the portal. At build time, tsconfig "paths" redirects it to the
// types provided by "@liferay/js-api", so the value and its types come from a
// single import.

// Filtering belongs either to the data set or to this element, never to both.
// The data set sorts that out on its own: from the first setFilters() call on,
// the filters it declares no longer reach the request, so it stops showing a
// dropdown that would no longer tell the truth.

import {
	FDSConnection,
	FDSConnectionFilter,
	FDSConnectionInfo,
	FDSConnectionStatus,
	FDSFilterDate,
	FDSFilterDateBound,
	FDSFilterInfo,
} from '@liferay/frontend-data-set-web/api';
import React, {useEffect, useRef, useState} from 'react';

import ColorFilter, {
	ColorSelection,
	getSelectionOdataFilterString,
} from './ColorFilter';
import DateRangeFilter, {
	DateRangeSelection,
	NO_DATE_RANGE,
	getDateRangeOdataFilterString,
	toDateRangeValue,
} from './DateRangeFilter';

interface AppProps {
	fdsName: string;
}

const COLOR_FILTER_ID = 'color';

const DATE_FILTER_ID = 'date';

const NO_COLORS: ColorSelection = {exclude: false, values: []};

type ColorFilterMode = 'picker' | 'raw';

const PLACEHOLDERS: Record<FDSConnectionStatus, string> = {
	connecting: 'waiting',
	disconnected: 'Search is not available',
	ready: 'Type search query...',
	timeout: 'Search is not available',
};

const pad = (value: number) => String(value).padStart(2, '0');

function formatDate(date: FDSFilterDate | null): string {
	if (!date) {
		return 'any';
	}

	const {day, hour, minute, month, year} = date;

	const time = hour === undefined ? '' : ` ${pad(hour)}:${pad(minute ?? 0)}`;

	return `${year}-${pad(month)}-${pad(day)}${time}`;
}

function formatDateBound(bound: FDSFilterDateBound | null): string {
	return bound === 'now' ? 'now' : formatDate(bound);
}

/**
 * What a filter matches, read off the description the data set hands over.
 * Narrowing on the type is what gives access to it.
 */
function describeFilter(filter: FDSFilterInfo): string {
	if (filter.type === 'selection') {
		if (filter.autocomplete) {
			return `values from ${filter.autocomplete.apiURL}`;
		}

		return `values: ${filter.items.map(({label}) => label).join(', ')}`;
	}

	return `between ${formatDateBound(filter.min)} and ${formatDateBound(
		filter.max
	)}`;
}

/**
 * What the data set would have filtered by on its own, which is where a
 * consumer starts from to behave the way it would have.
 */
function describePreselection(filter: FDSFilterInfo): string | null {
	if (filter.type === 'selection' && filter.preselection) {
		const {exclude, items} = filter.preselection;

		return `${exclude ? 'all but ' : ''}${items
			.map(({label}) => label)
			.join(', ')}`;
	}

	if (
		(filter.type === 'dateRange' || filter.type === 'dateTimeRange') &&
		filter.preselection
	) {
		const {from, to} = filter.preselection;

		return `${formatDate(from)} to ${formatDate(to)}`;
	}

	return null;
}

/**
 * A heading for one of the things this element drives, so that the search box
 * and the filters read as two separate jobs rather than one column of inputs.
 */
function SectionLabel({children}: {children: React.ReactNode}) {
	return (
		<div className="mb-2 section-label text-secondary text-uppercase">
			{children}
		</div>
	);
}

function App({fdsName}: AppProps) {
	const [colorFilterMode, setColorFilterMode] =
		useState<ColorFilterMode>('picker');
	const [colorSelection, setColorSelection] =
		useState<ColorSelection>(NO_COLORS);
	const [customExpression, setCustomExpression] = useState('');
	const [dateRangeSelection, setDateRangeSelection] =
		useState<DateRangeSelection>(NO_DATE_RANGE);
	const [disabled, setDisabled] = useState<boolean>(true);
	const [declaredFilters, setDeclaredFilters] = useState<
		Array<FDSFilterInfo>
	>([]);
	const [obeyedIds, setObeyedIds] = useState<Array<string> | null>(null);
	const [placeholder, setPlaceholder] = useState<string>(
		PLACEHOLDERS.connecting
	);
	const [query, setQuery] = useState('');
	const fdsConnectionRef = useRef<FDSConnection | null>(null);

	useEffect(() => {
		fdsConnectionRef.current = new FDSConnection(
			fdsName,
			{
				search: (query: string) => {
					setQuery(query);
				},
			},
			(fdsConnectionInfo: FDSConnectionInfo) => {
				setPlaceholder(PLACEHOLDERS[fdsConnectionInfo.status]);
				setDisabled(fdsConnectionInfo.status !== 'ready');

				// The filters the data set declares never change while this
				// element drives the filtering, so reading them once the
				// connection is ready is all it takes.

				if (fdsConnectionInfo.status === 'ready') {
					const filters: Array<FDSFilterInfo> =
						fdsConnectionRef.current?.getFilters() ?? [];

					setDeclaredFilters(filters);

					const colorFilter = filters.find(
						({id}) => id === COLOR_FILTER_ID
					);

					const dateFilter = filters.find(
						({id}) => id === DATE_FILTER_ID
					);

					if (dateFilter?.type === 'dateRange') {
						const selection =
							dateFilter.selection ?? dateFilter.preselection;

						setDateRangeSelection(
							selection
								? {
										from: toDateRangeValue(selection.from),
										to: toDateRangeValue(selection.to),
									}
								: NO_DATE_RANGE
						);
					}

					if (colorFilter?.type === 'selection') {
						const selection =
							colorFilter.selection ?? colorFilter.preselection;

						setColorSelection(
							selection
								? {
										exclude: selection.exclude,
										values: selection.items.map(
											({value}) => value
										),
									}
								: NO_COLORS
						);
					}
				}
			}
		);

		return () => {
			if (fdsConnectionRef?.current) {
				fdsConnectionRef?.current.disconnect();
				fdsConnectionRef.current = null;
			}
		};
	}, [fdsName]);

	// Until anything is checked or unchecked, the data set's own selection is
	// what this sample would apply.

	const isObeyed = ({active, id}: FDSFilterInfo) =>
		obeyedIds ? obeyedIds.includes(id) : active;

	const colorFilter = declaredFilters.find(({id}) => id === COLOR_FILTER_ID);

	const dateFilter = declaredFilters.find(({id}) => id === DATE_FILTER_ID);

	const obeyableFilters = declaredFilters.filter(
		({id}) => id !== COLOR_FILTER_ID && id !== DATE_FILTER_ID
	);

	const colorOdataFilterString = getSelectionOdataFilterString(
		COLOR_FILTER_ID,
		{
			...colorSelection,
			multiple:
				colorFilter?.type === 'selection' ? colorFilter.multiple : true,
		}
	);

	const rawOdataFilterString = customExpression.trim();

	const appliedFilter: FDSConnectionFilter =
		colorFilterMode === 'raw'
			? {id: 'custom', odataFilterString: rawOdataFilterString}
			: {
					id: COLOR_FILTER_ID,
					odataFilterString: colorOdataFilterString,
				};

	// What this element owns, the color filter or the expression standing in for
	// it, plus the range it drives on its own.

	const appliedFilters: Array<FDSConnectionFilter> = [
		appliedFilter,
		{
			id: DATE_FILTER_ID,
			odataFilterString: getDateRangeOdataFilterString(
				DATE_FILTER_ID,
				dateRangeSelection
			),
		},
	].filter(({odataFilterString}) => !!odataFilterString);

	const handleSearch = () => {
		fdsConnectionRef.current?.setSearch(query);
	};

	const handleApplyFilters = () => {
		const connectionFilters: Array<FDSConnectionFilter> = obeyableFilters
			.filter((filter) => !!filter.odataFilterString && isObeyed(filter))
			.map(({id, odataFilterString}) => ({id, odataFilterString}));

		fdsConnectionRef.current?.setFilters([
			...connectionFilters,
			...appliedFilters,
		]);
	};

	const handleClearFilters = () => {
		setColorSelection(NO_COLORS);
		setCustomExpression('');
		setDateRangeSelection(NO_DATE_RANGE);
		setObeyedIds([]);

		fdsConnectionRef.current?.clearFilters();
	};

	const toggleFilter = (filter: FDSFilterInfo) => {
		const ids = declaredFilters.filter(isObeyed).map(({id}) => id);

		setObeyedIds(
			isObeyed(filter)
				? ids.filter((id) => id !== filter.id)
				: [...ids, filter.id]
		);
	};

	return (
		<div className="fds-connection-app">
			<div>
				<SectionLabel>Search</SectionLabel>

				<div className="d-flex gap-sm">
					<input
						className="flex-grow-1 form-control"
						disabled={disabled}
						onChange={(event) => setQuery(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								handleSearch();
							}
						}}
						placeholder={placeholder}
						type="text"
						value={query}
					/>

					<button
						className="btn btn-primary"
						disabled={disabled}
						onClick={handleSearch}
						type="button"
					>
						Search
					</button>
				</div>
			</div>

			<hr className="m-0" />

			<div>
				<SectionLabel>Filters</SectionLabel>

				{colorFilterMode === 'raw' ? (
					<input
						className="form-control"
						disabled={disabled}
						onChange={(event) =>
							setCustomExpression(event.target.value)
						}
						placeholder="Filter with OData, such as name eq 'Liferay'"
						type="text"
						value={customExpression}
					/>
				) : null}

				{colorFilterMode === 'picker' &&
				colorFilter?.type === 'selection' ? (
					<ColorFilter
						disabled={disabled}
						items={colorFilter.items}
						label={colorFilter.label}
						onChange={setColorSelection}
						selection={colorSelection}
					/>
				) : null}

				{dateFilter ? (
					<div className="mt-3">
						<DateRangeFilter
							disabled={disabled}
							label={dateFilter.label}
							onChange={setDateRangeSelection}
							selection={dateRangeSelection}
						/>
					</div>
				) : null}

				<button
					className="btn btn-unstyled link-primary mt-2"
					disabled={disabled}
					onClick={() =>
						setColorFilterMode(
							colorFilterMode === 'raw' ? 'picker' : 'raw'
						)
					}
					type="button"
				>
					{colorFilterMode === 'raw'
						? 'Pick colors instead'
						: 'Write the expression by hand instead'}
				</button>
			</div>

			<div>
				<strong>Other filters declared in the data set</strong>

				{obeyableFilters.length ? (
					obeyableFilters.map((filter) => (
						<div className="form-check" key={filter.id}>
							<label>
								<input
									checked={isObeyed(filter)}
									className="form-check-input"
									disabled={
										disabled || !filter.odataFilterString
									}
									onChange={() => toggleFilter(filter)}
									type="checkbox"
								/>

								{filter.label}

								<code className="ml-2 text-secondary">
									{filter.odataFilterString ||
										'(not applied by the data set)'}
								</code>
							</label>

							<small className="d-block text-secondary">
								{describeFilter(filter)}

								{describePreselection(filter)
									? `, preselected: ${describePreselection(filter)}`
									: ''}
							</small>
						</div>
					))
				) : (
					<p className="text-secondary">
						This data set declares no other filter.
					</p>
				)}
			</div>

			<div className="d-flex gap-sm">
				<button
					className="btn btn-primary"
					disabled={disabled}
					onClick={handleApplyFilters}
					type="button"
				>
					Apply filters
				</button>

				<button
					className="btn btn-secondary"
					disabled={disabled}
					onClick={handleClearFilters}
					type="button"
				>
					Clear filters
				</button>
			</div>

			<div className="card mb-0">
				<div className="card-body">
					<SectionLabel>What this element will apply</SectionLabel>

					<code className="text-secondary">
						{appliedFilters.length
							? appliedFilters
									.map(
										({odataFilterString}) =>
											`(${odataFilterString})`
									)
									.join(' and ')
							: '(no filter)'}
					</code>
				</div>
			</div>
		</div>
	);
}

export default App;
