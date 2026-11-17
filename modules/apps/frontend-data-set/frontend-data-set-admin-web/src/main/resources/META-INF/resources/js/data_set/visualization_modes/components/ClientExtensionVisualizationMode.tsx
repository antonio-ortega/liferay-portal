/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayAlert from '@clayui/alert';
import {ClayInput} from '@clayui/form';
import ClayLabel from '@clayui/label';
import ClayLayout from '@clayui/layout';
import ClayTable from '@clayui/table';
import classNames from 'classnames';
import {openModal} from 'frontend-js-components-web';
import {fetch, sub} from 'frontend-js-web';
import React, {useState} from 'react';

import AddDataSourceFieldsModalContent from '../../../components/AddDataSourceFieldsModalContent';
import {DEFAULT_FETCH_HEADERS} from '../../../utils/constants';
import getDataSetResourceURL from '../../../utils/getDataSetResourceURL';
import {
	ISchemaPart,
	getSchemaMapping,
	getSchemaParts,
	getStaleParts,
	hasMissingRequiredParts,
	serializeSchemaMapping,
} from '../../../utils/getVisualizationModeSchema';
import openDefaultFailureToast from '../../../utils/openDefaultFailureToast';
import openDefaultSuccessToast from '../../../utils/openDefaultSuccessToast';
import {IField, IFieldTreeItem} from '../../../utils/types';
import {IDataSetSectionProps} from '../../DataSet';
import AddCustomFieldModalContent from './AddCustomFieldModalContent';
import FieldAssignmentControls from './FieldAssignmentControls';

interface IClientExtensionVisualizationModeProps extends IDataSetSectionProps {
	visualizationModeName: string;
}

function flattenFields(items: IFieldTreeItem[]): IField[] {
	return items.flatMap((item) => [
		item,
		...flattenFields(item.children ?? []),
	]);
}

export default function ClientExtensionVisualizationMode(
	props: IClientExtensionVisualizationModeProps
) {
	const {
		dataSet,
		fieldTreeItems,
		onDataSetUpdate,
		visualizationModeClientExtensions,
		visualizationModeName,
	} = props;

	const [saving, setSaving] = useState(false);

	const schema = visualizationModeClientExtensions.find(
		({externalReferenceCode}) =>
			externalReferenceCode === visualizationModeName
	)?.schema;

	const parts = getSchemaParts(schema);
	const mapping = getSchemaMapping(dataSet, visualizationModeName);

	if (!parts.length) {
		return (
			<ClayAlert
				displayType="info"
				title={`${Liferay.Language.get('info')}:`}
				variant="stripe"
			>
				{Liferay.Language.get(
					'this-visualization-mode-is-provided-by-a-client-extension-and-receives-all-the-fields-of-each-item'
				)}
			</ClayAlert>
		);
	}

	const fields = flattenFields(fieldTreeItems);
	const stalePartNames = getStaleParts(mapping, parts);

	const save = async (partName: string, field?: IField) => {
		const updatedMapping = {...mapping};

		if (field) {
			updatedMapping[partName] = field.name;
		}
		else {
			delete updatedMapping[partName];
		}

		setSaving(true);

		const response = await fetch(
			getDataSetResourceURL({
				dataSetERC: dataSet.externalReferenceCode,
			}),
			{
				body: JSON.stringify({
					visualizationModes: serializeSchemaMapping({
						dataSet,
						mapping: updatedMapping,
						visualizationModeName,
					}),
				}),
				headers: DEFAULT_FETCH_HEADERS,
				method: 'PATCH',
			}
		);

		const responseJSON = response.ok ? await response.json() : null;

		setSaving(false);

		if (!responseJSON?.id) {
			openDefaultFailureToast();

			return false;
		}

		openDefaultSuccessToast();

		onDataSetUpdate(responseJSON);

		return true;
	};

	return (
		<ClayLayout.ContentCol className="c-gap-4">
			{!!stalePartNames.length && (
				<ClayAlert
					displayType="warning"
					title={`${Liferay.Language.get('warning')}:`}
					variant="stripe"
				>
					{sub(
						Liferay.Language.get(
							'the-client-extension-no-longer-declares-these-parts-x'
						),
						stalePartNames.join(', ')
					)}
				</ClayAlert>
			)}

			{hasMissingRequiredParts(mapping, parts) && (
				<ClayAlert
					displayType="warning"
					title={`${Liferay.Language.get('warning')}:`}
					variant="stripe"
				>
					{Liferay.Language.get(
						'this-visualization-mode-has-required-parts-without-an-assigned-field'
					)}
				</ClayAlert>
			)}

			<ClayTable className="mb-0">
				<ClayTable.Head>
					<ClayTable.Row>
						<ClayTable.Cell headingCell>
							{Liferay.Language.get('item-element')}
						</ClayTable.Cell>

						<ClayTable.Cell headingCell>
							{Liferay.Language.get('field')}
						</ClayTable.Cell>
					</ClayTable.Row>
				</ClayTable.Head>

				<ClayTable.Body>
					{parts.map((part) => (
						<PartRow
							field={
								mapping[part.name]
									? fields.find(
											({name}) =>
												name === mapping[part.name]
										) ?? {name: mapping[part.name]}
									: undefined
							}
							fieldTreeItems={fieldTreeItems}
							key={part.name}
							modalProps={props}
							onSave={async (field, closeModal) => {
								if (await save(part.name, field)) {
									closeModal?.();
								}
							}}
							part={part}
							saving={saving}
						/>
					))}
				</ClayTable.Body>
			</ClayTable>
		</ClayLayout.ContentCol>
	);
}

