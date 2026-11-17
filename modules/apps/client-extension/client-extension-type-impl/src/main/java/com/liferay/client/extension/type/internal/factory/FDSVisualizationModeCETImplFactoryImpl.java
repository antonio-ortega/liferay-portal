/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.client.extension.type.internal.factory;

import com.liferay.client.extension.exception.ClientExtensionEntryTypeSettingsException;
import com.liferay.client.extension.type.FDSVisualizationModeCET;
import com.liferay.client.extension.type.internal.FDSVisualizationModeCETImpl;
import com.liferay.portal.kernel.exception.PortalException;
import com.liferay.portal.kernel.json.JSONArray;
import com.liferay.portal.kernel.json.JSONException;
import com.liferay.portal.kernel.json.JSONFactory;
import com.liferay.portal.kernel.json.JSONObject;
import com.liferay.portal.kernel.log.Log;
import com.liferay.portal.kernel.log.LogFactoryUtil;
import com.liferay.portal.kernel.util.ParamUtil;
import com.liferay.portal.kernel.util.UnicodeProperties;
import com.liferay.portal.kernel.util.UnicodePropertiesBuilder;
import com.liferay.portal.kernel.util.Validator;

import jakarta.portlet.PortletRequest;

import java.util.Date;
import java.util.HashSet;
import java.util.Properties;
import java.util.Set;

/**
 * @author Antonio Ortega
 */
public class FDSVisualizationModeCETImplFactoryImpl
	extends BaseCETImplFactoryImpl<FDSVisualizationModeCET> {

	public FDSVisualizationModeCETImplFactoryImpl(JSONFactory jsonFactory) {
		super(FDSVisualizationModeCET.class);

		_jsonFactory = jsonFactory;
	}

	@Override
	public FDSVisualizationModeCET create(
		String baseURL, long companyId, Date createDate, String description,
		String externalReferenceCode, Date modifiedDate, String name,
		Properties properties, boolean readOnly, String sourceCodeURL,
		int status, UnicodeProperties typeSettingsUnicodeProperties) {

		return new FDSVisualizationModeCETImpl(
			baseURL, companyId, createDate, description, externalReferenceCode,
			modifiedDate, name, properties, readOnly, sourceCodeURL, status,
			typeSettingsUnicodeProperties);
	}

	@Override
	public UnicodeProperties getUnicodeProperties(
		PortletRequest portletRequest) {

		return UnicodePropertiesBuilder.create(
			true
		).put(
			"icon", ParamUtil.getString(portletRequest, "icon")
		).put(
			"schema", ParamUtil.getString(portletRequest, "schema")
		).put(
			"url", ParamUtil.getString(portletRequest, "url")
		).build();
	}

	@Override
	public void validate(
			FDSVisualizationModeCET newFDSVisualizationModeCET,
			FDSVisualizationModeCET oldFDSVisualizationModeCET)
		throws PortalException {

		if (Validator.isNull(newFDSVisualizationModeCET.getURL())) {
			throw new ClientExtensionEntryTypeSettingsException(
				"At least one JavaScript URL is required",
				"please-enter-at-least-one-javascript-url");
		}

		if (Validator.isNull(newFDSVisualizationModeCET.getIcon())) {
			throw new ClientExtensionEntryTypeSettingsException(
				"Icon is null", "please-select-an-icon");
		}

		_validateSchema(newFDSVisualizationModeCET.getSchema());
	}

	private void _validateSchema(String schema) throws PortalException {
		if (Validator.isBlank(schema)) {
			return;
		}

		JSONObject jsonObject = null;

		try {
			jsonObject = _jsonFactory.createJSONObject(schema);
		}
		catch (JSONException jsonException) {
			_log.error(jsonException);

			throw new ClientExtensionEntryTypeSettingsException(
				"Invalid schema JSON: " + schema,
				"the-schema-is-not-valid-json");
		}

		JSONArray partsJSONArray = jsonObject.getJSONArray("parts");

		if ((partsJSONArray == null) || (partsJSONArray.length() == 0)) {
			throw new ClientExtensionEntryTypeSettingsException(
				"Schema must declare at least one part",
				"the-schema-must-declare-at-least-one-part");
		}

		Set<String> names = new HashSet<>();

		for (int i = 0; i < partsJSONArray.length(); i++) {
			JSONObject partJSONObject = partsJSONArray.getJSONObject(i);

			String name = null;

			if (partJSONObject != null) {
				name = partJSONObject.getString("name");
			}

			if (Validator.isBlank(name)) {
				throw new ClientExtensionEntryTypeSettingsException(
					"Every schema part must have a name",
					"every-schema-part-must-have-a-name");
			}

			if (!names.add(name)) {
				throw new ClientExtensionEntryTypeSettingsException(
					"Duplicate schema part name: " + name,
					"schema-part-name-x-is-duplicated", name);
			}
		}
	}

	private static final Log _log = LogFactoryUtil.getLog(
		FDSVisualizationModeCETImplFactoryImpl.class);

	private final JSONFactory _jsonFactory;

}