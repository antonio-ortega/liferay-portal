/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {DataSetSearch, dataSetSearch} from '@liferay/js-api/data-set';
import React, {useEffect, useState} from 'react';

interface AppProps {
	fdsName: string;
}

function App({fdsName}: AppProps) {
	const [search, setSearchApi] = useState<DataSetSearch | null>(null);
	const [query, setQuery] = useState('');

	useEffect(() => {
		let disposed = false;
		let subscription: {dispose: () => void} | undefined;

		dataSetSearch(fdsName)
			.then((resolvedSearch) => {
				if (disposed) {
					return;
				}

				setSearchApi(resolvedSearch);
				setQuery(resolvedSearch.get());

				subscription = resolvedSearch.subscribe((next) => {
					setQuery(next);
				});
			})
			.catch((error: Error) => {
				console.warn(
					`[liferay-sample-custom-element-7] ${error.message}`
				);
			});

		return () => {
			disposed = true;
			subscription?.dispose();
		};
	}, [fdsName]);

	const handleSearch = () => {
		if (!search) {
			return;
		}

		search.set(query);
	};

	return (
		<div style={{display: 'flex', gap: '0.5rem', padding: '1rem'}}>
			<input
				className="form-control"
				disabled={!search}
				onChange={(event) => setQuery(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						handleSearch();
					}
				}}
				placeholder={
					search
						? `Search in ${fdsName}`
						: `Waiting for FDS "${fdsName}"...`
				}
				style={{flex: 1}}
				type="text"
				value={query}
			/>

			<button
				className="btn btn-primary"
				disabled={!search}
				onClick={handleSearch}
				type="button"
			>
				Search
			</button>
		</div>
	);
}

export default App;
