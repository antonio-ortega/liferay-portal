/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {AudiencesCriteria, Group, SerializedGroup} from '../../types';
import {isGroup} from './isGroup';

export function serializeGroup(
	group: Group,
	typesByKey: Record<string, AudiencesCriteria['type']> = {}
): SerializedGroup {
	return {
		conjunction: group.conjunction,
		rules: group.items.map((node) =>
			isGroup(node)
				? serializeGroup(node, typesByKey)
				: {
						attribute: node.attribute,
						operator: node.operator,
						value: coerceValue(
							node.value,
							typesByKey[node.attribute]
						),
					}
		),
	};
}

function coerceValue(
	value: string,
	type: AudiencesCriteria['type'] | undefined
): boolean | number | string {
	if (type === 'boolean') {
		return value === 'true';
	}

	if (type === 'number' && value !== '') {
		return Number(value);
	}

	return value;
}
