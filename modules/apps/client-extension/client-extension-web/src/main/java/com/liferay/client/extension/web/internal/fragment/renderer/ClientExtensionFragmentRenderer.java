/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.client.extension.web.internal.fragment.renderer;

import com.liferay.client.extension.type.CET;
import com.liferay.client.extension.type.manager.CETManager;
import com.liferay.fragment.model.FragmentEntryLink;
import com.liferay.fragment.renderer.FragmentRenderer;
import com.liferay.fragment.renderer.FragmentRendererContext;
import com.liferay.fragment.util.configuration.FragmentEntryConfigurationParser;
import com.liferay.object.entry.util.ObjectEntryThreadLocal;
import com.liferay.petra.string.StringBundler;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.json.JSONUtil;
import com.liferay.portal.kernel.language.Language;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.theme.ThemeDisplay;
import com.liferay.portal.kernel.util.WebKeys;
import com.liferay.portal.vulcan.pagination.Pagination;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringReader;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Properties;

import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * @author Antonio Ortega
 */
@Component(service = FragmentRenderer.class)
public class ClientExtensionFragmentRenderer implements FragmentRenderer {

	@Override
	public String getCollectionKey() {
		return "content-display";
	}

	@Override
	public JSONObject getConfigurationJSONObject(
		FragmentRendererContext fragmentRendererContext) {

		return JSONUtil.put(
			"fieldSets",
			JSONUtil.putAll(
				JSONUtil.put(
					"fields",
					JSONUtil.putAll(
						JSONUtil.put(
							"label", "client-extension"
						).put(
							"name", "itemSelector"
						).put(
							"type", "itemSelector"
						).put(
							"typeOptions",
							JSONUtil.put("itemType", "ClientExtension")
						)))));
	}

	@Override
	public String getIcon() {
		return "table";
	}

	@Override
	public String getLabel(Locale locale) {
		return _language.get(locale, "client-extension");
	}

	@Override
	public boolean isSelectable(HttpServletRequest httpServletRequest) {
		return true;
	}

	@Override
	public void render(
			FragmentRendererContext fragmentRendererContext,
			HttpServletRequest httpServletRequest,
			HttpServletResponse httpServletResponse)
		throws IOException {

		try {
			ObjectEntryThreadLocal.setSkipObjectEntryResourcePermission(true);

			PrintWriter printWriter = httpServletResponse.getWriter();

			FragmentEntryLink fragmentEntryLink =
				fragmentRendererContext.getFragmentEntryLink();

			JSONObject jsonObject =
				(JSONObject)_fragmentEntryConfigurationParser.getFieldValue(
					getConfigurationJSONObject(fragmentRendererContext),
					fragmentEntryLink.getEditableValuesJSONObject(),
					fragmentRendererContext.getLocale(), "itemSelector");

			String externalReferenceCode = jsonObject.getString(
				"externalReferenceCode");

			ThemeDisplay themeDisplay =
				(ThemeDisplay)httpServletRequest.getAttribute(
					WebKeys.THEME_DISPLAY);

			long companyId = themeDisplay.getCompanyId();

			List<CET> clientExtensions = _cetManager.getCETs(
				companyId, null, null, Pagination.of(-1, -1), null);

			Optional<CET> clientExtensionEntry = clientExtensions.stream(
			).filter(
				cet -> cet.getExternalReferenceCode(
				).equals(
					externalReferenceCode
				)
			).findFirst();

			String typeSettings = clientExtensionEntry.map(
				CET::getTypeSettings
			).orElse(
				null
			);

			Properties typeSettingsProps = new Properties();

			typeSettingsProps.load(new StringReader(typeSettings));

			String htmlElementName = typeSettingsProps.getProperty(
				"htmlElementName");
			String urls = typeSettingsProps.getProperty("urls");
			boolean useESM = Boolean.parseBoolean(
				typeSettingsProps.getProperty("useESM"));
			String type = useESM ? "module" : "text/javascript";

			String[] urlList = urls.split("_SAFE_NEWLINE_CHARACTER_");

			for (String url : urlList) {
				if ((url != null) &&
					!url.trim(
					).isEmpty()) {

					printWriter.write(
						StringBundler.concat(
							"<script src=\"", url.trim(), "\" type=\"", type,
							"\" data-senna-track=\"temporary\"></script>"));
				}
			}

			printWriter.write(
				StringBundler.concat(
					"<", htmlElementName, "></", htmlElementName, ">"));
		}
		catch (Exception exception) {
			_log.error("Unable to render client extension", exception);

			throw new IOException(exception);
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		ClientExtensionFragmentRenderer.class);

	@Reference
	private CETManager _cetManager;

	@Reference
	private FragmentEntryConfigurationParser _fragmentEntryConfigurationParser;

	@Reference
	private Language _language;

}