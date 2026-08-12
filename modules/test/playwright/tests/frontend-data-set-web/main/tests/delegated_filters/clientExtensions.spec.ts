/**
 * SPDX-FileCopyrightText: (c) 2024 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page, expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../../../../fixtures/apiHelpersTest';
import {featureFlagsTest} from '../../../../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../../../fixtures/loginTest';
import {pageEditorPagesTest} from '../../../../../fixtures/pageEditorPagesTest';
import getRandomString from '../../../../../utils/getRandomString';
import {waitForFDS} from '../../../../../utils/waitFor';
import getPageDefinition from '../../../../layout-content-page-editor-web/main/utils/getPageDefinition';
import {fdsSamplePageTest} from '../../fixtures/fdsSamplePageTest';

const CONTENT_RENDERERS_FDS_NAME = 'ContentRenderersFrontendDataSet';

const DELEGATED_FILTERS_FDS_NAME =
	'com_liferay_frontend_data_set_sample_web_internal_portlet_FDSSamplePortlet-delegatedFilters';

const FDS_SAMPLE_WIDGET_NAME =
	'com_liferay_frontend_data_set_sample_web_internal_portlet_FDSSamplePortlet';

const test = mergeTests(
	apiHelpersTest,
	fdsSamplePageTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	isolatedSiteTest,
	loginTest(),
	pageEditorPagesTest
);

let customElement: Locator;
let customElementFragmentId: string;
let customElementSearchInput: Locator;
let fdsPageDelegatedFiltersUrl: string;
let fdsPageTitle: string;
let fdsPageUrl: string;

/**
 * The Custom Element renders its search box first and the box that takes an
 * OData expression last, with a checkbox per filter the data set declares in
 * between, so the search box is the first text input.
 */
function getSearchInput(element: Locator) {
	return element.locator('input[type="text"]').first();
}

test.beforeEach(async ({fdsSamplePage, page, pageEditorPage, site}) => {
	await test.step('Create a page with the FDS Sample widget', async () => {
		const {layout, url} = await fdsSamplePage.setupFDSSampleWidget({site});

		fdsPageUrl = url;
		fdsPageTitle = layout.nameCurrentValue;
	});

	await test.step('Add the Custom Element 7 widget to the page', async () => {
		await page.goto(`${fdsPageUrl}?p_l_mode=edit`);

		await pageEditorPage.addWidget(
			'Client Extensions',
			'Liferay Sample Custom Element 7'
		);

		await pageEditorPage.publishPage();

		customElementFragmentId = await pageEditorPage.getFragmentId(
			'Liferay Sample Custom Element 7'
		);

		customElement = page.locator('liferay-sample-custom-element-7');
		customElementSearchInput = getSearchInput(customElement);
	});

	await test.step('Capture the Delegated Filters tab URL from the rendered toolbar', async () => {
		await page.goto(fdsPageUrl);

		const delegatedFiltersTabHref = await page
			.locator('.nav-link')
			.filter({hasText: 'Delegated Filters'})
			.getAttribute('href');

		if (!delegatedFiltersTabHref) {
			throw new Error(
				'Delegated Filters FDS tab href was not present on the page'
			);
		}

		fdsPageDelegatedFiltersUrl = delegatedFiltersTabHref;
	});

	await test.step('Reload the page directly on the Delegated Filters tab', async () => {
		await page.goto(fdsPageDelegatedFiltersUrl);

		await waitForFDS({page});
	});
});

async function getSearchSubscribersCount(page: Page, fdsName: string) {
	return page.evaluate((fdsName) => {
		const key = `${fdsName}_fdsState_searchQuery`;

		const win = window as unknown as {
			Liferay: {
				State: {
					__internal__: {
						debug: {
							subscribers: {
								_subscribers: Map<
									unknown,
									Map<number, unknown>
								>;
							};
						};
					};
					__unsafe__: {
						getAtomOrSelectorKey: (key: string) => unknown;
					};
				};
			};
		};

		const selector = win.Liferay.State.__unsafe__.getAtomOrSelectorKey(key);

		if (!selector) {
			return 0;
		}

		const callbacks =
			win.Liferay.State.__internal__.debug.subscribers._subscribers.get(
				selector
			);

		return callbacks ? callbacks.size : 0;
	}, fdsName);
}

