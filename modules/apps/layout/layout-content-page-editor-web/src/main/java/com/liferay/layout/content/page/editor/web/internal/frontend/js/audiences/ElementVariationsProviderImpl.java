/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.layout.content.page.editor.web.internal.frontend.js.audiences;

import com.liferay.frontend.js.audiences.ElementVariations;
import com.liferay.frontend.js.audiences.ElementVariationsProvider;
import com.liferay.layout.content.page.editor.web.internal.frontend.js.audiences.util.ElementVariationsJSUtil;
import com.liferay.layout.page.template.model.LayoutPageTemplateStructureRelElementVariation;
import com.liferay.layout.page.template.model.LayoutPageTemplateStructureRelElementVariationAudienceEntryRel;
import com.liferay.layout.page.template.service.LayoutPageTemplateStructureRelElementVariationAudienceEntryRelLocalService;
import com.liferay.layout.page.template.service.LayoutPageTemplateStructureRelElementVariationLocalService;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.cache.MultiVMPool;
import com.liferay.portal.kernel.cache.PortalCache;
import com.liferay.portal.kernel.feature.flag.FeatureFlagManagerUtil;
import com.liferay.portal.kernel.frontend.hashed.files.HashedFilesUtil;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.model.Layout;
import com.liferay.portal.kernel.service.LayoutLocalService;
import com.liferay.portal.kernel.util.LocaleUtil;
import com.liferay.portal.kernel.util.LocalizationUtil;
import com.liferay.portal.kernel.util.StringUtil;
import com.liferay.portal.kernel.util.Validator;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Deactivate;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Eudaldo Alonso
 */
