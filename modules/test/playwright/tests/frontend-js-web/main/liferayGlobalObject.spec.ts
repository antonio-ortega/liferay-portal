/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../../fixtures/apiHelpersTest';
import {featureFlagsTest} from '../../../fixtures/featureFlagsTest';
import {instanceSettingsPagesTest} from '../../../fixtures/instanceSettingsPagesTest';
import {isolatedSiteTest} from '../../../fixtures/isolatedSiteTest';
import {loginTest} from '../../../fixtures/loginTest';
import {productMenuPageTest} from '../../../fixtures/productMenuPageTest';
import {siteSettingsPagesTest} from '../../../fixtures/siteSettingsPagesTest';
import getRandomString from '../../../utils/getRandomString';
import {performUserSwitch, userData} from '../../../utils/performLogin';

export const test = mergeTests(
	apiHelpersTest,
	featureFlagsTest({
		'LPS-178052': {enabled: true},
	}),
	instanceSettingsPagesTest,
	isolatedSiteTest,
	loginTest(),
	productMenuPageTest,
	siteSettingsPagesTest
);

test(
	'CORS does not stop requests when CDN is enabled',
	{tag: '@LPD-56873'},
	async ({instanceSettingsPage, page}) => {
		await test.step('Check crossorigin attribute is added when CDN is enabled', async () => {
			await instanceSettingsPage.goToInstanceSetting(
				'Instance Configuration',
				'General'
			);

			await page
				.getByLabel('CDN Host HTTP', {exact: true})
				.fill('http://127.0.0.1');

			await page.getByLabel('CDN Host HTTPS').fill('https://127.0.0.1');

			await page.getByRole('button', {name: 'Save'}).click();

			const crossoriginAttr = await page
				.locator(
					'script[src^="http://127.0.0.1/o/frontend-js-web/Liferay.js"]'
				)
				.getAttribute('crossorigin', {timeout: 1000});

			await expect(crossoriginAttr).toStrictEqual('');
		});

		await test.step('Check crossorigin attribute is removed when CDN is disabled', async () => {
			await page.getByLabel('CDN Host HTTP', {exact: true}).clear();

			await page.getByLabel('CDN Host HTTPS').clear();

			await page.getByRole('button', {name: 'Save'}).click();

			await expect(
				page.locator('script[src^="/o/frontend-js-web/Liferay.js"]')
			).not.toHaveAttribute('crossorigin', '');
		});
	}
);