async function selectFDSTab({
	fdsWidget,
	label,
}: {
	fdsWidget: Locator;
	label: string;
}) {
	const navLink = fdsWidget.locator('.nav-link').filter({hasText: label});

	await navLink.click();

	await expect(navLink).toHaveClass(/active/);
}

async function setCustomElementProperties({
	page,
	pageEditorPage,
	properties,
	widgetId,
}: {
	page: Page;
	pageEditorPage: {
		goToWidgetConfiguration: (widgetId: string) => Promise<void>;
	};
	properties: string;
	widgetId: string;
}) {
	await pageEditorPage.goToWidgetConfiguration(widgetId);

	const configurationIframe = page.frameLocator(
		'iframe[title*="Configuration"]'
	);

	const propertiesTextarea = configurationIframe.getByLabel('Properties');

	await propertiesTextarea.fill(properties);

	await configurationIframe.getByRole('button', {name: 'Save'}).click();

	await page
		.locator('.modal-header')
		.getByLabel('Close', {exact: true})
		.click();
}

test(
	'Liferay Sample Custom Element 7 syncs search with FDS Sample (Delegated Filters)',
	{
		tag: ['@LPD-86378'],
	},
	async ({fdsSamplePage}) => {
		const customElementSearchButton = customElement.getByRole('button', {
			name: 'Search',
		});

		const fdsSearchInput = fdsSamplePage.managementToolbar.searchInput;
		const fdsSearchButton = fdsSamplePage.managementToolbar.searchButton;

		await test.step('Custom Element becomes ready once the FDS atom is registered', async () => {
			await expect(customElementSearchInput).toBeEnabled();
			await expect(customElementSearchButton).toBeEnabled();
		});

		await test.step('Searching from the Custom Element filters the FDS', async () => {
			await customElementSearchInput.fill('Sample55');
			await customElementSearchButton.click();

			await expect(fdsSearchInput).toHaveValue('Sample55');
		});

		await test.step('Searching from the FDS reflects in the Custom Element input', async () => {
			await fdsSearchInput.fill('Sample22');
			await fdsSearchButton.click();

			await expect(customElementSearchInput).toHaveValue('Sample22');
		});
	}
);

test(
	'Custom Element disposes its FDS subscription on SPA navigation and only one is registered after returning',
	{
		tag: ['@LPD-86378'],
	},
	async ({apiHelpers, fdsSamplePage, page, site}) => {
		const emptyPageTitle = getRandomString();

		await test.step('Create a second page and reload to make it appear in the menu bar so we can navigate away', async () => {
			await apiHelpers.headlessDelivery.createSitePage({
				pageDefinition: getPageDefinition([]),
				siteId: site.id,
				title: emptyPageTitle,
			});

			await page.reload();
		});

		await test.step('A single subscriber is registered for the Delegated Filters FDS search selector', async () => {
			await expect(async () => {
				expect(
					await getSearchSubscribersCount(
						page,
						DELEGATED_FILTERS_FDS_NAME
					)
				).toBe(1);
			}).toPass();
		});

		await test.step('SPA-navigate away to a page without the Custom Element', async () => {
			const secondPageMenuItem = page.getByRole('menuitem', {
				name: emptyPageTitle,
			});

			await secondPageMenuItem.click();

			await expect(customElement).toHaveCount(0);
		});

		await test.step('The previous Custom Element subscription is no longer present in the State subscribers map', async () => {
			await expect(async () => {
				expect(
					await getSearchSubscribersCount(
						page,
						DELEGATED_FILTERS_FDS_NAME
					)
				).toBe(0);
			}).toPass();
		});

		await test.step('SPA-navigate back to the FDS page and wait for the Custom Element to resubscribe', async () => {
			const firstPageMenuItem = page
				.getByRole('menuitem', {
					name: fdsPageTitle,
				})
				.first();

			await firstPageMenuItem.click();

			await fdsSamplePage.selectTab('Delegated Filters');

			await waitForFDS({page});

			await expect(customElementSearchInput).toBeEnabled();
		});

		await test.step('Exactly one subscriber is registered after returning to the FDS page', async () => {
			await expect(async () => {
				expect(
					await getSearchSubscribersCount(
						page,
						DELEGATED_FILTERS_FDS_NAME
					)
				).toBe(1);
			}).toPass();
		});
	}
);

