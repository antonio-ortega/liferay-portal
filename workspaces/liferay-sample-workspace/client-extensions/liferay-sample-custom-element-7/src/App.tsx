/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {SearchSubscription, subscribeSearch} from '@liferay/js-api/data-set';
import React, {useEffect, useRef, useState} from 'react';

interface AppProps {
	fdsName: string;
}

function App({fdsName}: AppProps) {
	const [searchSubscription, setSearchSubscription] =
		useState<SearchSubscription | null>(null);
	const searchSubscriptionRef = useRef<SearchSubscription | null>(null);
	const [query, setQuery] = useState('');

	useEffect(() => {
		subscribeSearch(
			fdsName,
			(queryString: string) => {
				setQuery(queryString);
			},
			{timeout: 10000}
		)
			.then((subscription: SearchSubscription) => {
				searchSubscriptionRef.current = subscription;
				setSearchSubscription(subscription);
			})
			.catch((error: Error) => {
				console.warn(
					`[liferay-sample-custom-element-7] ${error.message}`
				);
			});

		return () => {
			searchSubscriptionRef.current?.dispose();
			searchSubscriptionRef.current = null;
		};
	}, [fdsName]);

	const handleSearch = () => {
		if (!searchSubscription) {
			return;
		}

		searchSubscription.setSearch(query);
	};

	return (
		<div style={{display: 'flex', gap: '0.5rem', padding: '1rem'}}>
			<input
				className="form-control"
				disabled={!searchSubscription}
				onChange={(event) => setQuery(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === 'Enter') {
						handleSearch();
					}
				}}
				placeholder={
					searchSubscription
						? `Search in ${fdsName}`
						: `Waiting for FDS "${fdsName}"...`
				}
				style={{flex: 1}}
				type="text"
				value={query}
			/>

			<button
				className="btn btn-primary"
				disabled={!searchSubscription}
				onClick={handleSearch}
				type="button"
			>
				Search
			</button>
		</div>
	);
}

export default App;
