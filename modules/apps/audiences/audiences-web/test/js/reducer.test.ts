/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';

import {
	initState,
	serializeCriteria,
} from '../../src/main/resources/META-INF/resources/js/reducer';
import {
	AudiencesCriteria,
	AudiencesCriteriaRulesGroup,
} from '../../src/main/resources/META-INF/resources/js/types';

describe('reducer', () => {
	it('normalizes groups when loading stored criteria', () => {
		const rulesGroup: AudiencesCriteriaRulesGroup = {
			conjunction: 'AND',
			rules: [
				{attribute: 'cookies', operator: 'includes', value: 'c'},
				{
					conjunction: 'OR',
					rules: [
						{
							attribute: 'browser_version',
							operator: 'eq',
							value: 'b',
						},
						{
							attribute: 'cookies',
							operator: 'includes',
							value: 'c2',
						},
					],
				},
				{
					conjunction: 'AND',
					rules: [
						{
							attribute: 'device_type',
							operator: 'eq',
							value: 'd',
						},
					],
				},
				{
					conjunction: 'AND',
					rules: [
						{attribute: '', operator: 'eq', value: ''},
						{attribute: '', operator: 'eq', value: ''},
					],
				},
			],
		};

		const parsed = JSON.parse(
			serializeCriteria(initState({rulesGroup}), {})
		);

		expect(parsed.rules).toHaveLength(3);
		expect(parsed.rules[1].conjunction).toBe('OR');
		expect(parsed.rules[1].rules).toHaveLength(2);
		expect(parsed.rules[1].rules[0].attribute).toBe('browser_version');
		expect(parsed.rules[2].attribute).toBe('device_type');
		expect(parsed.rules[2].rules).toBeUndefined();
	});

	it('coerces values to the JSON type of their attribute', () => {
		const rulesGroup: AudiencesCriteriaRulesGroup = {
			conjunction: 'AND',
			rules: [
				{
					attribute: 'user_authentication',
					operator: 'eq',
					value: true,
				},
				{attribute: 'local_hour', operator: 'eq', value: 10},
				{
					attribute: 'user_language',
					operator: 'eq',
					value: 'en-US',
				},
			],
		};

		const typesByKey: Record<string, AudiencesCriteria['type']> = {
			local_hour: 'number',
			user_authentication: 'boolean',
			user_language: 'string',
		};

		const parsed = JSON.parse(
			serializeCriteria(initState({rulesGroup}), typesByKey)
		);

		expect(parsed.rules[0].value).toBe(true);
		expect(parsed.rules[1].value).toBe(10);
		expect(parsed.rules[2].value).toBe('en-US');
	});
});
