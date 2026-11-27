/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayAlert from '@clayui/alert';
import React from 'react';

export default function ViewErrorAlert() {
	return (
		<ClayAlert
			className="m-3"
			displayType="danger"
			title={Liferay.Language.get('error')}
		>
			{Liferay.Language.get(
				'this-visualization-mode-could-not-be-displayed'
			)}
		</ClayAlert>
	);
}
