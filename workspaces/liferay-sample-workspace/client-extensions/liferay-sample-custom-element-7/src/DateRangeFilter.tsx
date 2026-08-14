/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

/**
 * What this element picks, in the terms a date input reads and writes:
 * "YYYY-MM-DD", or empty for an open end of the range.
 */
export interface DateRangeSelection {
	from: string;
	to: string;
}

export const NO_DATE_RANGE: DateRangeSelection = {from: '', to: ''};

/**
 * The OData expression this element applies for the range, which the data set
 * wraps in parentheses along with every other expression in play, so an
 * unparenthesized "and" is enough here.
 *
 * An open end of the range yields a one-sided comparison, and a range with
 * neither end yields nothing rather than an expression matching everything.
 */
export function getDateRangeOdataFilterString(
	id: string,
	{from, to}: DateRangeSelection
): string {
	const comparisons = [];

	if (from) {
		comparisons.push(`${id} ge ${from}`);
	}

	if (to) {
		comparisons.push(`${id} le ${to}`);
	}

	return comparisons.join(' and ');
}

interface DateRangeFilterProps {
	disabled: boolean;
	label: string;
	onChange: (dateRangeSelection: DateRangeSelection) => void;
	selection: DateRangeSelection;
}

function DateRangeFilter({
	disabled,
	label,
	onChange,
	selection,
}: DateRangeFilterProps) {
	const {from, to} = selection;

	return (
		<div>
			<div className="align-items-center d-flex gap-md mb-2">
				<strong>{label}</strong>

				{from || to ? (
					<button
						className="btn btn-sm btn-unstyled link-primary"
						disabled={disabled}
						onClick={() => onChange(NO_DATE_RANGE)}
						type="button"
					>
						Reset
					</button>
				) : null}
			</div>

			<div className="align-items-center d-flex gap-sm">
				<label className="m-0" htmlFor="date-range-from">
					From
				</label>

				<input
					className="form-control"
					disabled={disabled}
					id="date-range-from"
					onChange={(event) =>
						onChange({from: event.target.value, to})
					}
					type="date"
					value={from}
				/>

				<label className="m-0" htmlFor="date-range-to">
					To
				</label>

				<input
					className="form-control"
					disabled={disabled}
					id="date-range-to"
					onChange={(event) =>
						onChange({from, to: event.target.value})
					}
					type="date"
					value={to}
				/>
			</div>
		</div>
	);
}

export default DateRangeFilter;
