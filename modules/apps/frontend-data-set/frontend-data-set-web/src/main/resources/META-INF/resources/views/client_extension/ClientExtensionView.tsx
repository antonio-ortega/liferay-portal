/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React, {useContext, useEffect, useMemo, useRef, useState} from 'react';

import FrontendDataSetContext, {
	IFrontendDataSetContext,
} from '../../FrontendDataSetContext';
import ViewErrorAlert from '../ViewErrorAlert';

import type {
	FDSVisualizationMode,
	FDSVisualizationModeArgs,
	FDSVisualizationModeInstance,
	FDSVisualizationModeItem,
	FDSVisualizationModeSchema,
} from '@liferay/js-api/data-set';

interface IClientExtensionViewProps {
	items: Array<FDSVisualizationModeItem>;
	moduleURL?: string;
	onItemSelectionChange: (
		item: FDSVisualizationModeItem,
		forceSingleSelection: boolean
	) => void;
	schema?: FDSVisualizationModeSchema;
	visualizationMode?: FDSVisualizationMode;
}

/**
 * The module URL of a view is expressed as "<export> from <url>".
 */
export function getModuleURL(contentRendererModuleURL?: string) {
	return contentRendererModuleURL?.replace(/^\S+ from /, '');
}

/**
 * A module can load chunks that live next to it, so errors thrown from any
 * script in the same directory are attributed to it. A module served from the
 * root of an origin is only matched by its exact URL, since its directory
 * would also cover unrelated scripts.
 */
function getModuleScope(moduleURL: string) {
	try {
		const {origin, pathname} = new URL(moduleURL, window.location.href);

		const directory = pathname.slice(0, pathname.lastIndexOf('/') + 1);

		return directory.length > 1 ? origin + directory : moduleURL;
	}
	catch {
		return moduleURL;
	}
}

function isModuleFile(moduleURL: string | undefined, filename?: string) {
	return (
		!!moduleURL &&
		!!filename &&
		(filename === moduleURL ||
			filename.startsWith(getModuleScope(moduleURL)))
	);
}

function isFromModule(moduleURL: string | undefined, error: unknown) {
	return (
		!!moduleURL &&
		error instanceof Error &&
		typeof error.stack === 'string' &&
		error.stack.includes(getModuleScope(moduleURL))
	);
}

function logError(
	visualizationMode: FDSVisualizationMode | undefined,
	error: unknown
) {
	console.error(
		'The client extension implemented by the function',
		visualizationMode,
		'caused an error when trying to render its HTML content.',
		'Please fix your client extension.',
		error
	);
}

export default function ClientExtensionView({
	items,
	moduleURL,
	onItemSelectionChange,
	schema,
	visualizationMode,
}: IClientExtensionViewProps) {
	const {
		loadData,
		selectable,
		selectedItemsKey,
		selectedItemsValue,
		selectionType,
	}: IFrontendDataSetContext = useContext(FrontendDataSetContext);

	const containerRef = useRef<HTMLDivElement>(null);
	const [error, setError] = useState(false);
	const instanceRef = useRef<FDSVisualizationModeInstance | null>(null);
	const loadDataRef = useRef(loadData);
	const onItemSelectionChangeRef = useRef(onItemSelectionChange);

	useEffect(() => {
		loadDataRef.current = loadData;
		onItemSelectionChangeRef.current = onItemSelectionChange;
	});

	const args = useMemo<FDSVisualizationModeArgs>(
		() => ({
			items,
			loadData: async () => {
				await loadDataRef.current();
			},
			schema,
			selection:
				selectable && selectionType
					? {
							itemsKey: selectedItemsKey,
							selectedValues: selectedItemsValue ?? [],
							toggleItem: (item) =>
								onItemSelectionChangeRef.current(
									item,
									selectionType === 'single'
								),
							type: selectionType,
						}
					: undefined,
		}),
		[
			items,
			schema,
			selectable,
			selectedItemsKey,
			selectedItemsValue,
			selectionType,
		]
	);

	useEffect(() => {
		const {current: container} = containerRef;

		if (!container || error) {
			return;
		}

		try {
			if (typeof visualizationMode !== 'function') {
				throw new Error(
					'The client extension does not export a visualization mode'
				);
			}

			if (instanceRef.current) {
				instanceRef.current.update(args);
			}
			else {
				instanceRef.current = visualizationMode(container, args);

				instanceRef.current.update(args);
			}
		}
		catch (error) {
			logError(visualizationMode, error);

			setError(true);
		}
	}, [args, error, visualizationMode]);

	useEffect(() => {

		// Errors thrown from async callbacks, unhandled promise rejections and
		// DOM event listeners do not reach the try/catch blocks above, so
		// listen globally and only react to those originating in this module.

		const handleError = (event: ErrorEvent) => {
			if (
				isModuleFile(moduleURL, event.filename) ||
				isFromModule(moduleURL, event.error)
			) {
				logError(visualizationMode, event.error ?? event.message);

				setError(true);
			}
		};

		const handleRejection = (event: PromiseRejectionEvent) => {
			if (isFromModule(moduleURL, event.reason)) {
				logError(visualizationMode, event.reason);

				setError(true);
			}
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleRejection);
		};
	}, [moduleURL, visualizationMode]);

	useEffect(() => {
		const {current: container} = containerRef;

		return () => {
			const {current: instance} = instanceRef;

			instanceRef.current = null;

			try {
				instance?.destroy();
			}
			catch (error) {
				logError(visualizationMode, error);
			}

			container?.replaceChildren();
		};
	}, [error, visualizationMode]);

	return (
		<>
			{error && <ViewErrorAlert />}

			<div hidden={error} ref={containerRef} />
		</>
	);
}

export function getClientExtensionViewComponent(
	visualizationMode: FDSVisualizationMode,
	contentRendererModuleURL: string
) {
	const moduleURL = getModuleURL(contentRendererModuleURL);

	return function VisualizationModeClientExtensionView(
		props: Omit<
			IClientExtensionViewProps,
			'moduleURL' | 'visualizationMode'
		>
	) {
		return (
			<ClientExtensionView
				{...props}
				moduleURL={moduleURL}
				visualizationMode={visualizationMode}
			/>
		);
	};
}
