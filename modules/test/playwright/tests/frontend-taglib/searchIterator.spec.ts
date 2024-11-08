/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {expect, mergeTests} from '@playwright/test';

import {apiHelpersTest} from '../../fixtures/apiHelpersTest';
import {featureFlagsTest} from '../../fixtures/featureFlagsTest';
import {isolatedSiteTest} from '../../fixtures/isolatedSiteTest';
import {loginTest} from '../../fixtures/loginTest';
import {taglibSamplePageTest} from './fixtures/taglibSamplePageTest';

export const test = mergeTests(
	apiHelpersTest,
    featureFlagsTest({
		'LPS-178052': true,
	}),
	isolatedSiteTest,
	loginTest(),
	taglibSamplePageTest
);

const tabName = 'Search Iterator';

test(
	'Search Iterator fixed header overlaps original header on scrolling',
	{tag: '@LPD-40036'},
	async ({apiHelpers, page, site, taglibSamplePage}) => {

		await test.step('Create a content site and the taglib sample widget', async () => {
			await taglibSamplePage.setupTaglibSampleWidget({
				apiHelpers,
				site,
			});
		});

		await test.step('Select Panel tab', async () => {
			await taglibSamplePage.selectTab(tabName);
		});

		await test.step('Check header sizes', async () => {
            await page
                .locator('.lfr-search-iterator-fixed-header')
                .evaluate((element) => {
                    element.classList.remove('hide')
                })

            const mainHeaderWidth = await page
                .locator('.table-responsive')
                .evaluate((element) => element.getBoundingClientRect().width);
    
            const fixedHeaderWidth = await page
                .locator('.lfr-search-iterator-fixed-header-inner-wrapper')
                .evaluate((element) => element.getBoundingClientRect().width);

            expect(mainHeaderWidth).toBe(fixedHeaderWidth);
        });
	}
);