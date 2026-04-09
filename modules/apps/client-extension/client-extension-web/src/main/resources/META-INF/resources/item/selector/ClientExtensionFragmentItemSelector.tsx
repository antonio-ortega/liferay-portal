/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import ClayModal from '@clayui/modal';
import {FrontendDataSet} from '@liferay/frontend-data-set-web';
import React, {useState} from 'react';

import './ClientExtensionFragmentItemSelector.scss';

interface ISelectedItem {
	externalReferenceCode: string;
	id: string;
	label: string;
}

const views = [
	{
		contentRenderer: 'list',
		name: 'list',
		schema: {
			description: 'description',
			fields: [{
				fieldName: 'name',
				label: 'Client Extension Name'
			}],
			sticker: 'sticker',
			symbol: 'symbol',
			title: 'name',
			tooltip: 'tooltip',
		},
		setItemComponentProps: ({item, props}: {item: any; props: any}) => {
			return {
				...props,
				item: {
					...item,
					description: item.name,
					sticker: {displayType: 'unstyled'},
					symbol: 'catalog',
					title: item.name
				},
			};
		},
	},
];

const ClientExtensionFragmentItemSelector = ({
	className,
	classNameId,
	namespace,
}: {
	className: string;
	classNameId: string;
	namespace: string;
}) => {
	const getSelectedData = () => {
		const dataset = (window.frameElement as HTMLElement)?.dataset;

		const externalReferenceCode = dataset.selecteditemsercs;
		const id = dataset.selecteditemsids;
		const label = dataset.selecteditemslabels;

		if (!externalReferenceCode || !id || !label) {
			return null;
		}

		return {
			externalReferenceCode,
			id,
			label,
		};
	};

	const [selectedItem, setSelectedItem] = useState<ISelectedItem | null>(
		getSelectedData()
	);

	return (
		<div className="client-extension-item-selector">
			<ClayModal.Body>
				<FrontendDataSet
					apiURL="http://localhost:8080/o/frontend-data-set-taglib/app/data-set/com_liferay_client_extension_web_internal_portlet_ClientExtensionAdminPortlet-clientExtensionTypes/com_liferay_client_extension_web_internal_portlet_ClientExtensionAdminPortlet-clientExtensionTypes?groupId=20127&plid=1&portletId=com_liferay_item_selector_web_portlet_ItemSelectorPortlet"
					id={`${namespace}ClientExtensionFragmentItemSelector`}
					onSelectedItemsChange={(
						selectedItems: Array<ISelectedItem>
					) => {
						setSelectedItem(selectedItems[0]);
					}}
					selectedItems={[selectedItem]}
					selectedItemsKey="externalReferenceCode"
					selectionType="single"
					views={views}
				/>
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton
							className="btn-cancel"
							displayType="secondary"
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton
							className="item-preview selector-button"
							data-value={`{
								"className": "${className}",
								"classNameId": "${classNameId}",
								"classPK": "${selectedItem?.id}",
								"externalReferenceCode": "${selectedItem?.externalReferenceCode}",
								"title": "${selectedItem?.label}"}`}
						>
							{Liferay.Language.get('save')}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</div>
	);
};

export default ClientExtensionFragmentItemSelector;
