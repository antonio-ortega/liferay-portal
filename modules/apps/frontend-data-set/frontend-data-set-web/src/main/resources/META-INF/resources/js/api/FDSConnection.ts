/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {getFDSAtom, getOrCreateSelector} from './getFDSAtom';

import type {
	FDSConnectionFilter,
	FDSConnectionInfo,
	FDSConnectionOptions,
	FDSConnectionStatus,
	FDSFilterInfo,
	FDSState,
	FDSStateChangeCallback,
} from '@liferay/js-api/data-set';

import type {FDSAtomState} from './state';
import Atom = Liferay.State.Atom;

const DEFAULT_TIMEOUT = 10000;

interface Subscriptions {
	search: {dispose: () => void};
}

interface Selectors {
	search: Liferay.State.Selector<string>;
}

type FDSAtomStateFilter = NonNullable<FDSAtomState['filters']>[number];

const pad = (value: number) => String(value).padStart(2, '0');

/**
 * An end of a range in the terms a date control reads and writes, which is
 * "YYYY-MM-DD", or the same with a time when the filter tracks one.
 *
 * An end the data set would ignore reads as absent: it zeroes the parts of a
 * bound it does not mean to apply, and a partial date is nothing a control can
 * open on.
 */
function toRangeBound(
	date: NonNullable<FDSAtomStateFilter['selectedData']>['from']
): string | null {
	if (!date?.day || !date?.month || !date?.year) {
		return null;
	}

	const day = `${date.year}-${pad(date.month)}-${pad(date.day)}`;

	if (date.hour === undefined) {
		return day;
	}

	return `${day}T${pad(date.hour)}:${pad(date.minute ?? 0)}`;
}

/**
 * A filter the data set declares, in the terms a consumer needs to obey it:
 * what it is, whether the data set had it applied, and the expression it
 * contributed while it did.
 *
 * What the filter offers and how to draw it are deliberately absent. A
 * consumer that takes the filtering over renders its own controls, so the
 * values, bounds, and selections behind them are its own business, and
 * republishing the data set's filter model here would tie every filter feature
 * it grows to this contract. A client extension that means to draw a filter
 * the data set configures has the `FDSFilter` contract for it instead.
 *
 * `odataFilterString` is the data set's own work rather than a reading of the
 * configuration: it writes the expression into the state as it applies a
 * filter and drops it as it clears one, so passing it back is exactly what the
 * data set would have sent, for any filter type it comes to support.
 *
 * `selection` and `range` are the exceptions, and they are here for the
 * consumer that replaces a filter rather than obeys it: such a consumer draws
 * the control, so it needs what is picked in the terms it draws with, or its
 * control opens blank while the data set is filtering and the takeover
 * silently widens the results. One member per kind of control rather than one
 * member holding either shape, so that reading a range costs no narrowing.
 *
 * Only what is picked is handed over, never what the filter offers: the values
 * come without labels and a range comes without its bounds, because whoever
 * draws the control has its own. A range is a string apiece so that a date and
 * a date with a time read the same way, and so that no shape for a date has to
 * be published alongside.
 */
function toFilterInfo({
	active,
	id,
	label,
	odataFilterString,
	selectedData,
	type,
}: FDSAtomStateFilter): FDSFilterInfo {
	const filterInfo = {
		active: Boolean(active),
		id,
		label,
		odataFilterString: odataFilterString ?? '',
		type,
	};

	if (type === 'dateRange' || type === 'dateTimeRange') {
		const from = toRangeBound(selectedData?.from);
		const to = toRangeBound(selectedData?.to);

		if (!from && !to) {
			return filterInfo;
		}

		return {...filterInfo, range: {from, to}};
	}

	if (type !== 'selection' || !selectedData?.selectedItems?.length) {
		return filterInfo;
	}

	return {
		...filterInfo,
		selection: {
			exclude: Boolean(selectedData.exclude),
			values: selectedData.selectedItems.map(({value}) => value),
		},
	};
}

/**
 * A copy a consumer owns, down to the selected values: what it does to what it
 * got back must not reach what the next call returns.
 */
function copyFilterInfo({
	range,
	selection,
	...filterInfo
}: FDSFilterInfo): FDSFilterInfo {
	return {
		...filterInfo,
		...(range ? {range: {...range}} : {}),
		...(selection
			? {
					selection: {
						exclude: selection.exclude,
						values: [...selection.values],
					},
				}
			: {}),
	};
}

function toFilterInfos(
	fdsAtomState: Liferay.State.Immutable<FDSAtomState>
): Array<FDSFilterInfo> {
	return (fdsAtomState.filters ?? []).map(toFilterInfo);
}

export class FDSConnection {
	private static instanceCount = 0;

	private atom!: Atom<FDSState>;
	private clearFiltersWhenDisconnect = false;

	/**
	 * What the data set declared when the filtering changed hands, which is
	 * unset until it does: its presence is what tells this connection that it
	 * owns the filtering.
	 */
	private declaredFilters: Array<FDSFilterInfo> | null = null;

	private disconnected = false;
	private fdsName: string;
	private instanceId: number = ++FDSConnection.instanceCount;
	private isReady = false;
	private navigationHandle: {detach: () => void};
	private onFDSConnectionInfoChange: (
		fdsConnectionInfo: FDSConnectionInfo
	) => void;
	private selectors!: Selectors;
	private subscriptions!: Subscriptions;

