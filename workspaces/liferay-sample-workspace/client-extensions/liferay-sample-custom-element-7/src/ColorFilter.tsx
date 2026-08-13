/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import React from 'react';

/**
 * What this element picks, which is what a selection filter tracks: the
 * values chosen, and whether choosing them means keeping or dropping the
 * rows that match.
 */
export interface ColorSelection {
	exclude: boolean;
	values: Array<string>;
}

/**
 * The colors this element offers, and the swatch it paints each one with. Both
 * are its own business: it draws its own filter UI, so the data set hands over
 * which filters it declares and what each one contributes, not the values
 * behind them nor how to render them.
 */
const SWATCHES: Record<string, string> = {
	Blue: '#3a76e0',
	Green: '#2a9d63',
	Red: '#da2d43',
	Yellow: '#f0b429',
};

const COLORS: Array<ColorItem> = Object.keys(SWATCHES).map((value) => ({
	label: value,
	value,
}));

interface ColorItem {
	label: string;
	value: string;
}

/**
 * The OData expression this element applies, which it writes itself: taking
 * the filtering over means owning the whole expression, so how a selection
 * turns into one is the consumer's call rather than something the data set
 * hands down.
 *
 * An empty selection yields nothing rather than an expression matching
 * nothing: picking no color filters by no color.
 */
export function getSelectionOdataFilterString(
	id: string,
	{exclude, values}: ColorSelection
): string {
	if (!values.length) {
		return '';
	}

	const quotedValues = values.map(
		(value) => `'${value.replace(/'/g, "''")}'`
	);

	if (values.length === 1) {
		return `${id} ${exclude ? 'ne' : 'eq'} ${quotedValues[0]}`;
	}

	const expression = `${id} in (${quotedValues.join(', ')})`;

	return exclude ? `not (${expression})` : expression;
}

/**
 * What the selection amounts to, in the terms the rows are in rather than the
 * ones the filter is in.
 */
function describeSelection({exclude, values}: ColorSelection): string {
	if (!values.length) {
		return 'Every color';
	}

	const labels = values.map(
		(value) => COLORS.find((color) => color.value === value)?.label ?? value
	);

	return `${exclude ? 'Every color but ' : ''}${labels.join(', ')}`;
}

interface ColorFilterProps {
	disabled: boolean;
	label: string;
	onChange: (colorSelection: ColorSelection) => void;
	selection: ColorSelection;
}

function ColorFilter({disabled, label, onChange, selection}: ColorFilterProps) {
	const {exclude, values} = selection;

	const toggleValue = (value: string) =>
		onChange({
			exclude,
			values: values.includes(value)
				? values.filter((selectedValue) => selectedValue !== value)
				: [...values, value],
		});

	return (
		<div>
			<div className="align-items-center d-flex gap-md mb-2">
				<strong>{label}</strong>

				<div className="btn-group" role="group">
					{[false, true].map((excludeOption) => (
						<div
							className="btn-group-item"
							key={`${excludeOption}`}
						>
							<button
								aria-pressed={exclude === excludeOption}
								className={`btn btn-sm ${
									exclude === excludeOption
										? 'btn-primary'
										: 'btn-secondary'
								}`}
								disabled={disabled}
								onClick={() =>
									onChange({exclude: excludeOption, values})
								}
								type="button"
							>
								{excludeOption ? 'Exclude' : 'Include'}
							</button>
						</div>
					))}
				</div>

				{values.length ? (
					<button
						className="btn btn-sm btn-unstyled link-primary"
						disabled={disabled}
						onClick={() => onChange({exclude, values: []})}
						type="button"
					>
						Reset
					</button>
				) : null}
			</div>

			<div className="d-flex flex-wrap gap-sm">
				{COLORS.map((item) => {
					const {value} = item;

					const selected = values.includes(value);

					return (
						<button
							aria-pressed={selected}
							className={`align-items-center btn btn-sm d-inline-flex gap-sm rounded-pill ${
								selected
									? exclude
										? 'btn-danger'
										: 'btn-primary'
									: 'btn-secondary'
							}`}
							disabled={disabled}
							key={value}
							onClick={() => toggleValue(value)}
							type="button"
						>
							<span
								className="color-swatch rounded-circle"
								style={
									{
										'--color-swatch': SWATCHES[value],
									} as React.CSSProperties
								}
							/>

							{item.label}
						</button>
					);
				})}
			</div>

			<small className="d-block mt-2">
				{describeSelection(selection)}
			</small>
		</div>
	);
}

export default ColorFilter;
