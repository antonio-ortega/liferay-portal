/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {IDataSet} from './types';

export interface ISchemaPart {
	label: string;
	name: string;
	required: boolean;
}

export interface ISchemaMapping {
	[partName: string]: string;
}

function parseJSON(json?: string) {
	if (!json) {
		return null;
	}

	try {
		return JSON.parse(json);
	}
	catch (error) {
		return null;
	}
}

/**
 * Returns the parts a visualization mode client extension declares in its
 * schema, or an empty list when it declares none or declares it wrongly.
 */
export function getSchemaParts(schema?: string): ISchemaPart[] {
	const parts = parseJSON(schema)?.parts;

	if (!Array.isArray(parts)) {
		return [];
	}

	return parts
		.filter((part) => part && typeof part.name === 'string' && part.name)
		.map((part) => ({
			label: part.label || part.name,
			name: part.name,
			required: !!part.required,
		}));
}

/**
 * Returns the field the data set assigns to each part of the schema of a
 * visualization mode, as it persists them in its configuration.
 */
export function getSchemaMapping(
	dataSet: IDataSet,
	visualizationModeName: string
): ISchemaMapping {
	const visualizationModes = parseJSON(dataSet.visualizationModes);

	const visualizationMode = Array.isArray(visualizationModes)
		? visualizationModes.find(({name}) => name === visualizationModeName)
		: null;

	const mapping = visualizationMode?.configuration?.schema;

	return mapping && typeof mapping === 'object' ? mapping : {};
}

/**
 * Returns the assigned parts the schema no longer declares, which happens
 * when the client extension changes its schema after fields were assigned.
 */
export function getStaleParts(
	mapping: ISchemaMapping,
	parts: ISchemaPart[]
): string[] {
	return Object.keys(mapping).filter(
		(name) => !parts.some((part) => part.name === name)
	);
}

export function hasMissingRequiredParts(
	mapping: ISchemaMapping,
	parts: ISchemaPart[]
) {
	return parts.some(({name, required}) => required && !mapping[name]);
}

/**
 * Serializes the visualization modes of the data set with the mapping
 * assigned to one of them, keeping everything else the data set persists.
 */
export function serializeSchemaMapping({
	dataSet,
	mapping,
	visualizationModeName,
}: {
	dataSet: IDataSet;
	mapping: ISchemaMapping;
	visualizationModeName: string;
}) {
	const parsedVisualizationModes = parseJSON(dataSet.visualizationModes);

	const visualizationModes: Array<{[key: string]: any}> = Array.isArray(
		parsedVisualizationModes
	)
		? [...parsedVisualizationModes]
		: [];

	const index = visualizationModes.findIndex(
		({name}) => name === visualizationModeName
	);

	const visualizationMode =
		index === -1
			? {enabled: false, name: visualizationModeName}
			: visualizationModes[index];

	const updatedVisualizationMode = {
		...visualizationMode,
		configuration: {...visualizationMode.configuration, schema: mapping},
	};

	if (index === -1) {
		visualizationModes.push(updatedVisualizationMode);
	}
	else {
		visualizationModes[index] = updatedVisualizationMode;
	}

	return JSON.stringify(visualizationModes);
}
