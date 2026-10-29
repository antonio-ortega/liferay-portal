/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {Locator, Page} from '@playwright/test';

import {DataSetPage} from '../DataSetPage';

export class SettingsPage {
	readonly cancelButton: Locator;
	readonly dataSetPage: DataSetPage;
	readonly manageUserViewsButton: Locator;
	readonly page: Page;
	readonly saveButton: Locator;
	readonly toastContainer: Locator;

	constructor(page: Page) {
		this.cancelButton = page.getByRole('button', {name: 'Cancel'});
		this.dataSetPage = new DataSetPage(page);
		this.manageUserViewsButton = page.getByRole('button', {
			exact: true,
			name: 'Manage User Views',
		});
		this.page = page;
		this.saveButton = page.getByRole('button', {name: 'Save'});
		this.toastContainer = page.locator('.alert-container');
	}

	async goto({dataSetLabel}: {dataSetLabel: string}) {
		await this.dataSetPage.goto({
			dataSetLabel,
		});

		await this.dataSetPage.selectTab('Settings');
	}

	async gotoManageUserViews() {
		await this.manageUserViewsButton.click();
	}
}
