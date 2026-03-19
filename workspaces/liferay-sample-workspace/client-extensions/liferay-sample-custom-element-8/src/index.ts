/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

//import type {FDSState} from '@liferay/js-api/data-set';
//import type {Atom} from '@liferay/js-api/state';

//import {getFDSAtom} from '@liferay/js-api/data-set';
import {getFDSAtom, FDSState} from '../../../../../../liferay-frontend-projects/projects/js-toolkit/packages/js-api/data-set';
import {readAtom, writeAtom, subscribeAtom, Atom} from '../../../../../../liferay-frontend-projects/projects/js-toolkit/packages/js-api/state';

//import {readAtom, subscribeAtom, writeAtom} from '@liferay/js-api/state';

class FDSStateMonitor extends HTMLElement {
	private atom: Atom<FDSState> | null = null;
	private subscription: {dispose: () => void} | null = null;

	connectedCallback() {
		const fdsId = this.getAttribute('data-fds-id') || '';

		this.innerHTML = `
			<label>
				Data Set ID:
				<input type="text" class="fds-id" value="${fdsId}" placeholder="Enter FDS id" />
				<button class="connect">Connect</button>
			</label>
			<div class="status">Not connected</div>
			<pre class="state-display"></pre>
			<div class="actions" style="display:none">
				<button class="set-search">Set search to "test"</button>
				<button class="clear-search">Clear search</button>
			</div>
		`;

		this.querySelector('.connect')!.addEventListener('click', () => {
			const id = (
				this.querySelector('.fds-id') as HTMLInputElement
			).value.trim();

			if (id) {
				this.connectToFDS(id);
			}
		});

		this.querySelector('.set-search')!.addEventListener('click', () => {
			if (this.atom) {
				const current = readAtom(this.atom);

				writeAtom(this.atom, {
					...current,
					search: {query: 'test'},
				});
			}
		});

		this.querySelector('.clear-search')!.addEventListener('click', () => {
			if (this.atom) {
				const current = readAtom(this.atom);

				writeAtom(this.atom, {
					...current,
					search: {query: ''},
				});
			}
		});

		if (fdsId) {
			this.connectToFDS(fdsId);
		}
	}

	disconnectedCallback() {
		if (this.subscription) {
			this.subscription.dispose();
		}
	}

	private async connectToFDS(id: string) {
		const statusEl = this.querySelector('.status')!;
		const stateEl = this.querySelector('.state-display')!;
		const actionsEl = this.querySelector('.actions') as HTMLElement;

		statusEl.textContent = `Waiting for FDS "${id}"…`;
		statusEl.className = 'status';

		try {
			this.atom = await getFDSAtom(id);

			statusEl.textContent = `Connected to "${id}"`;
			statusEl.className = 'status connected';
			actionsEl.style.display = '';

			stateEl.textContent = JSON.stringify(
				readAtom(this.atom),
				null,
				2
			);

			if (this.subscription) {
				this.subscription.dispose();
			}

			this.subscription = subscribeAtom(
				this.atom,
				(newState: FDSState) => {
					stateEl.textContent = JSON.stringify(newState, null, 2);
				}
			);
		}
		catch (error) {
			statusEl.textContent = String(error);
			statusEl.className = 'status error';
		}
	}
}

if (!customElements.get('fds-state-monitor')) {
	customElements.define('fds-state-monitor', FDSStateMonitor);
}