test(
	'Custom Element reconfiguration switches the active FDS subscription',
	{
		tag: ['@LPD-86378'],
	},
	async ({page, pageEditorPage}) => {
		const fdsWidgets = page.locator(
			`[id^="portlet_${FDS_SAMPLE_WIDGET_NAME}"]`
		);
		const firstFDS = fdsWidgets.nth(0);
		const secondFDS = fdsWidgets.nth(1);
		const firstFDSSearchInput = firstFDS.locator('input[type="search"]');
		const firstFDSSearchButton = firstFDS.getByRole('button', {
			exact: true,
			name: 'Search',
		});
		const secondFDSSearchInput = secondFDS.locator('input[type="search"]');
		const secondFDSSearchButton = secondFDS.getByRole('button', {
			exact: true,
			name: 'Search',
		});

		await test.step('Drop a second FDS Sample widget on the page', async () => {
			await page.goto(`${fdsPageUrl}?p_l_mode=edit`);

			await pageEditorPage.addWidget(
				'Sample',
				'Frontend Data Set Sample'
			);

			await pageEditorPage.publishPage();

			await page.goto(fdsPageUrl);
		});

		await test.step('Open the page in view mode and prepare the two FDS atoms', async () => {
			await page.goto(fdsPageUrl);

			await selectFDSTab({
				fdsWidget: firstFDS,
				label: 'Delegated Filters',
			});

			await selectFDSTab({
				fdsWidget: secondFDS,
				label: 'Content Renderers',
			});

			await firstFDS.locator('.fds .table').waitFor({state: 'visible'});
			await secondFDS.locator('.fds .table').waitFor({state: 'visible'});

			await expect(customElementSearchInput).toBeEnabled();
		});

		await test.step('Searches in the first (Delegated Filters) FDS reach the Custom Element', async () => {
			await firstFDSSearchInput.fill('FirstSample');
			await firstFDSSearchButton.click();

			await expect(customElementSearchInput).toHaveValue('FirstSample');
		});

		await test.step('Searches in the second (Content Renderers) FDS do not reach the Custom Element', async () => {
			await secondFDSSearchInput.fill('SecondSample');
			await secondFDSSearchButton.click();

			await expect(customElementSearchInput).toHaveValue('FirstSample');
		});

		await test.step('Reconfigure the Custom Element to subscribe to the second FDS', async () => {
			await page.goto(`${fdsPageUrl}?p_l_mode=edit`);

			await setCustomElementProperties({
				page,
				pageEditorPage,
				properties: `fds-name=${CONTENT_RENDERERS_FDS_NAME}`,
				widgetId: customElementFragmentId,
			});

			await pageEditorPage.publishPage();
		});

		await test.step('Reload the page and prepare the two FDS atoms again', async () => {
			await page.goto(fdsPageUrl);

			await selectFDSTab({
				fdsWidget: firstFDS,
				label: 'Delegated Filters',
			});

			await selectFDSTab({
				fdsWidget: secondFDS,
				label: 'Content Renderers',
			});

			await firstFDS.locator('.fds .table').waitFor({state: 'visible'});
			await secondFDS.locator('.fds .table').waitFor({state: 'visible'});

			await expect(customElementSearchInput).toBeEnabled();
		});

		await test.step('Searches in the first FDS no longer reach the Custom Element', async () => {
			await firstFDSSearchInput.fill('FirstAfterReconfig');
			await firstFDSSearchButton.click();

			await expect(customElementSearchInput).toHaveValue('');
		});

		await test.step('Searches in the second FDS reach the reconfigured Custom Element', async () => {
			await secondFDSSearchInput.fill('SecondAfterReconfig');
			await secondFDSSearchButton.click();

			await expect(customElementSearchInput).toHaveValue(
				'SecondAfterReconfig'
			);
		});
	}
);

