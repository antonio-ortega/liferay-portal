import ClayButton from '@clayui/button';
import {ClayInput} from '@clayui/form';
import ClayLayout from '@clayui/layout';
import {
	IFDSState,
	getFDSAtom,
	getFDSSearchQuerySelector,
} from '@liferay/frontend-data-set-web';
import {Atom, State} from '@liferay/frontend-js-state-web';
import {useLiferayState} from '@liferay/frontend-js-state-web/react';
import React, {useEffect, useMemo, useState} from 'react';

const ADVANCED_FDS_ATOM_KEY = 'advancedFDSAtom';

/**
 * This fragment highlights sync with FDS from isolated context, if there is
 * already existing recommended sync method on the page. The key used
 * is the key of the shared atom.
 *
 * This is not the recommended sync method. For the recommended method, see
 * "AdvancedFilters" fragment.
 */
const AdvancedSearch = () => {
	const memoizedAtom = useMemo(
		() =>
			getFDSAtom({atomKey: ADVANCED_FDS_ATOM_KEY}) as Atom<IFDSState>,
		[]
	);

	const memoizedSearchQuerySelector = useMemo(
		() => getFDSSearchQuerySelector(memoizedAtom),
		[memoizedAtom]
	);

	const [advancedFDSQuery] = useLiferayState<string>(
		memoizedSearchQuerySelector
	);

	const [query, setQuery] = useState(advancedFDSQuery ?? '');

	useEffect(() => {
		setQuery(advancedFDSQuery);
	}, [advancedFDSQuery]);

	return (
		<ClayLayout.ContainerFluid>
			<ClayInput.Group className="pt-2">
				<ClayInput.GroupItem>
					<ClayInput
						className="form-control"
						component="input"
						onChange={({target: {value}}) => setQuery(value)}
						placeholder="Search in Advanced tab of Frontend Data Set Sample"
						value={query}
					/>
				</ClayInput.GroupItem>

				<ClayInput.GroupItem>
					<ClayButton
						data-qa-id="advancedSearchFDSSampleButton"
						onClick={() => {
							State.writeAtom(memoizedAtom, {
								...State.readAtom(memoizedAtom),
								search: {query},
							});
						}}
					>
						Search
					</ClayButton>
				</ClayInput.GroupItem>
			</ClayInput.Group>
		</ClayLayout.ContainerFluid>
	);
};

export default AdvancedSearch;