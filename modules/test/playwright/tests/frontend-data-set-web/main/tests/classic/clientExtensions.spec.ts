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
import {liferayConfig} from '../../../../../liferay.config';
import getRandomString from '../../../../../utils/getRandomString';
import {waitForFDS} from '../../../../../utils/waitFor';
import {waitForSPAToBeLoaded} from '../../../../../utils/waitForSPAToBeLoaded';
import getPageDefinition from '../../../../layout-content-page-editor-web/main/utils/getPageDefinition';
import getWidgetDefinition from '../../../../layout-content-page-editor-web/main/utils/getWidgetDefinition';
import {fdsSamplePageTest} from '../../fixtures/fdsSamplePageTest';

const CLASSIC_FDS_NAME =
	'com_liferay_frontend_data_set_sample_web_internal_portlet_FDSSamplePortlet-classic';

const ADVANCED_FDS_NAME =
	'com_liferay_frontend_data_set_sample_web_internal_portlet_FDSSamplePortlet-advanced';

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

async function getSearchSubscribersCount(page: Page, fdsName: string) {
	return page.evaluate((fdsName) => {
		const key = `${fdsName}_fdsState_searchQuery`;

		const win = window as unknown as {
			Liferay: {
				State: {
					__internal__: {
						debug: {
							subscribers: {
								_subscribers: Map<unknown, Map<number, unknown>>;
							};
						};
					};
					__unsafe__: {
						getAtomOrSelectorKey: (key: string) => unknown;
					};
				};
			};
		};

		const selector =
			win.Liferay.State.__unsafe__.getAtomOrSelectorKey(key);

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

async function spaNavigateAndWait(page: Page, url: string) {
	await page.evaluate((url) => {
		const win = window as unknown as {
			Liferay: {
				Util: {navigate: (url: string) => void};
				once: (event: string, callback: () => void) => void;
			};
			__navPromise: Promise<void>;
		};

		win.__navPromise = new Promise<void>((resolve) => {
			win.Liferay.once('endNavigate', () => resolve());
		});

		win.Liferay.Util.navigate(url);
	}, url);

	await page.evaluate(
		() => (window as unknown as {__navPromise: Promise<void>}).__navPromise
	);

	await waitForSPAToBeLoaded(page);
}

async function selectFDSTab({fdsWidget, label}: {fdsWidget: Locator; label: string}) {
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

	const propertiesTextarea = configurationIframe.getByLabel('Properties', {
		exact: true,
	});

	await propertiesTextarea.fill(properties);

	await configurationIframe.getByRole('button', {name: 'Save'}).click();

	await page
		.locator('.modal-header')
		.getByLabel('Close', {exact: true})
		.click();
}

test(
	'Liferay Sample Custom Element 7 syncs search with FDS Sample (Classic)',
	{
		tag: ['@LPD-86378'],
	},
	async ({fdsSamplePage, page, pageEditorPage, site}) => {
		const customElement = page.locator('liferay-sample-custom-element-7');
		const customElementInput = customElement.locator('input');
		const customElementSearchButton = customElement.getByRole('button', {
			name: 'Search',
		});

		const fdsSearchInput = fdsSamplePage.managementToolbar.searchInput;
		const fdsSearchButton = fdsSamplePage.managementToolbar.searchButton;

		const {url} = await test.step(
			'Create a page with the FDS Sample widget',
			async () => fdsSamplePage.setupFDSSampleWidget({site})
		);

		await test.step(
			'Add the Custom Element 7 widget to the page',
			async () => {
				await page.goto(`${url}?p_l_mode=edit`);

				await pageEditorPage.addWidget(
					'Client Extensions',
					'Liferay Sample Custom Element 7'
				);

				await pageEditorPage.publishPage();
			}
		);

		await test.step('Switch to the Classic FDS tab', async () => {
			await page.goto(url);

			await fdsSamplePage.selectTab('Classic');

			await waitForFDS({page});
		});

		await test.step(
			'Custom Element becomes ready once the FDS atom is registered',
			async () => {
				await expect(customElementInput).toBeEnabled();
				await expect(customElementSearchButton).toBeEnabled();
			}
		);

		await test.step(
			'Searching from the Custom Element filters the FDS',
			async () => {
				await customElementInput.fill('Sample55');
				await customElementSearchButton.click();

				await expect(fdsSearchInput).toHaveValue('Sample55');
			}
		);

		await test.step(
			'Searching from the FDS reflects in the Custom Element input',
			async () => {
				await fdsSearchInput.fill('Sample22');
				await fdsSearchButton.click();

				await expect(customElementInput).toHaveValue('Sample22');
			}
		);
	}
);

test(
	'Custom Element disposes its FDS subscription on SPA navigation and only one is registered after returning',
	{
		tag: ['@LPD-86378'],
	},
	async ({apiHelpers, fdsSamplePage, page, pageEditorPage, site}) => {
		const customElement = page.locator('liferay-sample-custom-element-7');
		const customElementInput = customElement.locator('input');

		// Create the FDS page and a sibling empty page for SPA navigation

		const {url: fdsPageUrl} = await test.step(
			'Create a page with the FDS Sample widget',
			async () => fdsSamplePage.setupFDSSampleWidget({site})
		);

		const emptyPage = await apiHelpers.headlessDelivery.createSitePage({
			pageDefinition: getPageDefinition([]),
			siteId: site.id,
			title: getRandomString(),
		});

		const emptyPageUrl = `${liferayConfig.environment.baseUrl}/en/web${site.friendlyUrlPath}${emptyPage.friendlyUrlPath}`;

		await test.step(
			'Add the Custom Element 7 widget to the FDS page',
			async () => {
				await page.goto(`${fdsPageUrl}?p_l_mode=edit`);

				await pageEditorPage.addWidget(
					'Client Extensions',
					'Liferay Sample Custom Element 7'
				);

				await pageEditorPage.publishPage();
			}
		);

		await test.step(
			'Open the FDS page in view mode and wait for the Custom Element to subscribe',
			async () => {
				await page.goto(fdsPageUrl);

				await fdsSamplePage.selectTab('Classic');

				await waitForFDS({page});

				await expect(customElementInput).toBeEnabled();
			}
		);

		await test.step(
			'A single subscriber is registered for the Classic FDS search selector',
			async () => {
				await expect(async () => {
					expect(
						await getSearchSubscribersCount(page, CLASSIC_FDS_NAME)
					).toBe(1);
				}).toPass();
			}
		);

		await test.step(
			'SPA-navigate away to a page without the Custom Element',
			async () => {
				await spaNavigateAndWait(page, emptyPageUrl);

				await expect(customElement).toHaveCount(0);
			}
		);

		await test.step(
			'The previous Custom Element subscription is no longer present in the State subscribers map',
			async () => {
				await expect(async () => {
					expect(
						await getSearchSubscribersCount(page, CLASSIC_FDS_NAME)
					).toBe(0);
				}).toPass();
			}
		);

		await test.step(
			'SPA-navigate back to the FDS page and wait for the Custom Element to resubscribe',
			async () => {
				await spaNavigateAndWait(page, fdsPageUrl);

				await fdsSamplePage.selectTab('Classic');

				await waitForFDS({page});

				await expect(customElementInput).toBeEnabled();
			}
		);

		await test.step(
			'Exactly one subscriber is registered after returning to the FDS page',
			async () => {
				await expect(async () => {
					expect(
						await getSearchSubscribersCount(page, CLASSIC_FDS_NAME)
					).toBe(1);
				}).toPass();
			}
		);
	}
);

test(
	'Custom Element reconfiguration switches the active FDS subscription',
	{
		tag: ['@LPD-86378'],
	},
	async ({apiHelpers, page, pageEditorPage, site}) => {
		const customElement = page.locator('liferay-sample-custom-element-7');
		const customElementInput = customElement.locator('input');

		const fdsWidgets = page.locator(
			`[id^="portlet_${FDS_SAMPLE_WIDGET_NAME}"]`
		);
		const firstFDS = fdsWidgets.nth(0);
		const secondFDS = fdsWidgets.nth(1);
		const firstFDSSearchInput = firstFDS.locator('input[type="search"]');
		const firstFDSSearchButton = firstFDS.getByRole('button', {
			name: 'Search',
		});
		const secondFDSSearchInput = secondFDS.locator('input[type="search"]');
		const secondFDSSearchButton = secondFDS.getByRole('button', {
			name: 'Search',
		});

		// Page hosts two FDS Sample widgets so we can switch one to Classic
		// and leave the other on Advanced, getting two atoms on the page

		const layout = await apiHelpers.headlessDelivery.createSitePage({
			pageDefinition: getPageDefinition([
				getWidgetDefinition({
					id: getRandomString(),
					widgetName: FDS_SAMPLE_WIDGET_NAME,
				}),
				getWidgetDefinition({
					id: getRandomString(),
					widgetName: FDS_SAMPLE_WIDGET_NAME,
				}),
			]),
			siteId: site.id,
			title: getRandomString(),
		});

		const url = `${liferayConfig.environment.baseUrl}/en/web${site.friendlyUrlPath}${layout.friendlyUrlPath}`;

		let customElementFragmentId = '';

		await test.step(
			'Add the Custom Element 7 widget to the page',
			async () => {
				await page.goto(`${url}?p_l_mode=edit`);

				await pageEditorPage.addWidget(
					'Client Extensions',
					'Liferay Sample Custom Element 7'
				);

				customElementFragmentId = await pageEditorPage.getFragmentId(
					'Liferay Sample Custom Element 7'
				);

				await pageEditorPage.publishPage();
			}
		);

		await test.step(
			'Open the page in view mode and prepare the two FDS atoms',
			async () => {
				await page.goto(url);

				await selectFDSTab({fdsWidget: firstFDS, label: 'Classic'});

				await waitForFDS({page});

				await expect(customElementInput).toBeEnabled();
			}
		);

		await test.step(
			'Searches in the first (Classic) FDS reach the Custom Element',
			async () => {
				await firstFDSSearchInput.fill('FirstSample');
				await firstFDSSearchButton.click();

				await expect(customElementInput).toHaveValue('FirstSample');
			}
		);

		await test.step(
			'Searches in the second (Advanced) FDS do not reach the Custom Element',
			async () => {
				await secondFDSSearchInput.fill('SecondSample');
				await secondFDSSearchButton.click();

				await expect(customElementInput).toHaveValue('FirstSample');
			}
		);

		await test.step(
			'Reconfigure the Custom Element to subscribe to the second FDS',
			async () => {
				await page.goto(`${url}?p_l_mode=edit`);

				await setCustomElementProperties({
					page,
					pageEditorPage,
					properties: `fds-name=${ADVANCED_FDS_NAME}`,
					widgetId: customElementFragmentId,
				});

				await pageEditorPage.publishPage();
			}
		);

		await test.step(
			'Reload the page and prepare the two FDS atoms again',
			async () => {
				await page.goto(url);

				await selectFDSTab({fdsWidget: firstFDS, label: 'Classic'});

				await waitForFDS({page});

				await expect(customElementInput).toBeEnabled();

				// Sync the Custom Element to a known initial value via the
				// second FDS, which is the one it is now subscribed to

				await secondFDSSearchInput.fill('Initial');
				await secondFDSSearchButton.click();

				await expect(customElementInput).toHaveValue('Initial');
			}
		);

		await test.step(
			'Searches in the first FDS no longer reach the Custom Element',
			async () => {
				await firstFDSSearchInput.fill('FirstAfterReconfig');
				await firstFDSSearchButton.click();

				await expect(customElementInput).toHaveValue('Initial');
			}
		);

		await test.step(
			'Searches in the second FDS reach the reconfigured Custom Element',
			async () => {
				await secondFDSSearchInput.fill('SecondAfterReconfig');
				await secondFDSSearchButton.click();

				await expect(customElementInput).toHaveValue(
					'SecondAfterReconfig'
				);
			}
		);
	}
);

test(
	'Two Custom Elements share one FDS subscription until one is reconfigured away',
	{
		tag: ['@LPD-86378'],
	},
	async ({fdsSamplePage, page, pageEditorPage, site}) => {
		const customElements = page.locator('liferay-sample-custom-element-7');
		const firstCustomElement = customElements.nth(0);
		const secondCustomElement = customElements.nth(1);
		const firstCustomElementInput = firstCustomElement.locator('input');
		const firstCustomElementSearchButton = firstCustomElement.getByRole(
			'button',
			{name: 'Search'}
		);
		const secondCustomElementInput = secondCustomElement.locator('input');
		const secondCustomElementSearchButton = secondCustomElement.getByRole(
			'button',
			{name: 'Search'}
		);

		const fdsSearchInput = fdsSamplePage.managementToolbar.searchInput;
		const fdsSearchButton = fdsSamplePage.managementToolbar.searchButton;

		const {url} = await test.step(
			'Create a page with the FDS Sample widget',
			async () => fdsSamplePage.setupFDSSampleWidget({site})
		);

		await test.step(
			'Add two Custom Element 7 widgets to the page',
			async () => {
				await page.goto(`${url}?p_l_mode=edit`);

				await pageEditorPage.addWidget(
					'Client Extensions',
					'Liferay Sample Custom Element 7'
				);

				await pageEditorPage.addWidget(
					'Client Extensions',
					'Liferay Sample Custom Element 7'
				);

				await pageEditorPage.publishPage();
			}
		);

		await test.step(
			'Open the page in view mode and wait for both Custom Elements to subscribe',
			async () => {
				await page.goto(url);

				await fdsSamplePage.selectTab('Classic');

				await waitForFDS({page});

				await expect(firstCustomElementInput).toBeEnabled();
				await expect(secondCustomElementInput).toBeEnabled();
			}
		);

		await test.step(
			'Both Custom Elements have a subscription registered for the FDS search selector',
			async () => {
				await expect(async () => {
					expect(
						await getSearchSubscribersCount(page, CLASSIC_FDS_NAME)
					).toBe(2);
				}).toPass();
			}
		);

		await test.step(
			'A search in the FDS reaches both Custom Elements',
			async () => {
				await fdsSearchInput.fill('FromFDS');
				await fdsSearchButton.click();

				await expect(firstCustomElementInput).toHaveValue('FromFDS');
				await expect(secondCustomElementInput).toHaveValue('FromFDS');
			}
		);

		await test.step(
			'A search from the first Custom Element propagates to the FDS and the second Custom Element',
			async () => {
				await firstCustomElementInput.fill('FromFirstCustomElement');
				await firstCustomElementSearchButton.click();

				await expect(fdsSearchInput).toHaveValue(
					'FromFirstCustomElement'
				);
				await expect(secondCustomElementInput).toHaveValue(
					'FromFirstCustomElement'
				);
			}
		);

		await test.step(
			'Reconfigure the first Custom Element to subscribe to a non-existing FDS',
			async () => {
				await page.goto(`${url}?p_l_mode=edit`);

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
			}
		);

		await test.step(
			'Reload the page and confirm only the second Custom Element subscribes',
			async () => {
				await page.goto(url);

				await fdsSamplePage.selectTab('Classic');

				await waitForFDS({page});

				await expect(secondCustomElementInput).toBeEnabled();

				// The first Custom Element keeps polling for its non-existing
				// atom and stays disabled until subscribeSearch times out

				await expect(firstCustomElementInput).toBeDisabled();

				await expect(async () => {
					expect(
						await getSearchSubscribersCount(page, CLASSIC_FDS_NAME)
					).toBe(1);
				}).toPass();
			}
		);

		await test.step(
			'A search in the FDS reaches the second Custom Element but does not reach the disconnected one',
			async () => {
				await fdsSearchInput.fill('AfterDisconnect');
				await fdsSearchButton.click();

				await expect(secondCustomElementInput).toHaveValue(
					'AfterDisconnect'
				);
				await expect(firstCustomElementInput).toHaveValue('');
			}
		);

		await test.step(
			'The disconnected Custom Element can no longer drive the FDS or the second Custom Element',
			async () => {

				// The disconnected Custom Element input is disabled, so it
				// cannot trigger a search at all — this exercises that the
				// disconnection breaks both reading and writing

				await expect(firstCustomElementInput).toBeDisabled();
				await expect(firstCustomElementSearchButton).toBeDisabled();

				// A subsequent search from the second Custom Element still
				// propagates to the FDS, confirming its subscription is intact

				await secondCustomElementInput.fill('SecondStillWorks');
				await secondCustomElementSearchButton.click();

				await expect(fdsSearchInput).toHaveValue('SecondStillWorks');
			}
		);
	}
);
