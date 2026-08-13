/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

// A stylesheet is imported for its side effect: the bundler emits it next to
// the module, and the client extension serves it through "cssURLs". It has
// nothing to hand back, which is what this declaration says.

declare module '*.css';