test(
	'Two Custom Elements share one FDS subscription until one is reconfigured away',
	{
		tag: ['@LPD-86378'],
	},
	async ({fdsSamplePage, page, pageEditorPage}) => {
		const customElements = page.locator('liferay-sample-custom-element-7');
		const firstCustomElement = customElements.nth(0);
		const secondCustomElement = customElements.nth(1);
		const firstCustomElementSearchInput =
			getSearchInput(firstCustomElement);
		const firstCustomElementSearchButton = firstCustomElement.getByRole(
			'button',
			{name: 'Search'}
		);
		const secondCustomElementSearchInput =
			getSearchInput(secondCustomElement);

		const fdsSearchInput = fdsSamplePage.managementToolbar.searchInput;
		const fdsSearchButton = fdsSamplePage.managementToolbar.searchButton;

		await test.step('Add a second Custom Element 7 widget to the page', async () => {
			await page.goto(`${fdsPageUrl}?p_l_mode=edit`);

			await pageEditorPage.addWidget(
				'Client Extensions',
				'Liferay Sample Custom Element 7'
			);

			await pageEditorPage.publishPage();
		});

		await test.step('Open the page in view mode and wait for both Custom Elements to subscribe', async () => {
			await page.goto(fdsPageDelegatedFiltersUrl);

			await waitForFDS({page});

			await expect(firstCustomElementSearchInput).toBeEnabled();
			await expect(secondCustomElementSearchInput).toBeEnabled();
		});

		await test.step('Both Custom Elements have a subscription registered for the FDS search selector', async () => {
			await expect(async () => {
				expect(
					await getSearchSubscribersCount(
						page,
						DELEGATED_FILTERS_FDS_NAME
					)
				).toBe(2);
			}).toPass();
		});

		await test.step('A search in the FDS reaches both Custom Elements', async () => {
			await fdsSearchInput.fill('FromFDS');
			await fdsSearchButton.click();

			await expect(firstCustomElementSearchInput).toHaveValue('FromFDS');
			await expect(secondCustomElementSearchInput).toHaveValue('FromFDS');
		});

		await test.step('A search from the first Custom Element propagates to the FDS and the second Custom Element', async () => {
			await firstCustomElementSearchInput.fill('FromFirstCustomElement');
			await firstCustomElementSearchButton.click();

			await expect(fdsSearchInput).toHaveValue('FromFirstCustomElement');
			await expect(secondCustomElementSearchInput).toHaveValue(
				'FromFirstCustomElement'
			);
		});

		await test.step('Reconfigure the first Custom Element to subscribe to a non-existing FDS', async () => {
			await page.goto(`${fdsPageUrl}?p_l_mode=edit`);

			const firstCustomElementFragmentId =
				await pageEditorPage.getFragmentId(
					'Liferay Sample Custom Element 7'
				);

			await setCustomElementProperties({
				page,
				pageEditorPage,
				properties: `fds-name=disconnected-${getRandomString()}`,
				widgetId: firstCustomElementFragmentId,
			});

			await pageEditorPage.publishPage();
		});

		await test.step('Reload the page and confirm only the second Custom Element subscribes', async () => {
			await page.goto(fdsPageDelegatedFiltersUrl);

			await fdsSamplePage.selectTab('Delegated Filters');

			await waitForFDS({page});

			await expect(secondCustomElementSearchInput).toBeEnabled();

			await expect(firstCustomElementSearchInput).toBeDisabled();

			await expect(async () => {
				expect(
					await getSearchSubscribersCount(
						page,
						DELEGATED_FILTERS_FDS_NAME
					)
				).toBe(1);
			}).toPass();
		});

		await test.step('A search in the FDS reaches the second Custom Element but does not reach the disconnected one', async () => {
			await fdsSearchInput.fill('AfterDisconnect');
			await fdsSearchButton.click();

			await expect(secondCustomElementSearchInput).toHaveValue(
				'AfterDisconnect'
			);
			await expect(firstCustomElementSearchInput).toHaveValue('');
		});
	}
);
