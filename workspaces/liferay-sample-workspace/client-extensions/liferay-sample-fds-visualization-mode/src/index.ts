/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import css from './styles/index.css';

import type {
	FDSVisualizationMode,
	FDSVisualizationModeArgs,
	FDSVisualizationModeItem,
	FDSVisualizationModeSchema,
	FDSVisualizationModeSelection,
} from '@liferay/js-api/data-set';

const STYLE_ELEMENT_ID = 'liferay-sample-fds-timeline-style';

function addStyle() {
	if (document.getElementById(STYLE_ELEMENT_ID)) {
		return;
	}

	const style = document.createElement('style');

	style.id = STYLE_ELEMENT_ID;
	style.textContent = css;

	document.head.append(style);
}

function getValue(
	item: FDSVisualizationModeItem,
	name: string,
	schema?: FDSVisualizationModeSchema
) {
	return item[schema?.[name] ?? name];
}

function createEntry(
	dateTimeFormat: Intl.DateTimeFormat,
	item: FDSVisualizationModeItem,
	schema?: FDSVisualizationModeSchema,
	selection?: FDSVisualizationModeSelection
) {
	const entry = document.createElement('li');

	entry.className = 'liferay-sample-fds-timeline-entry';

	const dateValue = getValue(item, 'date', schema);

	const date = typeof dateValue === 'string' ? new Date(dateValue) : null;

	if (date) {
		const time = document.createElement('time');

		time.className =
			'liferay-sample-fds-timeline-date small text-secondary';
		time.dateTime = date.toISOString();
		time.textContent = dateTimeFormat.format(date);

		entry.append(time);
	}

	const title = document.createElement(selection ? 'label' : 'div');

	title.className = 'd-flex font-weight-semi-bold mb-1';

	if (selection) {
		const checkbox = document.createElement('input');

		checkbox.checked = selection.selectedValues.includes(
			item[selection.itemsKey]
		);
		checkbox.className = 'mr-2';
		checkbox.type = 'checkbox';

		checkbox.addEventListener('change', () => selection.toggleItem(item));

		title.append(checkbox);
	}

	title.append(String(getValue(item, 'title', schema) ?? ''));

	entry.append(title);

	const descriptionValue = getValue(item, 'description', schema);

	if (descriptionValue) {
		const description = document.createElement('p');

		description.className = 'mb-0 text-secondary';
		description.textContent = String(descriptionValue);

		entry.append(description);
	}

	return entry;
}

const fdsVisualizationMode: FDSVisualizationMode = (container) => {
	const dateTimeFormat = new Intl.DateTimeFormat(
		document.documentElement.lang || undefined,
		{dateStyle: 'medium', timeZone: 'UTC'}
	);

	addStyle();

	const timeline = document.createElement('ol');

	timeline.ariaLabel = 'Timeline';
	timeline.className = 'liferay-sample-fds-timeline';

	container.append(timeline);

	// The data set shows only its first page, with its own pagination hidden by
	// the view. This visualization mode keeps the pages it loads after it, and
	// loads the next one when the sentinel, always the last entry, scrolls into
	// view. Selecting an item calls update() again on this same instance, so
	// the pages kept here are drawn again with the data set's.

	const loadedItems: Array<FDSVisualizationModeItem> = [];

	let args: FDSVisualizationModeArgs | undefined;
	let destroyed = false;
	let failed = false;
	let loading = false;
	let nextPage = 2;
	let pagesLeft = true;

	const sentinel = document.createElement('li');

	sentinel.ariaHidden = 'true';
	sentinel.className = 'liferay-sample-fds-timeline-sentinel';

	const getItems = () => [...(args?.items ?? []), ...loadedItems];

	const observer = new IntersectionObserver((entries) => {
		if (
			!args ||
			!entries.some((entry) => entry.isIntersecting) ||
			!pagesLeft ||
			loading ||
			failed
		) {
			return;
		}

		loading = true;

		args.loadPage(nextPage)
			.then((page) => {
				const itemsKey = args?.selection?.itemsKey;

				const loadedValues = new Set(
					getItems().map((item) => (itemsKey ? item[itemsKey] : item))
				);

				loadedItems.push(
					...page.items.filter(
						(item) => !itemsKey || !loadedValues.has(item[itemsKey])
					)
				);

				nextPage = page.page + 1;
				pagesLeft = !!page.items.length && page.page < page.lastPage;
			})
			.catch(() => {
				failed = true;

				sentinel.textContent = 'Could not load more items';
			})
			.finally(() => {
				loading = false;

				if (args && !destroyed) {
					draw(args);
				}
			});
	});

	const draw = (nextArgs: FDSVisualizationModeArgs) => {
		args = nextArgs;

		const items = getItems();

		timeline.replaceChildren(
			...items.map((item) =>
				createEntry(
					dateTimeFormat,
					item,
					nextArgs.schema,
					nextArgs.selection
				)
			),
			...(pagesLeft && items.length < nextArgs.total ? [sentinel] : [])
		);

		// Observing again reports the sentinel even if it never left the view,
		// which a page that does not fill the viewport needs.

		observer.unobserve(sentinel);
		observer.observe(sentinel);
	};

	return {
		destroy: () => {
			destroyed = true;

			observer.disconnect();
		},
		update: draw,
	};
};

export default fdsVisualizationMode;
