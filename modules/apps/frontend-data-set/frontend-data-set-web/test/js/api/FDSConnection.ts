/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {waitFor} from '@testing-library/react';

// The connection reaches the data set state through the global registry the
// portal installs, so the tests run against the real implementation rather
// than a stand-in.

// eslint-disable-next-line @liferay/portal/no-cross-module-deep-import
import State from '../../../../../frontend-js/frontend-js-state-web/src/main/resources/META-INF/resources/main/State';
import {FDSConnection} from '../../../src/main/resources/META-INF/resources/js/api/FDSConnection';

import type {FDSFilterInfo, FDSState} from '@liferay/js-api/data-set';

import type {FDSAtomState} from '../../../src/main/resources/META-INF/resources/js/api/state';

const FDS_NAME = 'testDataSet';

// Shaped the way the data set serializes its configuration: a selection
// filter the configuration preselects, an autocomplete one nobody picked yet,
// and a date range with a bound the data set zeroes out.

const DECLARED_FILTERS = [
	{
		active: true,
		autocompleteEnabled: false,
		entityFieldType: 'string' as const,
		id: 'color',
		items: [
			{label: 'Blue', value: 'Blue'},
			{label: 'Green', value: 'Green'},
			{label: 'Red', value: 'Red'},
		],
		label: 'Color',
		multiple: true,
		odataFilterString: "color in ('Blue', 'Green')",
		preloadedData: {
			exclude: false,
			selectedItems: [{label: 'Blue', value: 'Blue'}, {value: 'Green'}],
		},
		selectedData: {
			exclude: false,
			selectedItems: [{label: 'Blue', value: 'Blue'}, {value: 'Green'}],
		},
		type: 'selection' as const,
	},
	{
		apiURL: 'o/c/fdssamples',
		autocompleteEnabled: true,
		entityFieldType: 'string' as const,
		id: 'title',
		inputPlaceholder: 'Search titles',
		itemKey: 'title',
		itemLabel: 'title',
		items: [],
		label: 'Title',
		multiple: true,
		type: 'selection' as const,
	},
	{
		entityFieldType: 'date' as const,
		id: 'date',
		label: 'Date',
		max: {day: 22, month: 11, year: 2024},
		min: {day: 0, month: 0, year: 0},
		type: 'dateRange' as const,
	},
	{
		clientExtensionFilterURL: 'http://localhost:3000/filter.js',
		entityFieldType: 'string' as const,
		id: 'custom',
		label: 'Custom',
		type: 'clientExtension' as const,
	},
];

