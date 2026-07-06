/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {LAYOUT_STRUCTURE_ITEM_CLASS_NAME_PREFIX} from '../../app/config/constants/layoutStructureItemClassNamePrefix';

export interface EditableElementOption {
	label: string;
	value: string;
}

export default function getEditableElementOptions(
	document: Document
): EditableElementOption[] {
	const editableElementOptions: EditableElementOption[] = [];
	const values = new Set<string>();

	document
		.querySelectorAll('[data-lfr-editable-id]')
		.forEach((editableElement) => {
			const editableId = editableElement.getAttribute(
				'data-lfr-editable-id'
			);

			const layoutStructureItemElement = editableElement.closest(
				'[data-layout-structure-item-id]'
			);

			if (!editableId || !layoutStructureItemElement) {
				return;
			}

			const layoutStructureItemId =
				layoutStructureItemElement.getAttribute(
					'data-layout-structure-item-id'
				);

			const value = `.${LAYOUT_STRUCTURE_ITEM_CLASS_NAME_PREFIX}${layoutStructureItemId} [data-lfr-editable-id="${editableId}"]`;

			if (values.has(value)) {
				return;
			}

			values.add(value);

			editableElementOptions.push({label: editableId, value});
		});

	return editableElementOptions;
}