@Component(service = ElementVariationsProvider.class)
public class ElementVariationsProviderImpl
	implements ElementVariationsProvider {

	@Override
	public ElementVariations getElementVariations(long plid) {
		Layout layout = _layoutLocalService.fetchLayout(plid);

		if (layout == null) {
			return null;
		}

		if (!FeatureFlagManagerUtil.isEnabled(
				layout.getCompanyId(), "LPD-93951")) {

			return null;
		}

		ElementVariations elementVariations = _portalCache.get(plid);

		if (elementVariations != null) {
			return elementVariations;
		}

		String content = ElementVariationsJSUtil.getContent(
			_getElementVariationsJS(plid));

		elementVariations = new ElementVariations(
			content, HashedFilesUtil.computeHash(content));

		_portalCache.put(plid, elementVariations);

		return elementVariations;
	}

	@Activate
	protected void activate() {
		_portalCache =
			(PortalCache<Long, ElementVariations>)_multiVMPool.getPortalCache(
				LayoutPageTemplateStructureRelElementVariation.class.getName());
	}

	@Deactivate
	protected void deactivate() {
		_multiVMPool.removePortalCache(
			LayoutPageTemplateStructureRelElementVariation.class.getName());
	}

	private String _getDefaultLanguageId(
		LayoutPageTemplateStructureRelElementVariation
			layoutPageTemplateStructureRelElementVariation) {

		for (String xml :
				new String[] {
					layoutPageTemplateStructureRelElementVariation.getHtml(),
					layoutPageTemplateStructureRelElementVariation.getHide(),
					layoutPageTemplateStructureRelElementVariation.getJs()
				}) {

			if (Validator.isNotNull(xml)) {
				return LocalizationUtil.getDefaultLanguageId(xml);
			}
		}

		return LocaleUtil.toLanguageId(LocaleUtil.getSiteDefault());
	}

	private String _getElementVariationJS(
		LayoutPageTemplateStructureRelElementVariation
			layoutPageTemplateStructureRelElementVariation,
		List<LayoutPageTemplateStructureRelElementVariationAudienceEntryRel>
			layoutPageTemplateStructureRelElementVariationAudienceEntryRels) {

		JSONArray audienceEntryERCsJSONArray = _jsonFactory.createJSONArray();

		for (LayoutPageTemplateStructureRelElementVariationAudienceEntryRel
				layoutPageTemplateStructureRelElementVariationAudienceEntryRel :
					layoutPageTemplateStructureRelElementVariationAudienceEntryRels) {

			audienceEntryERCsJSONArray.put(
				layoutPageTemplateStructureRelElementVariationAudienceEntryRel.
					getAudienceEntryERC());
		}

		JSONObject jsonObject = _jsonFactory.createJSONObject(
		).put(
			"audienceEntryERCs", audienceEntryERCsJSONArray
		).put(
			"defaultLanguageId",
			_getDefaultLanguageId(
				layoutPageTemplateStructureRelElementVariation)
		).put(
			"hide",
			_getLocalizedValuesJSONObject(
				layoutPageTemplateStructureRelElementVariation.getHideMap())
		).put(
			"html",
			_getLocalizedValuesJSONObject(
				layoutPageTemplateStructureRelElementVariation.getHtmlMap())
		).put(
			"js", _JS_TOKEN
		).put(
			"targetElement",
			layoutPageTemplateStructureRelElementVariation.getTargetElement()
		);

		return StringUtil.replace(
			jsonObject.toString(), "\"" + _JS_TOKEN + "\"",
			_getJSFunctions(layoutPageTemplateStructureRelElementVariation));
	}

	private String _getElementVariationsJS(long plid) {
		StringBundler sb = new StringBundler();

		sb.append("[");

		List<LayoutPageTemplateStructureRelElementVariation>
			layoutPageTemplateStructureRelElementVariations =
				_layoutPageTemplateStructureRelElementVariationLocalService.
					getLayoutPageTemplateStructureRelElementVariations(plid);

		boolean first = true;

		for (LayoutPageTemplateStructureRelElementVariation
				layoutPageTemplateStructureRelElementVariation :
					layoutPageTemplateStructureRelElementVariations) {

			List
				<LayoutPageTemplateStructureRelElementVariationAudienceEntryRel>
					layoutPageTemplateStructureRelElementVariationAudienceEntryRels =
						_layoutPageTemplateStructureRelElementVariationAudienceEntryRelLocalService.
							getLayoutPageTemplateStructureRelElementVariationAudienceEntryRels(
								layoutPageTemplateStructureRelElementVariation.
									getExternalReferenceCode());

			if (layoutPageTemplateStructureRelElementVariationAudienceEntryRels.
					isEmpty()) {

				continue;
			}

			if (!first) {
				sb.append(",");
			}

			first = false;

			sb.append(
				_getElementVariationJS(
					layoutPageTemplateStructureRelElementVariation,
					layoutPageTemplateStructureRelElementVariationAudienceEntryRels));
		}

		sb.append("]");

		return sb.toString();
	}

	private String _getJSFunctions(
		LayoutPageTemplateStructureRelElementVariation
			layoutPageTemplateStructureRelElementVariation) {

		StringBundler sb = new StringBundler();

		sb.append("{");

		boolean first = true;

		for (Map.Entry<Locale, String> entry :
				layoutPageTemplateStructureRelElementVariation.getJsMap().
					entrySet()) {

			if (Validator.isNull(entry.getValue())) {
				continue;
			}

			if (!first) {
				sb.append(", ");
			}

			first = false;

			sb.append("\"");
			sb.append(LocaleUtil.toLanguageId(entry.getKey()));
			sb.append("\": function (element) {\n");
			sb.append(entry.getValue());
			sb.append("\n}");
		}

		sb.append("}");

		return sb.toString();
	}

	private JSONObject _getLocalizedValuesJSONObject(
		Map<Locale, String> valuesMap) {

		JSONObject jsonObject = _jsonFactory.createJSONObject();

		for (Map.Entry<Locale, String> entry : valuesMap.entrySet()) {
			if (Validator.isNotNull(entry.getValue())) {
				jsonObject.put(
					LocaleUtil.toLanguageId(entry.getKey()), entry.getValue());
			}
		}

		return jsonObject;
	}

	private static final String _JS_TOKEN = "[$ELEMENT_VARIATION_JS$]";

	@Reference
	private JSONFactory _jsonFactory;

	@Reference
	private LayoutLocalService _layoutLocalService;

	@Reference
	private LayoutPageTemplateStructureRelElementVariationAudienceEntryRelLocalService
		_layoutPageTemplateStructureRelElementVariationAudienceEntryRelLocalService;

	@Reference
	private LayoutPageTemplateStructureRelElementVariationLocalService
		_layoutPageTemplateStructureRelElementVariationLocalService;

	@Reference
	private MultiVMPool _multiVMPool;

	private PortalCache<Long, ElementVariations> _portalCache;

}
