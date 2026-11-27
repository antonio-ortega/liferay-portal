/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

import ViewErrorAlert from './ViewErrorAlert';

interface IViewErrorBoundaryProps {
	children: React.ReactNode;
}

interface IViewErrorBoundaryState {
	hasError: boolean;
}

/**
 * Keeps a view that throws while rendering from taking down the rest of the
 * data set (management bar, search, pagination, view picker). Render it with
 * a key that changes with the active view so that it recovers on a view switch.
 */
export default class ViewErrorBoundary extends React.Component<
	IViewErrorBoundaryProps,
	IViewErrorBoundaryState
> {
	static getDerivedStateFromError(): IViewErrorBoundaryState {
		return {hasError: true};
	}

	state = {hasError: false};

	componentDidCatch(error: unknown) {
		console.error(
			'The visualization mode caused an error when trying to render.',
			error
		);
	}

	render() {
		if (this.state.hasError) {
			return <ViewErrorAlert />;
		}

		return this.props.children;
	}
}
