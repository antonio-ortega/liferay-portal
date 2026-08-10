/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	getFDSAtom,
	getFDSCommandsAtom,
	getOrCreateSelector,
} from './getFDSAtom';
import {getFDSFiltersSignature, toFDSFilterState} from './toFDSFilterState';

import type {
	FDSConnectionInfo,
	FDSConnectionOptions,
	FDSConnectionStatus,
	FDSFilterSelection,
	FDSFilterState,
	FDSFilterWriteRejectionReason,
	FDSFilterWriteResult,
	FDSState,
	FDSStateChangeCallback,
} from '@liferay/js-api/data-set';

import type {FDSCommands} from './fdsCommands';
import Atom = Liferay.State.Atom;

const DEFAULT_TIMEOUT = 10000;

interface Subscriptions {
	filters?: {dispose: () => void};
	search?: {dispose: () => void};
}

interface Selectors {
	filters: Liferay.State.Selector<Array<FDSFilterState>>;
	search: Liferay.State.Selector<string>;
}

const rejected = (
	reason: FDSFilterWriteRejectionReason,
	rejectedFilterIds?: Array<string>
): FDSFilterWriteResult => ({
	accepted: false,
	reason,
	...(rejectedFilterIds ? {rejectedFilterIds} : {}),
});

export class FDSConnection {
	private static instanceCount = 0;

	private atom!: Atom<FDSState>;
	private commandsAtom!: Atom<FDSCommands | null>;
	private disconnected = false;
	private fdsName: string;
	private filtersSignature: string | null = null;
	private instanceId: number = ++FDSConnection.instanceCount;
	private isReady = false;
	private navigationHandle: {detach: () => void};
	private onFDSConnectionInfoChange: (
		fdsConnectionInfo: FDSConnectionInfo
	) => void;
	private selectors!: Selectors;
	private subscriptions: Subscriptions = {};

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

		const timeout = options.timeout ?? DEFAULT_TIMEOUT;

		Promise.all([
			getFDSAtom(fdsName, {timeout}),
			getFDSCommandsAtom(fdsName, {timeout}),
		])
			.then(([atom, commandsAtom]) => {
				if (this.disconnected) {
					return;
				}

				this.atom = atom;
				this.commandsAtom = commandsAtom;

				this.selectors = {
					filters: getOrCreateSelector(
						`${atom.key}_filters`,
						(get) => get(atom).filters
					),
					search: getOrCreateSelector(
						`${atom.key}_searchQuery`,
						(get) => get(atom).search.query
					),
				};

				// mark connection as ready, so getters/setters are unblocked and available to callbacks

				this.isReady = true;

				if (fdsStateChangeCallback.search) {
					this.subscriptions.search = Liferay.State.subscribe(
						this.selectors.search,
						fdsStateChangeCallback.search
					);
				}

				if (fdsStateChangeCallback.filters) {
					this.subscribeToFilters(fdsStateChangeCallback.filters);
				}

				// initialize consumer's state

				fdsStateChangeCallback.search?.(this.getSearch() || '');

				const initialFilters = this.getFilters() || [];

				this.filtersSignature = getFDSFiltersSignature(initialFilters);

				fdsStateChangeCallback.filters?.(initialFilters);

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

		const current = Liferay.State.read(this.atom) as FDSState;

		Liferay.State.write(this.atom, {
			...current,
			search: {...current.search, query},
		});
	};

	getFilters = (): Array<FDSFilterState> | null => {
		if (!this.isReady) {
			return null;
		}

		return this.readFilters().map(toFDSFilterState);
	};

	getFilter = <T = unknown>(filterId: string): FDSFilterState<T> | null => {
		if (!this.isReady) {
			return null;
		}

		const filter = this.readFilters().find(({id}) => id === filterId);

		return filter ? (toFDSFilterState(filter) as FDSFilterState<T>) : null;
	};

	setFilter = (
		filterId: string,
		selectedData: unknown
	): FDSFilterWriteResult => {
		return this.setFilters([{filterId, selectedData}]);
	};

	setFilters = (
		selections: Array<FDSFilterSelection>
	): FDSFilterWriteResult => {
		const commands = this.readCommands();

		if (!commands) {
			return rejected('not-ready');
		}

		return this.reportRejections(
			commands.applyFilterSelections(selections)
		);
	};

	clearFilter = (filterId: string): FDSFilterWriteResult => {
		const commands = this.readCommands();

		if (!commands) {
			return rejected('not-ready');
		}

		return this.reportRejections(
			commands.clearFilterSelections([filterId])
		);
	};

	clearFilters = (): FDSFilterWriteResult => {
		const commands = this.readCommands();

		if (!commands) {
			return rejected('not-ready');
		}

		return this.reportRejections(commands.clearFilterSelections());
	};

	disconnect = (): void => {
		if (this.disconnected) {
			return;
		}
		this.subscriptions.filters?.dispose();
		this.subscriptions.search?.dispose();
		this.disconnected = true;
		this.isReady = false;
		this.navigationHandle.detach();
		this.notifyStatus('disconnected');
	};

	private subscribeToFilters(
		notifyFilters: (filters: Array<FDSFilterState>) => void
	): void {
		this.subscriptions.filters = Liferay.State.subscribe(
			this.selectors.filters,
			(value) => {
				const publicFilters = (
					value as ReadonlyArray<FDSFilterState>
				).map(toFDSFilterState);

				// The whole atom is rewritten on every change, so this
				// also fires for search updates. Only notify when the
				// public projection actually differs.

				const signature = getFDSFiltersSignature(publicFilters);

				if (signature !== null && signature === this.filtersSignature) {
					return;
				}

				this.filtersSignature = signature;

				notifyFilters(publicFilters);
			}
		);
	}

	private readFilters(): Array<FDSFilterState> {
		return Liferay.State.read(
			this.selectors.filters
		) as ReadonlyArray<FDSFilterState> as Array<FDSFilterState>;
	}

	private readCommands(): FDSCommands | null {
		if (!this.isReady) {
			this.warn(
				'Cannot write filters before the connection is ready. ' +
					'Wait for the "ready" status before calling setFilter/clearFilter.'
			);

			return null;
		}

		const commands = Liferay.State.read(
			this.commandsAtom
		) as FDSCommands | null;

		if (!commands) {
			this.warn(
				`The data set "${this.fdsName}" is no longer mounted, so filters cannot be written.`
			);
		}

		return commands;
	}

	private reportRejections(
		result: FDSFilterWriteResult
	): FDSFilterWriteResult {
		if (result.rejectedFilterIds?.length) {
			this.warn(
				`Ignored filter(s) ${result.rejectedFilterIds.join(', ')} on "${this.fdsName}": ${result.reason}. ` +
					'Only filters declared by the data set can be written, ' +
					'and their payload must match the filter type. ' +
					'Use getFilters() to discover the available filters.'
			);
		}

		return result;
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
