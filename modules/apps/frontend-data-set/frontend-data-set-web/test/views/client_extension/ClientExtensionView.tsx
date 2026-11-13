/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import '@testing-library/jest-dom';

import FrontendDataSetContext from '../../../src/main/resources/META-INF/resources/FrontendDataSetContext';
import ClientExtensionView from '../../../src/main/resources/META-INF/resources/views/client_extension/ClientExtensionView';

import type {
	FDSVisualizationMode,
	FDSVisualizationModeArgs,
} from '@liferay/js-api/data-set';

const MODULE_URL = 'http://localhost/o/cx/index.js';

const ITEMS = [
	{id: 1, name: 'Sample1'},
	{id: 2, name: 'Sample2'},
];

const destroy = jest.fn();

const checklistVisualizationMode: FDSVisualizationMode = (container) => {
	const draw = ({items, schema, selection}: FDSVisualizationModeArgs) => {
		container.replaceChildren(
			...items.map((item) => {
				const label = document.createElement('label');

				if (selection) {
					const checkbox = document.createElement('input');

					checkbox.checked = selection.selectedValues.includes(
						item[selection.itemsKey]
					);
					checkbox.type = 'checkbox';

					checkbox.addEventListener('change', () =>
						selection.toggleItem(item)
					);

					label.append(checkbox);
				}

				label.append(String(item[schema?.title ?? 'title']));

				return label;
			})
		);
	};

	return {destroy, update: draw};
};

const renderClientExtensionView = ({
	onItemSelectionChange = jest.fn(),
	selectedItemsValue = [],
	selectionType,
	visualizationMode = checklistVisualizationMode,
}: {
	onItemSelectionChange?: jest.Mock;
	selectedItemsValue?: Array<unknown>;
	selectionType?: 'multiple' | 'single';
	visualizationMode?: FDSVisualizationMode;
}) => {
	const getElement = (selectedItemsValue: Array<unknown>) => (
		<FrontendDataSetContext.Provider
			value={
				{
					loadData: jest.fn(),
					selectable: !!selectionType,
					selectedItemsKey: 'id',
					selectedItemsValue,
					selectionType,
				} as any
			}
		>
			<ClientExtensionView
				items={ITEMS}
				moduleURL={MODULE_URL}
				onItemSelectionChange={onItemSelectionChange}
				schema={{title: 'name'}}
				visualizationMode={visualizationMode}
			/>
		</FrontendDataSetContext.Provider>
	);

	const {rerender, unmount} = render(getElement(selectedItemsValue));

	return {
		rerenderWithSelection: (selectedItemsValue: Array<unknown>) =>
			rerender(getElement(selectedItemsValue)),
		unmount,
	};
};

describe('ClientExtensionView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('draws the items with the client extension through the field mapping', () => {
		renderClientExtensionView({});

		expect(screen.getByText('Sample1')).toBeInTheDocument();
		expect(screen.getByText('Sample2')).toBeInTheDocument();
		expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
	});

	it('lets the client extension select items', async () => {
		const onItemSelectionChange = jest.fn();

		const {rerenderWithSelection} = renderClientExtensionView({
			onItemSelectionChange,
			selectionType: 'multiple',
		});

		await userEvent.click(screen.getByRole('checkbox', {name: 'Sample1'}));

		expect(onItemSelectionChange).toHaveBeenCalledWith(ITEMS[0], false);

		rerenderWithSelection([1]);

		expect(screen.getByRole('checkbox', {name: 'Sample1'})).toBeChecked();
		expect(
			screen.getByRole('checkbox', {name: 'Sample2'})
		).not.toBeChecked();
	});

	it('lets the client extension select a single item', async () => {
		const onItemSelectionChange = jest.fn();

		renderClientExtensionView({
			onItemSelectionChange,
			selectionType: 'single',
		});

		await userEvent.click(screen.getByRole('checkbox', {name: 'Sample2'}));

		expect(onItemSelectionChange).toHaveBeenCalledWith(ITEMS[1], true);
	});

	it('destroys the client extension when the view goes away', () => {
		const {unmount} = renderClientExtensionView({});

		unmount();

		expect(destroy).toHaveBeenCalledTimes(1);
	});

	it('shows an error when the client extension breaks', () => {
		const consoleErrorSpy = jest
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		renderClientExtensionView({
			visualizationMode: () => {
				throw new Error('Broken');
			},
		});

		expect(
			screen.getByText('this-visualization-mode-could-not-be-displayed')
		).toBeInTheDocument();
		expect(consoleErrorSpy).toHaveBeenCalled();
	});

	it('shows an error and destroys the client extension when it fails to draw', () => {
		jest.spyOn(console, 'error').mockImplementation(() => {});

		const destroy = jest.fn();

		renderClientExtensionView({
			visualizationMode: () => ({
				destroy,
				update: () => {
					throw new Error('Broken');
				},
			}),
		});

		expect(
			screen.getByText('this-visualization-mode-could-not-be-displayed')
		).toBeInTheDocument();
		expect(destroy).toHaveBeenCalledTimes(1);
	});

	it('shows an error when the client extension exports no visualization mode', () => {
		jest.spyOn(console, 'error').mockImplementation(() => {});

		renderClientExtensionView({
			visualizationMode: null as unknown as FDSVisualizationMode,
		});

		expect(
			screen.getByText('this-visualization-mode-could-not-be-displayed')
		).toBeInTheDocument();
	});

	describe('when an error escapes the client extension try/catch', () => {
		const ERROR_MESSAGE = 'this-visualization-mode-could-not-be-displayed';

		const dispatchError = (filename: string, error: Error) =>
			act(() => {
				window.dispatchEvent(
					new ErrorEvent('error', {
						error,
						filename,
						message: error.message,
					})
				);
			});

		const dispatchRejection = (reason: unknown) => {
			const event: any = new Event('unhandledrejection');

			event.reason = reason;

			act(() => {
				window.dispatchEvent(event);
			});
		};

		beforeEach(() => {
			jest.spyOn(console, 'error').mockImplementation(() => {});
		});

		it('shows an error and destroys the client extension on an uncaught error thrown by its module', () => {
			renderClientExtensionView({});

			dispatchError(MODULE_URL, new Error('Broken'));

			expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
			expect(destroy).toHaveBeenCalledTimes(1);
		});

		it('shows an error on an unhandled rejection coming from its module', () => {
			renderClientExtensionView({});

			const reason = new Error('Broken');

			reason.stack = `Error: Broken\n    at run (${MODULE_URL}:1:1)`;

			dispatchRejection(reason);

			expect(screen.getByText(ERROR_MESSAGE)).toBeInTheDocument();
		});

		it('ignores errors that do not come from its module', () => {
			renderClientExtensionView({});

			dispatchError('http://localhost/other.js', new Error('Other'));
			dispatchRejection(new Error('Other'));
			dispatchRejection('Not an error');

			expect(screen.queryByText(ERROR_MESSAGE)).not.toBeInTheDocument();
			expect(screen.getByText('Sample1')).toBeInTheDocument();
		});

		it('removes its listeners when the view goes away', () => {
			const removeEventListenerSpy = jest.spyOn(
				window,
				'removeEventListener'
			);

			const {unmount} = renderClientExtensionView({});

			unmount();

			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				'error',
				expect.any(Function)
			);
			expect(removeEventListenerSpy).toHaveBeenCalledWith(
				'unhandledrejection',
				expect.any(Function)
			);
		});
	});
});
