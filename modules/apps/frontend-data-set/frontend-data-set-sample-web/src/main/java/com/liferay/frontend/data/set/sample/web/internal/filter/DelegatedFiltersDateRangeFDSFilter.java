/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.frontend.data.set.sample.web.internal.filter;

import com.liferay.frontend.data.set.constants.FDSEntityFieldTypes;
import com.liferay.frontend.data.set.filter.BaseDateRangeFDSFilter;
import com.liferay.frontend.data.set.filter.DateFDSFilterItem;
import com.liferay.frontend.data.set.filter.FDSFilter;
import com.liferay.frontend.data.set.sample.web.internal.constants.FDSSampleFDSNames;
import com.liferay.portal.kernel.util.HashMapBuilder;

import java.util.Calendar;
import java.util.Map;

import org.osgi.service.component.annotations.Component;

/**
 * A date range the configuration picks on the data set's behalf, so that a
 * client extension taking the filtering over has a range to read and start
 * from rather than an empty filter.
 *
 * @author Antonio Ortega
 */
@Component(
	property = "frontend.data.set.name=" + FDSSampleFDSNames.DELEGATED_FILTERS,
	service = FDSFilter.class
)
public class DelegatedFiltersDateRangeFDSFilter extends BaseDateRangeFDSFilter {

	@Override
	public String getEntityFieldType() {
		return FDSEntityFieldTypes.DATE;
	}

	@Override
	public String getId() {
		return "date";
	}

	@Override
	public String getLabel() {
		return "date-range";
	}

	@Override
	public DateFDSFilterItem getMaxDateFDSFilterItem() {
		Calendar calendar = Calendar.getInstance();

		return new DateFDSFilterItem(
			calendar.get(Calendar.DAY_OF_MONTH),
			calendar.get(Calendar.MONTH) + 1, calendar.get(Calendar.YEAR));
	}

	@Override
	public DateFDSFilterItem getMinDateFDSFilterItem() {
		return new DateFDSFilterItem(0, 0, 0);
	}

	@Override
	public Map<String, Object> getPreloadedData() {

		// Each end of the range is a DateFDSFilterItem, which is what the
		// serializer turns into the day, month, and year the filter reads. A
		// JSONObject nested here does not survive the serialization, and the
		// filter reads the range as zeroed instead.

		return HashMapBuilder.<String, Object>put(
			"from", new DateFDSFilterItem(1, 1, 2021)
		).put(
			"to", new DateFDSFilterItem(31, 12, 2021)
		).build();
	}

}