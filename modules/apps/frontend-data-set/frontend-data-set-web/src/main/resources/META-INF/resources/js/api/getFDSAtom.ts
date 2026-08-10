/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import type {FDSState} from '@liferay/js-api/data-set';

import type {FDSCommands} from './fdsCommands';

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_INTERVAL = 100;

/**
 * Waits for an atom the widget registers under `key` to appear in the
 * global `Liferay.State` registry, polling until it is found or the
 * timeout elapses.
 *
 * The runtime must go through the global singleton (not the imported
 * copy of `@liferay/frontend-js-state-web`) so that consumers share the
 * same atom registry that the Frontend Data Set widget populates.
 */
function getRegisteredAtom<T>(
	key: string,
	options?: {interval?: number; timeout?: number}
): Promise<Liferay.State.Atom<T>> {
	const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
	const interval = options?.interval ?? DEFAULT_INTERVAL;

	return new Promise((resolve, reject) => {
		const existing = Liferay?.State?.__unsafe__?.getAtomOrSelectorKey(key);

		if (existing) {
			return resolve(existing as Liferay.State.Atom<T>);
		}

		const startTime = Date.now();

		const poll = setInterval(() => {
			const atom = Liferay?.State?.__unsafe__?.getAtomOrSelectorKey(key);

			if (atom) {
				clearInterval(poll);

				return resolve(atom as Liferay.State.Atom<T>);
			}

			if (Date.now() - startTime >= timeout) {
				clearInterval(poll);

				reject(
					new Error(
						`FDS atom "${key}" was not found within ${timeout}ms`
					)
				);
			}
		}, interval);
	});
}

/**
 * Resolves the atom holding the FDS state (search query and filters).
 */
export function getFDSAtom(
	id: string,
	options?: {interval?: number; timeout?: number}
): Promise<Liferay.State.Atom<FDSState>> {
	return getRegisteredAtom<FDSState>(`${id}_fdsState`, options);
}

/**
 * Resolves the atom through which the widget publishes the write
 * commands this module is allowed to invoke.
 *
 * Reads can be served straight from the state atom, but writes cannot:
 * activating a filter means recomputing its OData query and its
 * selection label through the implementation that owns the filter's
 * `type`, and that code lives in the widget. Files under `js/api/`
 * cannot import it (see the `@liferay/portal/no-api-submodule-import`
 * lint rule), so the widget hands those operations over through the
 * state registry instead.
 */
export function getFDSCommandsAtom(
	id: string,
	options?: {interval?: number; timeout?: number}
): Promise<Liferay.State.Atom<FDSCommands | null>> {
	return getRegisteredAtom<FDSCommands | null>(`${id}_fdsCommands`, options);
}

export function getOrCreateSelector<T>(
	key: string,
	deriveValue: (get: Liferay.State.Getter) => T
): Liferay.State.Selector<T> {
	const existing = Liferay.State.__unsafe__.getAtomOrSelectorKey(key);

	return (
		(existing as Liferay.State.Selector<T> | null) ??
		Liferay.State.selector<T>(key, deriveValue)
	);
}