describe('FDSConnection filters', () => {
	let atom: Liferay.State.Atom<FDSAtomState>;
	let connection: FDSConnection;
	let onSearch: jest.Mock;
	let onStatus: jest.Mock;

	const readState = () =>
		State.read(atom as never) as unknown as FDSAtomState;

	const connect = async () => {
		connection = new FDSConnection(FDS_NAME, {search: onSearch}, onStatus);

		await waitFor(() =>
			expect(onStatus).toHaveBeenCalledWith(
				expect.objectContaining({status: 'ready'})
			)
		);
	};

	beforeEach(() => {
		State.__internal__.reset();

		(Liferay.on as jest.Mock).mockReturnValue({detach: jest.fn()});

		atom = State.atom(`${FDS_NAME}_fdsState`, {
			filters: DECLARED_FILTERS,
			search: {query: ''},
		}) as never;

		onSearch = jest.fn();
		onStatus = jest.fn();
	});

	afterEach(() => {
		connection?.disconnect();

		(Liferay.on as jest.Mock).mockReset();
	});

	it('hands over what it takes to obey every declared filter', async () => {
		await connect();

		expect(connection.getFilters()).toEqual([
			{
				active: true,
				id: 'color',
				label: 'Color',
				odataFilterString: "color in ('Blue', 'Green')",
				type: 'selection',
			},
			{
				active: false,
				id: 'title',
				label: 'Title',
				odataFilterString: '',
				type: 'selection',
			},
			{
				active: false,
				id: 'date',
				label: 'Date',
				odataFilterString: '',
				type: 'dateRange',
			},

			// A filter another client extension draws still contributes an
			// expression, so a consumer taking the filtering over has to be
			// able to obey it.

			{
				active: false,
				id: 'custom',
				label: 'Custom',
				odataFilterString: '',
				type: 'clientExtension',
			},
		]);
	});

	it('leaves the data set its own filter model', async () => {
		await connect();

		expect(Object.keys(connection.getFilters()?.[0] ?? {}).sort()).toEqual([
			'active',
			'id',
			'label',
			'odataFilterString',
			'type',
		]);
	});

	it('keeps the filters it declared when the consumer changes what it got', async () => {
		await connect();

		const filters = connection.getFilters() as Array<FDSFilterInfo>;

		filters.push(filters[0]);
		filters[0].label = 'Changed';

		expect(connection.getFilters()).toHaveLength(4);
		expect(connection.getFilters()?.[0].label).toBe('Color');
	});

	it('follows what the user picks while the data set still owns its filtering', async () => {
		await connect();

		State.write(
			atom as never,
			{
				...readState(),
				filters: [],
			} as never
		);

		expect(connection.getFilters()).toEqual([]);
	});

	it('stops following the state once the consumer takes the filtering over', async () => {
		await connect();

		connection.setFilters([
			{id: 'color', odataFilterString: "color eq 'Red'"},
		]);

		State.write(
			atom as never,
			{
				...readState(),
				filters: [],
			} as never
		);

		expect(connection.getFilters()).toEqual([
			expect.objectContaining({id: 'color'}),
			expect.objectContaining({id: 'title'}),
			expect.objectContaining({id: 'date'}),
			expect.objectContaining({id: 'custom'}),
		]);
	});

	it('reports a type error when a connection writes the declared filters', () => {
		const fdsState: FDSState = {

			// @ts-expect-error TS2353: 'filters' does not exist in type 'FDSState'

			filters: [],
			search: {query: ''},
		};

		expect(fdsState.search.query).toBe('');
	});

	it('takes the filtering over when the consumer sets its own filters', async () => {
		await connect();

		connection.setFilters([
			{id: 'custom', odataFilterString: "status eq 'draft'"},
		]);

		expect(readState().connectionFilters).toEqual([
			{id: 'custom', odataFilterString: "status eq 'draft'"},
		]);
	});

	it('replaces the previous set on every call', async () => {
		await connect();

		connection.setFilters([
			{id: 'custom', odataFilterString: "status eq 'draft'"},
		]);

		connection.setFilters([
			{id: 'other', odataFilterString: "author eq 'joe'"},
		]);

		expect(readState().connectionFilters).toEqual([
			{id: 'other', odataFilterString: "author eq 'joe'"},
		]);
	});

	it('filters nothing when the consumer clears its filters', async () => {
		await connect();

		connection.setFilters([
			{id: 'custom', odataFilterString: "status eq 'draft'"},
		]);

		connection.clearFilters();

		expect(readState().connectionFilters).toEqual([]);
	});

	it('leaves nothing applied when a consumer that filtered disconnects', async () => {
		await connect();

		connection.setFilters([
			{id: 'custom', odataFilterString: "status eq 'draft'"},
		]);

		connection.disconnect();

		expect(readState().connectionFilters).toEqual([]);
	});

	it('keeps the declared filters in play when a consumer that never filtered disconnects', async () => {
		await connect();

		connection.disconnect();

		expect(readState().connectionFilters).toBeUndefined();
	});

	it('ignores filter changes once disconnected', async () => {
		await connect();

		connection.disconnect();

		connection.setFilters([
			{id: 'custom', odataFilterString: "status eq 'draft'"},
		]);

		expect(readState().connectionFilters).toBeUndefined();
		expect(connection.getFilters()).toBeNull();
	});
});
