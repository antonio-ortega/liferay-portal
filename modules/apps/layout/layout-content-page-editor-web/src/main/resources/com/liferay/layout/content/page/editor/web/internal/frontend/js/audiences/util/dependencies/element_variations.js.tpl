import {audiences} from '../../frontend-js-audiences-web/__liferay__/index.js';

const languageId = themeDisplay.getLanguageId();

function getLocalizedValue(values, defaultLanguageId) {
	if (!values) {
		return null;
	}

	if (values[languageId] != null) {
		return values[languageId];
	}

	return values[defaultLanguageId];
}

function applyElementVariation(elementVariation) {
	let element = null;

	if (elementVariation.targetElement) {
		element = document.querySelector(elementVariation.targetElement);

		if (!element) {
			return;
		}

		if (
			getLocalizedValue(
				elementVariation.hide,
				elementVariation.defaultLanguageId
			) === 'true'
		) {
			element.style.display = 'none';
		}

		const html = getLocalizedValue(
			elementVariation.html,
			elementVariation.defaultLanguageId
		);

		if (html != null) {
			element.innerHTML = html;
		}
	}

	const js = getLocalizedValue(
		elementVariation.js,
		elementVariation.defaultLanguageId
	);

	if (js) {
		js(element);
	}
}

const elementVariations = [$ELEMENT_VARIATIONS$];

elementVariations.forEach((elementVariation) => {
	elementVariation.audienceEntryERCs.forEach((audienceEntryERC) => {
		audiences.on(audienceEntryERC, () => applyElementVariation(elementVariation));
	});
});
