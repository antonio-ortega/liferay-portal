import ClayButton from '@clayui/button';
import {ClayInput} from '@clayui/form';
import ClayLayout from '@clayui/layout';
import React, {useEffect, useState} from 'react';

import {getFDSAtom, FDSState} from '../../../../../../liferay-frontend-projects/projects/js-toolkit/packages/js-api/data-set';
import {Atom, readAtom, writeAtom, subscribeAtom} from '../../../../../../liferay-frontend-projects/projects/js-toolkit/packages/js-api/state';

const ClassicSearch = ({fdsName}: {fdsName: string}) => {
	const [atom, setAtom] = useState<Atom<FDSState> | null>(null);
	const [classicFDSState, setclassicFDSState] = useState<FDSState | null>(null);
	const [query, setQuery] = useState('');

	useEffect(() => {
		let subscription: {dispose: () => void} | null = null;

		getFDSAtom(fdsName).then((fdsAtom) => {
			setAtom(fdsAtom);

			const currentState = readAtom(fdsAtom);
			setclassicFDSState(currentState);
			setQuery(currentState?.search?.query ?? '');

			subscription = subscribeAtom(fdsAtom, (newValue: FDSState) => {
				setclassicFDSState(newValue);
				setQuery(newValue?.search?.query ?? '');
			});
		});

		return () => {
			if (subscription) subscription.dispose();
		};
	}, [fdsName]);

	useEffect(() => {
		setQuery(classicFDSState?.search?.query ?? '');
	}, [classicFDSState]);

	return (
		<ClayLayout.ContainerFluid>
			<ClayInput.Group className="pt-2">
				<ClayInput.GroupItem>
					<ClayInput
						className="form-control"
						component="input"
						onChange={({target: {value}}) => setQuery(value)}
						placeholder="Search in Classic tab of Frontend Data Set Sample"
						value={query}
					/>
				</ClayInput.GroupItem>

				<ClayInput.GroupItem>
					<ClayButton
						disabled={!atom}
						data-qa-id="classicSearchFDSSampleButton"
						onClick={() => {
							if (!atom || !classicFDSState) return;

							writeAtom(atom, {
								...classicFDSState,
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

export default ClassicSearch;