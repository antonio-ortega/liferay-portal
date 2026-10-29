/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {ClayToggle} from '@clayui/form';
import ClayLayout from '@clayui/layout';
import {
	getConfigParamName,
	serializeFDSConfig,
} from '@liferay/frontend-data-set-web';
import {fetch, navigate} from 'frontend-js-web';
import React, {useCallback, useEffect, useState} from 'react';

import {DEFAULT_FETCH_HEADERS} from '../../utils/constants';
import getDataSetResourceURL from '../../utils/getDataSetResourceURL';
import openDefaultFailureToast from '../../utils/openDefaultFailureToast';
import openDefaultSuccessToast from '../../utils/openDefaultSuccessToast';
import {IDataSetSectionProps} from '../DataSet';

const Settings = ({
	backURL,
	dataSet,
	manageUserViewsURL,
	namespace,
	onDataSetUpdate,
}: IDataSetSectionProps) => {
	const [snapshotsEnabled, setSnapshotsEnabled] = useState<boolean>(
		dataSet.snapshotsEnabled
	);
	const [hideManagementBarInEmptyState, setHideManagementBarInEmptyState] =
		useState(dataSet.hideManagementBarInEmptyState ?? true);
	const [loading, setLoading] = useState(true);
	const [searchAsYouType, setSearchAsYouType] = useState(
		dataSet.searchAsYouType ?? false
	);
	const [searchSuggestionsEnabled, setSearchSuggestionsEnabled] = useState(
		dataSet.searchSuggestionsEnabled ?? false
	);
	const [showSearch, setShowSearch] = useState(dataSet.showSearch ?? true);

	const handleToggleChange = useCallback(
		() => setHideManagementBarInEmptyState(!hideManagementBarInEmptyState),
		[hideManagementBarInEmptyState]
	);

	const getManageUserViewsWithFilterURL = () => {
		const url = new URL(
			manageUserViewsURL,
			Liferay.ThemeDisplay.getPortalURL()
		);
		const dataSetFilterConfig = {
			filters: [
				{
					id: 'fdsName',
					selectedData: {
						exclude: false,
						selectedItems: [
							{
								label: dataSet.label,
								value: dataSet.externalReferenceCode,
							},
						],
					},
				},
			],
		};

		url.searchParams.set(
			getConfigParamName(`${namespace}ManageUserViews`),
			serializeFDSConfig(dataSetFilterConfig)
		);

		return url.toString();
	};

	const updateFDSViewSettings = async () => {
		const body = {
			hideManagementBarInEmptyState,
			searchAsYouType,
			searchSuggestionsEnabled,
			showSearch,
			snapshotsEnabled,
		};

		const url = getDataSetResourceURL({
			dataSetERC: dataSet.externalReferenceCode,
		});

		const response = await fetch(url, {
			body: JSON.stringify(body),
			headers: DEFAULT_FETCH_HEADERS,
			method: 'PATCH',
		});

		if (!response.ok) {
			openDefaultFailureToast();

			return;
		}

		const responseJSON = await response.json();

		if (responseJSON?.id) {
			openDefaultSuccessToast();

			onDataSetUpdate(responseJSON);
		}
		else {
			openDefaultFailureToast();
		}
	};

	useEffect(() => {
		const fetchSettings = async () => {
			const url = getDataSetResourceURL({
				dataSetERC: dataSet.externalReferenceCode,
				params: {
					fields: 'hideManagementBarInEmptyState',
				},
			});

			try {
				const response = await fetch(url, {
					headers: DEFAULT_FETCH_HEADERS,
				});

				if (!response.ok) {
					openDefaultFailureToast();

					setLoading(false);

					setHideManagementBarInEmptyState(true);

					return;
				}

				const responseJSON = await response.json();

				const {
					hideManagementBarInEmptyState:
						persistedHideManagementBarInEmptyState,
				} = responseJSON;

				const serverHideManagementBarValue =
					persistedHideManagementBarInEmptyState || false;

				if (
					serverHideManagementBarValue !==
					hideManagementBarInEmptyState
				) {
					setHideManagementBarInEmptyState(
						serverHideManagementBarValue
					);
				}

				setLoading(false);
			}
			catch (error) {
				openDefaultFailureToast();
				setLoading(false);
			}
		};

		fetchSettings();

		// eslint-disable-next-line react-compiler/react-compiler
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<ClayLayout.ContainerFluid className="mt-3" size="lg">
			<ClayLayout.Sheet>
				<ClayLayout.SheetHeader className="mb-4">
					<h2 className="sheet-title">
						{Liferay.Language.get('settings')}
					</h2>
				</ClayLayout.SheetHeader>

				<ClayLayout.SheetSection>
					<h3 className="sheet-subtitle">
						{Liferay.Language.get(
							'management-bar-and-search-customization'
						)}
					</h3>

					<ClayLayout.Row className="align-items-center justify-content-between mb-4">
						<ClayLayout.Col size={9}>
							<div>
								<label
									htmlFor="hide-management-bar-in-empty-state"
									id="hide-management-bar-in-empty-state"
								>
									{Liferay.Language.get(
										'hide-management-bar-in-empty-state'
									)}
								</label>
							</div>

							<div>
								{Liferay.Language.get(
									'hide-management-bar-in-empty-state-help'
								)}
							</div>
						</ClayLayout.Col>

						<ClayLayout.Col size={1}>
							<div className="d-flex form-group justify-content-end mr-2">
								<ClayToggle
									disabled={loading}
									onToggle={handleToggleChange}
									toggled={hideManagementBarInEmptyState}
								/>
							</div>
						</ClayLayout.Col>
					</ClayLayout.Row>

					<ClayLayout.Row className="align-items-center justify-content-between mb-4">
						<ClayLayout.Col size={9}>
							<div>
								<label htmlFor="show-search-toggle">
									{Liferay.Language.get('show-search')}
								</label>
							</div>

							<div>
								{Liferay.Language.get('show-search-help')}
							</div>
						</ClayLayout.Col>

						<ClayLayout.Col className="align-self-start" size={1}>
							<ClayToggle
								id="show-search-toggle"
								onToggle={setShowSearch}
								toggled={showSearch}
							/>
						</ClayLayout.Col>
					</ClayLayout.Row>

					<ClayLayout.Row className="align-items-center justify-content-between mb-4">
						<ClayLayout.Col size={9}>
							<div>
								<label htmlFor="search-as-you-type-toggle">
									{Liferay.Language.get(
										'enable-search-as-you-type'
									)}
								</label>
							</div>

							<div>
								{Liferay.Language.get(
									'enable-search-as-you-type-help'
								)}
							</div>
						</ClayLayout.Col>

						<ClayLayout.Col className="align-self-start" size={1}>
							<ClayToggle
								disabled={!showSearch}
								id="search-as-you-type-toggle"
								onToggle={setSearchAsYouType}
								toggled={searchAsYouType}
							/>
						</ClayLayout.Col>
					</ClayLayout.Row>

					<ClayLayout.Row className="align-items-center justify-content-between">
						<ClayLayout.Col size={9}>
							<div>
								<label htmlFor="search-suggestions-toggle">
									{Liferay.Language.get(
										'enable-search-suggestions'
									)}
								</label>
							</div>

							<div>
								{Liferay.Language.get(
									'enable-search-suggestions-help'
								)}
							</div>
						</ClayLayout.Col>

						<ClayLayout.Col className="align-self-start" size={1}>
							<ClayToggle
								disabled={!showSearch}
								id="search-suggestions-toggle"
								onToggle={setSearchSuggestionsEnabled}
								toggled={searchSuggestionsEnabled}
							/>
						</ClayLayout.Col>
					</ClayLayout.Row>
				</ClayLayout.SheetSection>

				<ClayLayout.SheetSection>
					<h3 className="sheet-subtitle">
						{Liferay.Language.get('user-views-customization')}
					</h3>

					<ClayLayout.Row className="align-items-center justify-content-between mb-4">
						<ClayLayout.Col size={9}>
							<div>
								<label htmlFor="user-views-toggle">
									{Liferay.Language.get('enable-user-views')}
								</label>
							</div>

							<div>{Liferay.Language.get('user-views-help')}</div>
						</ClayLayout.Col>

						<ClayLayout.Col className="align-self-start" size={1}>
							<ClayToggle
								id="user-views-toggle"
								onToggle={setSnapshotsEnabled}
								toggled={snapshotsEnabled}
							/>
						</ClayLayout.Col>
					</ClayLayout.Row>

					<ClayLayout.Row className="align-items-center justify-content-between">
						<ClayLayout.Col size={9}>
							<div>
								<label htmlFor="manage-user-views-button">
									{Liferay.Language.get('manage-user-views')}
								</label>
							</div>

							<div>
								{Liferay.Language.get('manage-user-views-help')}
							</div>
						</ClayLayout.Col>

						<ClayLayout.Col size={3}>
							<ClayButton
								className="w-100"
								displayType="secondary"
								id="manage-user-views-button"
								onClick={() =>
									navigate(getManageUserViewsWithFilterURL())
								}
							>
								{Liferay.Language.get('manage-user-views')}
							</ClayButton>
						</ClayLayout.Col>
					</ClayLayout.Row>
				</ClayLayout.SheetSection>

				<ClayLayout.SheetFooter>
					<ClayButton.Group spaced>
						<ClayButton onClick={updateFDSViewSettings}>
							{Liferay.Language.get('save')}
						</ClayButton>

						<ClayButton
							displayType="secondary"
							onClick={() => navigate(backURL)}
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>
					</ClayButton.Group>
				</ClayLayout.SheetFooter>
			</ClayLayout.Sheet>
		</ClayLayout.ContainerFluid>
	);
};

export default Settings;