interface IPartRowProps {
	field?: IField;
	fieldTreeItems: IFieldTreeItem[];
	modalProps: IDataSetSectionProps;
	onSave: (field?: IField, closeModal?: Function) => void;
	part: ISchemaPart;
	saving: boolean;
}

function PartRow({
	field,
	fieldTreeItems,
	modalProps,
	onSave,
	part: {label, required},
	saving,
}: IPartRowProps) {
	const openAddCustomFieldModal = () => {
		openModal({
			contentComponent: ({closeModal}: {closeModal: Function}) => (
				<AddCustomFieldModalContent
					{...modalProps}
					closeModal={closeModal}
					onSaveButtonClick={(selectedField: IField) =>
						onSave(selectedField, closeModal)
					}
				/>
			),
		});
	};

	const openAddDataSourceFieldsModal = () => {
		openModal({
			className: 'modal-height-full',
			contentComponent: ({closeModal}: {closeModal: Function}) => (
				<AddDataSourceFieldsModalContent
					{...modalProps}
					closeModal={closeModal}
					fieldTreeItems={fieldTreeItems}
					onSaveButtonClick={({
						selectedFields,
					}: {
						selectedFields: Array<IField>;
					}) => onSave(selectedFields[0], closeModal)}
					saveButtonDisabled={saving}
					selectedFields={field ? [field] : []}
				/>
			),
			size: 'lg',
		});
	};

	return (
		<ClayTable.Row>
			<ClayTable.Cell>
				<strong>{label}</strong>

				{required && (
					<ClayLabel className="ml-2" displayType="info">
						{Liferay.Language.get('required')}
					</ClayLabel>
				)}
			</ClayTable.Cell>

			<ClayTable.Cell>
				<ClayInput.Group small>
					<ClayInput.GroupItem>
						<p
							className={classNames(
								'align-items-center d-flex mb-0',
								{'text-secondary': !field}
							)}
						>
							{field
								? field.label || field.name
								: Liferay.Language.get('not-assigned')}
						</p>
					</ClayInput.GroupItem>

					<ClayInput.GroupItem shrink>
						<FieldAssignmentControls
							field={field}
							label={label}
							onClearSelection={() => onSave()}
							openAddCustomFieldModal={openAddCustomFieldModal}
							openAddDataSourceFieldsModal={
								openAddDataSourceFieldsModal
							}
						/>
					</ClayInput.GroupItem>
				</ClayInput.Group>
			</ClayTable.Cell>
		</ClayTable.Row>
	);
}
