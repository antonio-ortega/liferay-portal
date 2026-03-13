import ClayButton from '@clayui/button';
import {ClayInput} from '@clayui/form';
import ClayLayout from '@clayui/layout';
import React, {useEffect, useState} from 'react';

import type {paquito} from '../../../../../../liferay-frontend-projects/projects/js-toolkit/packages/js-api/data-set';

import useLiferayState from '../../../../../../liferay-frontend-projects/projects/js-toolkit/packages/js-api/data-set';

const AdvancedSearch = ({fdsAtomKey}: {fdsAtomKey: string}) => {
	const [advancedFDSState, setAdvancedFDSState] = useState(null);
	const [query, setQuery] = useState(advancedFDSState?.search?.query ?? '');

	const globalState = (window as any).Liferay?.State.__unsafe__;

	const saludoPaquito: paquito = ({argname, argtype}) => {
		return `Hola ${argname}, veo que tu tipo es ${argtype}`;
	};

	console.log(saludoPaquito({argname: 'Antonio', argtype: 'string'}));

	console.log(useLiferayState());

	function waitForGlobalVariable(key: string) {
		return new Promise<any>((resolve) => {
			const isAvailable = () => {
				if (globalState.getAtomOrSelectorKey(fdsAtomKey)) {
					resolve(true);
				} else {
					setTimeout(isAvailable, 100);
				}
			};
			isAvailable();
		});
	}

	useEffect(() => {
		waitForGlobalVariable(fdsAtomKey).then(() => {
			setAdvancedFDSState(globalState.readKey(fdsAtomKey));
			
			globalState.subscribeKey(fdsAtomKey, (newValue: any) => {
				setAdvancedFDSState(newValue);
			});
		});

	}, [waitForGlobalVariable, globalState, fdsAtomKey]);

	useEffect(() => {
		setQuery(advancedFDSState?.search?.query);
	}, [advancedFDSState]);

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
							globalState.writeKey(fdsAtomKey, {
								...advancedFDSState as any,
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