/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {render, screen} from '@testing-library/react';
import React from 'react';

import '@testing-library/jest-dom';

import ViewErrorBoundary from '../../src/main/resources/META-INF/resources/views/ViewErrorBoundary';

const ERROR_MESSAGE = 'this-visualization-mode-could-not-be-displayed';

function BrokenView(): React.ReactElement {
	throw new Error('Broken');
}

describe('ViewErrorBoundary', () => {
	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('renders its view when it does not throw', () => {
		render(
			<ViewErrorBoundary>
				<div>Sample view</div>
			</ViewErrorBoundary>
		);

		expect(screen.getByText('Sample view')).toBeInTheDocument();
		expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument();
	});

	it('shows an error in place of a view that throws while rendering', () => {
		render(
			<div>
				<span>Management bar</span>

				<ViewErrorBoundary>
					<BrokenView />
				</ViewErrorBoundary>
			</div>
		);

		expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
		expect(screen.getByText('Management bar')).toBeInTheDocument();
	});

	it('recovers when it is rendered for another view', () => {
		const {rerender} = render(
			<ViewErrorBoundary key="broken">
				<BrokenView />
			</ViewErrorBoundary>
		);

		rerender(
			<ViewErrorBoundary key="working">
				<div>Sample view</div>
			</ViewErrorBoundary>
		);

		expect(screen.getByText('Sample view')).toBeInTheDocument();
		expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument();
	});
});
