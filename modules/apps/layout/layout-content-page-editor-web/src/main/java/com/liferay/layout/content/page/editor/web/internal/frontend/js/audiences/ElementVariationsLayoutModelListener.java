/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.layout.content.page.editor.web.internal.frontend.js.audiences;

import com.liferay.frontend.js.audiences.ElementVariations;
import com.liferay.layout.page.template.model.LayoutPageTemplateStructureRelElementVariation;
import com.liferay.portal.kernel.cache.MultiVMPool;
import com.liferay.portal.kernel.cache.PortalCache;
import com.liferay.portal.kernel.model.BaseModelListener;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.model.ModelListener;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Eudaldo Alonso
 */
@Component(service = ModelListener.class)
public class ElementVariationsLayoutModelListener
	extends BaseModelListener<Layout> {

	@Override
	public void onAfterRemove(Layout layout) {
		_removeFromPortalCache(layout);
	}

	@Override
	public void onAfterUpdate(Layout originalLayout, Layout layout) {
		_removeFromPortalCache(layout);
	}

	private void _removeFromPortalCache(Layout layout) {
		PortalCache<Long, ElementVariations> portalCache =
			(PortalCache<Long, ElementVariations>)_multiVMPool.getPortalCache(
				LayoutPageTemplateStructureRelElementVariation.class.getName());

		portalCache.remove(layout.getPlid());
	}

	@Reference
	private MultiVMPool _multiVMPool;

}