	constructor(
		fdsName: string,
		fdsStateChangeCallback: FDSStateChangeCallback,
		onFDSConnectionInfoChange: (
			fdsConnectionInfo: FDSConnectionInfo
		) => void,
		options: FDSConnectionOptions = {}
	) {
		this.fdsName = fdsName;
		this.onFDSConnectionInfoChange = onFDSConnectionInfoChange;
		this.notifyStatus('connecting');

		getFDSAtom(fdsName, {timeout: options.timeout ?? DEFAULT_TIMEOUT})
			.then((atom: Atom<FDSState>) => {
				if (this.disconnected) {
					return;
				}

				this.atom = atom;

				this.selectors = {
					search: getOrCreateSelector(
						`${atom.key}_searchQuery`,
						(get) => get(atom).search.query
					),
				};

				// mark connection as ready, so getters/setters are unblocked and available to callbacks

				this.isReady = true;

				this.subscriptions = {
					search: Liferay.State.subscribe(
						this.selectors.search,
						fdsStateChangeCallback.search
					),
				};

				// initialize consumer's state

				fdsStateChangeCallback.search(this.getSearch() || '');

				// then inform consumer everything is settled

				this.notifyStatus('ready');
			})
			.catch((error: Error) => {
				if (this.disconnected) {
					return;
				}

				this.warn(
					'Connection timed out for ' + fdsName + ': ' + error.message
				);

				this.notifyStatus('timeout');
			});

		// ensure consumers don't need to dispose the subscriptions on SPA navigations

		this.navigationHandle = Liferay.on('beforeNavigate', () => {
			this.disconnect();
		});
	}

	getSearch = (): string | null => {
		if (!this.isReady) {
			return null;
		}

		return Liferay.State.read(this.selectors.search);
	};

	setSearch = (query: string): void => {
		if (!this.isReady) {
			return;
		}

		const current = Liferay.State.read(this.atom);

		Liferay.State.write(this.atom, {
			...current,
			search: {...current.search, query},
		});
	};

	/**
	 * The filters the data set declares, each with the expression it
	 * contributes, here to be obeyed or ignored by whoever takes the filtering
	 * over through `setFilters()`. Obeying one costs nothing more than passing
	 * it back, so a consumer needs to understand no filter it does not mean to
	 * replace.
	 *
	 * A data set that still owns its filtering goes on showing its filter UI,
	 * so what it declares is read afresh on every call and follows what the
	 * user picks. The snapshot taken when the filtering changed hands wins from
	 * then on: filtering belongs either to the data set or to the consumer,
	 * never to both, so once a consumer owns it these stop changing behind its
	 * back.
	 *
	 * Every call hands over its own copy, so that a consumer working on what
	 * it got back cannot reach what the next call returns.
	 */
	getFilters = (): Array<FDSFilterInfo> | null => {
		if (!this.isReady) {
			return null;
		}

		const filters = this.declaredFilters ?? this.readDeclaredFilters();

		return filters.map(copyFilterInfo);
	};

	/**
	 * Takes the filtering over with the given expressions, replacing whatever
	 * a previous call passed. From the first call on, the filters the data set
	 * declares no longer reach the request and it stops showing them: the
	 * consumer owns the whole filter expression, and obeys the declared filters
	 * by including the ones it wants in the set it passes here.
	 */
	setFilters = (filters: Array<FDSConnectionFilter>): void => {
		if (!this.isReady) {
			return;
		}

		const current = Liferay.State.read(this.atom);

		// The filtering changes hands on the first call, so keep what the data
		// set declared as it stood at that moment: it shows no filter UI from
		// here on, and what a consumer reads must stop moving under it.

		if (!this.declaredFilters) {
			this.declaredFilters = this.readDeclaredFilters();
		}

		this.clearFiltersWhenDisconnect = true;

		Liferay.State.write(this.atom, {
			...current,
			connectionFilters: filters.map(({id, odataFilterString}) => ({
				id,
				odataFilterString,
			})),
		});
	};

	/**
	 * Drops the filters this connection applies, so that the data set filters
	 * nothing: a shortcut for `setFilters([])`, and what `disconnect()` does
	 * on the way out. The filtering stays taken over, so the filters the data
	 * set declares do not come back.
	 */
	clearFilters = (): void => {
		this.setFilters([]);
	};

	disconnect = (): void => {
		if (this.disconnected) {
			return;
		}

		// Leave nothing of this connection applied: a consumer that never
		// filtered must not suppress the filters the data set declares on its
		// way out, so only a connection that did take the filtering over
		// clears it.

		if (this.clearFiltersWhenDisconnect) {
			this.clearFilters();
		}

		this.subscriptions?.search?.dispose();
		this.disconnected = true;
		this.isReady = false;
		this.declaredFilters = null;
		this.navigationHandle.detach();
		this.notifyStatus('disconnected');
	};

	private readDeclaredFilters(): Array<FDSFilterInfo> {
		const fdsAtomState: Liferay.State.Immutable<FDSAtomState> =
			Liferay.State.read(this.atom);

		return toFilterInfos(fdsAtomState);
	}

	private warn(msg: string): void {
		console.warn('[FDSConnection', this.instanceId, ']', msg);
	}

	private notifyStatus(status: FDSConnectionStatus): void {
		this.onFDSConnectionInfoChange({
			fdsName: this.fdsName,
			instanceId: this.instanceId,
			status,
		});
	}
}
