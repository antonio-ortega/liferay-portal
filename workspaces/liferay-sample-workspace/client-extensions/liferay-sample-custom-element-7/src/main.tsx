/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */
import React from 'react';
import {createRoot} from 'react-dom/client';

import ClassicSearch from './ClassicSearch';

const ELEMENT_ID = 'liferay-sample-custom-element-7';

class LiferaySampleCustomElement extends HTMLElement {
	connectedCallback() {
		const fdsName = this.getAttribute('fdsName');
		if (fdsName){
			createRoot(this).render(<ClassicSearch fdsName={fdsName} />);
		}
	}
}

if (!customElements.get(ELEMENT_ID)) {
	customElements.define(
		ELEMENT_ID,
		LiferaySampleCustomElement
	);
}
