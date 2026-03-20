import ClayButton from '@clayui/button';
import {ClayInput} from '@clayui/form';
import ClayLayout from '@clayui/layout';
import React, {useEffect, useState} from 'react';

const ClassicSearch = ({fdsAtomKey}: {fdsAtomKey: string}) => {
	const [classicFDSState, setClassicFDSState] = useState(null);
	const [query, setQuery] = useState(classicFDSState?.search?.query ?? '');

	const globalState = (window as any).Liferay?.State.__unsafe__;

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
			setClassicFDSState(globalState.readKey(fdsAtomKey));
			
			globalState.subscribeKey(fdsAtomKey, (newValue: any) => {
				setClassicFDSState(newValue);
			});
		});

	}, [waitForGlobalVariable, globalState, fdsAtomKey]);

	useEffect(() => {
		setQuery(classicFDSState?.search?.query);
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
						data-qa-id="ClassicSearchFDSSampleButton"
						onClick={() => {
							globalState.writeKey(fdsAtomKey, {
								...classicFDSState as any,
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