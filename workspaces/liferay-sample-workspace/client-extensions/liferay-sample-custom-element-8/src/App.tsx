/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import FilterToggle from './FilterToggle';
import SearchBar from './SearchBar';

interface AppProps {
	fdsName: string;
	filterId: string;
}

function App({fdsName, filterId}: AppProps) {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				padding: '1rem',
			}}
		>
			<SearchBar fdsName={fdsName} />

			<FilterToggle fdsName={fdsName} filterId={filterId} />
		</div>
	);
}

export default App;
