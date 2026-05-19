/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	DataSetFilters,
	FDSFilterState,
	dataSetFilters,
} from '@liferay/js-api/data-set';
import React, {useEffect, useState} from 'react';

interface FilterToggleProps {
	fdsName: string;
	filterId: string;
}

function FilterToggle({fdsName, filterId}: FilterToggleProps) {
	const [filtersApi, setFiltersApi] = useState<DataSetFilters | null>(null);
	const [filters, setFilters] = useState<Array<FDSFilterState>>([]);

	useEffect(() => {
		let disposed = false;
		let subscription: {dispose: () => void} | undefined;

		dataSetFilters(fdsName)
			.then((resolvedFilters) => {
				if (disposed) {
					return;
				}

				setFiltersApi(resolvedFilters);
				setFilters(resolvedFilters.get());

				subscription = resolvedFilters.subscribe((next) => {
					setFilters(next);
				});
			})
			.catch((error: Error) => {
				console.warn(
					`[liferay-sample-custom-element-8] ${error.message}`
				);
			});

		return () => {
			disposed = true;
			subscription?.dispose();
		};
	}, [fdsName]);

	const target = filters.find((filter) => filter.id === filterId);
	const hasSelection = Boolean(target?.selectedData);
	const isActive = target?.active ?? false;
	const isExcluded = Boolean(target?.selectedData?.exclude);

	const updateTarget = (
		transform: (filter: FDSFilterState) => FDSFilterState
	) => {
		if (!filtersApi) {
			return;
		}

		filtersApi.set(
			filters.map((filter) =>
				filter.id === filterId ? transform(filter) : filter
			)
		);
	};

	return (
		<div style={{display: 'flex', flexDirection: 'column'}}>
			<div style={{paddingBottom: '0.5rem'}}>
				{filtersApi
					? `Apply "${filterId}" filter in ${fdsName}`
					: `Waiting for FDS "${fdsName}"...`}
			</div>

			<div style={{display: 'flex', gap: '1rem'}}>
				<label
					style={{
						alignItems: 'center',
						display: 'flex',
						gap: '0.25rem',
					}}
				>
					<input
						checked={isActive}
						disabled={!filtersApi || !hasSelection}
						onChange={(event) => {
							const value = event.target.checked;

							updateTarget((filter) => ({
								...filter,
								active: value,
							}));
						}}
						type="checkbox"
					/>
					Active
				</label>

				<label
					style={{
						alignItems: 'center',
						display: 'flex',
						gap: '0.25rem',
					}}
				>
					<input
						checked={isExcluded}
						disabled={!filtersApi || !hasSelection}
						onChange={(event) => {
							const value = event.target.checked;

							updateTarget((filter) => ({
								...filter,
								selectedData: {
									...filter.selectedData,
									exclude: value,
								},
							}));
						}}
						type="checkbox"
					/>
					Exclude
				</label>
			</div>
		</div>
	);
}

export default FilterToggle;
