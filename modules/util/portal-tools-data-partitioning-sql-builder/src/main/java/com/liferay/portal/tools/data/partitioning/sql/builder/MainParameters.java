/**
 * Copyright (c) 2000-present Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */

package com.liferay.portal.tools.data.partitioning.sql.builder;

import com.beust.jcommander.Parameter;

import com.liferay.portal.tools.data.partitioning.sql.builder.exporter.context.ExportContext;
import com.liferay.portal.tools.data.partitioning.sql.builder.internal.util.PropsReader;
import com.liferay.portal.tools.data.partitioning.sql.builder.internal.validators.CompanyIdsRequiredParameterValidator;
import com.liferay.portal.tools.data.partitioning.sql.builder.internal.validators.FileRequiredParameterValidator;
import com.liferay.portal.tools.data.partitioning.sql.builder.internal.validators.RequiredParameterValidator;
import com.liferay.portal.tools.data.partitioning.sql.builder.internal.validators.WritableFileRequiredParameterValidator;

import java.io.IOException;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Manuel de la Peña
 */
public class MainParameters {

	public String getCompanyIds() {
		return _COMPANY_IDS;
	}

	public String getOutputDirName() {
		return _OUTPUT_DIR_NAME;
	}

	public String getPropertiesFileName() {
		return _PROPERTIES_FILE_NAME;
	}

	public String getSchemaName() {
		return _SCHEMA_NAME;
	}

	public boolean isWriteFile() {
		return _WRITE_FILE;
	}

	public ExportContext toExportContext() throws IOException {
		return new ExportContext(
			_getCompanyIds(), _OUTPUT_DIR_NAME,
			PropsReader.read(getPropertiesFileName()), _SCHEMA_NAME,
			_WRITE_FILE);
	}

	private List<Long> _getCompanyIds() {
		List<Long> companyIds = new ArrayList<>();

		for (String companyId : _COMPANY_IDS.split(",")) {
			companyIds.add(Long.parseLong(companyId));
		}

		return companyIds;
	}

	@Parameter(
		description = "Comma-separated list of company IDs to be exported",
		names = {"-C", "--company-ids"},
		validateWith = CompanyIdsRequiredParameterValidator.class
	)
	private static final String _COMPANY_IDS;

	@Parameter(
		description = "Output directory", names = {"-O", "--output-dir"},
		validateWith = WritableFileRequiredParameterValidator.class
	)
	private static final String _OUTPUT_DIR_NAME;

	@Parameter(
		description = "Properties file with database configuration",
		names = {"-P", "--properties-file"},
		validateWith = FileRequiredParameterValidator.class
	)
	private static final String _PROPERTIES_FILE_NAME;

	@Parameter(
		description = "Schema name to be exported",
		names = {"-S", "--schema-name"},
		validateWith = RequiredParameterValidator.class
	)
	private static final String _SCHEMA_NAME;

	@Parameter(
		description = "Whether to write tables to separate SQL files",
		names = {"-W", "--write-file"}
	)
	private static final boolean _WRITE_FILE;

}