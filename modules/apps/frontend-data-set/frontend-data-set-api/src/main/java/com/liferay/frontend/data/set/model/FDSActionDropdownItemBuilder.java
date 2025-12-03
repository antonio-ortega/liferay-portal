/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

package com.liferay.frontend.data.set.model;

import com.liferay.frontend.taglib.clay.servlet.taglib.util.DropdownItem;
import com.liferay.petra.function.UnsafeSupplier;

import jakarta.portlet.PortletURL;

import java.util.List;
import java.util.Map;

/**
 * @author Daniel Sanz
 */
public class FDSActionDropdownItemBuilder {

	public static AfterPutDataStep putData(String key, String value) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.putData(key, value);
	}

	public static AfterPutDataStep putData(
		String key, UnsafeSupplier<String, Exception> valueUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.putData(key, valueUnsafeSupplier);
	}

	public static AfterActiveStep setActive(boolean active) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setActive(active);
	}

	public static AfterActiveStep setActive(
		UnsafeSupplier<Boolean, Exception> activeUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setActive(activeUnsafeSupplier);
	}

	public static AfterConfirmationMessageStep setConfirmationMessage(
		String confirmationMessage) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setConfirmationMessage(
			confirmationMessage);
	}

	public static AfterConfirmationMessageStep setConfirmationMessage(
		UnsafeSupplier<String, Exception> confirmationMessageUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setConfirmationMessage(
			confirmationMessageUnsafeSupplier);
	}

	public static AfterConfirmationMessageTypeStep setConfirmationMessageType(
		String confirmationMessageType) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setConfirmationMessageType(
			confirmationMessageType);
	}

	public static AfterConfirmationMessageTypeStep setConfirmationMessageType(
		UnsafeSupplier<String, Exception>
			confirmationMessageTypeUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setConfirmationMessageType(
			confirmationMessageTypeUnsafeSupplier);
	}

	public static AfterSetDataStep setData(Map<String, Object> data) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setData(data);
	}

	public static AfterDisabledStep setDisabled(boolean disabled) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setDisabled(disabled);
	}

	public static AfterDisabledStep setDisabled(
		UnsafeSupplier<Boolean, Exception> disabledUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setDisabled(disabledUnsafeSupplier);
	}

	public static AfterDropdownItemsStep setDropdownItems(
		List<DropdownItem> dropdownItems) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setDropdownItems(dropdownItems);
	}

	public static AfterErrorMessageStep setErrorMessage(String errorMessage) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setErrorMessage(errorMessage);
	}

	public static AfterErrorMessageStep setErrorMessage(
		UnsafeSupplier<String, Exception> errorMessageUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setErrorMessage(
			errorMessageUnsafeSupplier);
	}

	public static AfterFDSActionDropdownItemsStep setFDSActionDropdownItems(
		List<FDSActionDropdownItem> fdsActionDropdownItems) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setFDSActionDropdownItems(
			fdsActionDropdownItems);
	}

	public static AfterHighlightedStep setHighlighted(boolean highlighted) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setHighlighted(highlighted);
	}

	public static AfterHighlightedStep setHighlighted(
		UnsafeSupplier<Boolean, Exception> highlightedUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setHighlighted(
			highlightedUnsafeSupplier);
	}

	public static AfterHrefStep setHref(Object href) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setHref(href);
	}

	public static AfterHrefStep setHref(
		PortletURL portletURL, Object... parameters) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setHref(portletURL, parameters);
	}

	public static AfterHrefStep setHref(
		UnsafeSupplier<Object, Exception> hrefUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setHref(hrefUnsafeSupplier);
	}

	public static AfterIconStep setIcon(String icon) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setIcon(icon);
	}

	public static AfterIconStep setIcon(
		UnsafeSupplier<String, Exception> iconUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setIcon(iconUnsafeSupplier);
	}

	public static AfterIdStep setId(String id) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setId(id);
	}

	public static AfterIdStep setId(
		UnsafeSupplier<String, Exception> idUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setId(idUnsafeSupplier);
	}

	public static AfterLabelStep setLabel(String label) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setLabel(label);
	}

	public static AfterLabelStep setLabel(
		UnsafeSupplier<String, Exception> labelUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setLabel(labelUnsafeSupplier);
	}

	public static AfterMethodStep setMethod(String method) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setMethod(method);
	}

	public static AfterMethodStep setMethod(
		UnsafeSupplier<String, Exception> methodUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setMethod(methodUnsafeSupplier);
	}

	public static AfterModalSizeStep setModalSize(String modalSize) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setModalSize(modalSize);
	}

	public static AfterModalSizeStep setModalSize(
		UnsafeSupplier<String, Exception> modalSizeUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setModalSize(modalSizeUnsafeSupplier);
	}

	public static AfterQuickActionStep setQuickAction(boolean quickAction) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setQuickAction(quickAction);
	}

	public static AfterQuickActionStep setQuickAction(
		UnsafeSupplier<Boolean, Exception> quickActionUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setQuickAction(
			quickActionUnsafeSupplier);
	}

	public static AfterSeparatorStep setSeparator(boolean separator) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setSeparator(separator);
	}

	public static AfterSeparatorStep setSeparator(
		UnsafeSupplier<Boolean, Exception> separatorUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setSeparator(separatorUnsafeSupplier);
	}

	public static AfterTargetStep setTarget(String target) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setTarget(target);
	}

	public static AfterTargetStep setTarget(
		UnsafeSupplier<String, Exception> targetUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setTarget(targetUnsafeSupplier);
	}

	public static AfterTypeStep setType(String type) {
		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setType(type);
	}

	public static AfterTypeStep setType(
		UnsafeSupplier<String, Exception> typeUnsafeSupplier) {

		FDSActionDropdownItemStep fdsActionDropdownItemStep =
			new FDSActionDropdownItemStep();

		return fdsActionDropdownItemStep.setType(typeUnsafeSupplier);
	}

	public static class FDSActionDropdownItemStep
		implements ActiveStep, AfterActiveStep, AfterConfirmationMessageStep,
				   AfterConfirmationMessageTypeStep, AfterDisabledStep,
				   AfterDropdownItemsStep, AfterErrorMessageStep,
				   AfterFDSActionDropdownItemsStep, AfterHighlightedStep,
				   AfterHrefStep, AfterIconStep, AfterIdStep, AfterKeyStep,
				   AfterLabelStep, AfterMethodStep, AfterModalSizeStep,
				   AfterPutDataStep, AfterQuickActionStep, AfterSeparatorStep,
				   AfterSetDataStep, AfterTargetStep, AfterTypeStep, BuildStep,
				   ConfirmationMessageStep, ConfirmationMessageTypeStep,
				   DisabledStep, DropdownItemsStep, ErrorMessageStep,
				   HighlightedStep, HrefStep, IconStep, IdStep, LabelStep,
				   MethodStep, ModalSizeStep, PutDataStep, QuickActionStep,
				   SeparatorStep, SetDataStep, TargetStep, TypeStep {

		@Override
		public FDSActionDropdownItem build() {
			return _fdsActionDropdownItem;
		}

		@Override
		public AfterPutDataStep putData(String key, String value) {
			_fdsActionDropdownItem.putData(key, value);

			return this;
		}

		@Override
		public AfterPutDataStep putData(
			String key, UnsafeSupplier<String, Exception> valueUnsafeSupplier) {

			try {
				String value = valueUnsafeSupplier.get();

				if (value != null) {
					_fdsActionDropdownItem.putData(key, value);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterActiveStep setActive(boolean active) {
			_fdsActionDropdownItem.setActive(active);

			return this;
		}

		@Override
		public AfterActiveStep setActive(
			UnsafeSupplier<Boolean, Exception> activeUnsafeSupplier) {

			try {
				Boolean active = activeUnsafeSupplier.get();

				if (active != null) {
					_fdsActionDropdownItem.setActive(active.booleanValue());
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterConfirmationMessageStep setConfirmationMessage(
			String confirmationMessage) {

			_fdsActionDropdownItem.setConfirmationMessage(confirmationMessage);

			return this;
		}

		@Override
		public AfterConfirmationMessageStep setConfirmationMessage(
			UnsafeSupplier<String, Exception>
				confirmationMessageUnsafeSupplier) {

			try {
				String confirmationMessage =
					confirmationMessageUnsafeSupplier.get();

				if (confirmationMessage != null) {
					_fdsActionDropdownItem.setConfirmationMessage(
						confirmationMessage);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterConfirmationMessageTypeStep setConfirmationMessageType(
			String confirmationMessageType) {

			_fdsActionDropdownItem.setConfirmationMessageType(
				confirmationMessageType);

			return this;
		}

		@Override
		public AfterConfirmationMessageTypeStep setConfirmationMessageType(
			UnsafeSupplier<String, Exception>
				confirmationMessageTypeUnsafeSupplier) {

			try {
				String confirmationMessageType =
					confirmationMessageTypeUnsafeSupplier.get();

				if (confirmationMessageType != null) {
					_fdsActionDropdownItem.setConfirmationMessageType(
						confirmationMessageType);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterSetDataStep setData(Map<String, Object> data) {
			_fdsActionDropdownItem.setData(data);

			return this;
		}

		@Override
		public AfterDisabledStep setDisabled(boolean disabled) {
			_fdsActionDropdownItem.setDisabled(disabled);

			return this;
		}

		@Override
		public AfterDisabledStep setDisabled(
			UnsafeSupplier<Boolean, Exception> disabledUnsafeSupplier) {

			try {
				Boolean disabled = disabledUnsafeSupplier.get();

				if (disabled != null) {
					_fdsActionDropdownItem.setDisabled(disabled.booleanValue());
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterDropdownItemsStep setDropdownItems(
			List<DropdownItem> dropdownItems) {

			_fdsActionDropdownItem.setDropdownItems(dropdownItems);

			return this;
		}

		@Override
		public AfterErrorMessageStep setErrorMessage(String errorMessage) {
			_fdsActionDropdownItem.setErrorMessage(errorMessage);

			return this;
		}

		@Override
		public AfterErrorMessageStep setErrorMessage(
			UnsafeSupplier<String, Exception> errorMessageUnsafeSupplier) {

			try {
				String errorMessage = errorMessageUnsafeSupplier.get();

				if (errorMessage != null) {
					_fdsActionDropdownItem.setErrorMessage(errorMessage);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterFDSActionDropdownItemsStep setFDSActionDropdownItems(
			List<FDSActionDropdownItem> fdsActionDropdownItems) {

			_fdsActionDropdownItem.setFDSActionDropdownItems(
				fdsActionDropdownItems);

			return this;
		}

		@Override
		public AfterHighlightedStep setHighlighted(boolean highlighted) {
			_fdsActionDropdownItem.setHighlighted(highlighted);

			return this;
		}

		@Override
		public AfterHighlightedStep setHighlighted(
			UnsafeSupplier<Boolean, Exception> highlightedUnsafeSupplier) {

			try {
				Boolean highlighted = highlightedUnsafeSupplier.get();

				if (highlighted != null) {
					_fdsActionDropdownItem.setHighlighted(
						highlighted.booleanValue());
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterHrefStep setHref(Object href) {
			_fdsActionDropdownItem.setHref(href);

			return this;
		}

		@Override
		public AfterHrefStep setHref(
			PortletURL portletURL, Object... parameters) {

			_fdsActionDropdownItem.setHref(portletURL, parameters);

			return this;
		}

		@Override
		public AfterHrefStep setHref(
			UnsafeSupplier<Object, Exception> hrefUnsafeSupplier) {

			try {
				Object href = hrefUnsafeSupplier.get();

				if (href != null) {
					_fdsActionDropdownItem.setHref(href);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterIconStep setIcon(String icon) {
			_fdsActionDropdownItem.setIcon(icon);

			return this;
		}

		@Override
		public AfterIconStep setIcon(
			UnsafeSupplier<String, Exception> iconUnsafeSupplier) {

			try {
				String icon = iconUnsafeSupplier.get();

				if (icon != null) {
					_fdsActionDropdownItem.setIcon(icon);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		public AfterIdStep setId(String id) {
			_fdsActionDropdownItem.setId(id);

			return this;
		}

		public AfterIdStep setId(
			UnsafeSupplier<String, Exception> idUnsafeSupplier) {

			try {
				String id = idUnsafeSupplier.get();

				if (id != null) {
					_fdsActionDropdownItem.setId(id);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterKeyStep setKey(String key) {
			_fdsActionDropdownItem.setKey(key);

			return this;
		}

		@Override
		public AfterKeyStep setKey(
			UnsafeSupplier<String, Exception> keyUnsafeSupplier) {

			try {
				String key = keyUnsafeSupplier.get();

				if (key != null) {
					_fdsActionDropdownItem.setKey(key);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterLabelStep setLabel(String label) {
			_fdsActionDropdownItem.setLabel(label);

			return this;
		}

		@Override
		public AfterLabelStep setLabel(
			UnsafeSupplier<String, Exception> labelUnsafeSupplier) {

			try {
				String label = labelUnsafeSupplier.get();

				if (label != null) {
					_fdsActionDropdownItem.setLabel(label);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		public AfterMethodStep setMethod(String method) {
			_fdsActionDropdownItem.setMethod(method);

			return this;
		}

		public AfterMethodStep setMethod(
			UnsafeSupplier<String, Exception> methodUnsafeSupplier) {

			try {
				String method = methodUnsafeSupplier.get();

				if (method != null) {
					_fdsActionDropdownItem.setMethod(method);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterModalSizeStep setModalSize(String modalSize) {
			_fdsActionDropdownItem.setModalSize(modalSize);

			return this;
		}

		@Override
		public AfterModalSizeStep setModalSize(
			UnsafeSupplier<String, Exception> modalSizeUnsafeSupplier) {

			try {
				String modalSize = modalSizeUnsafeSupplier.get();

				if (modalSize != null) {
					_fdsActionDropdownItem.setModalSize(modalSize);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterQuickActionStep setQuickAction(boolean quickAction) {
			_fdsActionDropdownItem.setQuickAction(quickAction);

			return this;
		}

		@Override
		public AfterQuickActionStep setQuickAction(
			UnsafeSupplier<Boolean, Exception> quickActionUnsafeSupplier) {

			try {
				Boolean quickAction = quickActionUnsafeSupplier.get();

				if (quickAction != null) {
					_fdsActionDropdownItem.setQuickAction(
						quickAction.booleanValue());
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterSeparatorStep setSeparator(boolean separator) {
			_fdsActionDropdownItem.setSeparator(separator);

			return this;
		}

		@Override
		public AfterSeparatorStep setSeparator(
			UnsafeSupplier<Boolean, Exception> separatorUnsafeSupplier) {

			try {
				Boolean separator = separatorUnsafeSupplier.get();

				if (separator != null) {
					_fdsActionDropdownItem.setSeparator(
						separator.booleanValue());
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterTargetStep setTarget(String target) {
			_fdsActionDropdownItem.setTarget(target);

			return this;
		}

		@Override
		public AfterTargetStep setTarget(
			UnsafeSupplier<String, Exception> targetUnsafeSupplier) {

			try {
				String target = targetUnsafeSupplier.get();

				if (target != null) {
					_fdsActionDropdownItem.setTarget(target);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		@Override
		public AfterTypeStep setType(String type) {
			_fdsActionDropdownItem.setType(type);

			return this;
		}

		@Override
		public AfterTypeStep setType(
			UnsafeSupplier<String, Exception> typeUnsafeSupplier) {

			try {
				String type = typeUnsafeSupplier.get();

				if (type != null) {
					_fdsActionDropdownItem.setType(type);
				}

				return this;
			}
			catch (Exception exception) {
				throw new RuntimeException(exception);
			}
		}

		private final FDSActionDropdownItem _fdsActionDropdownItem =
			new FDSActionDropdownItem();

	}

	public interface ActiveStep {

		public AfterActiveStep setActive(boolean active);

		public AfterActiveStep setActive(
			UnsafeSupplier<Boolean, Exception> activeUnsafeSupplier);

	}

	public interface After extends BuildStep {
	}

	public interface AfterActiveStep
		extends BuildStep, ConfirmationMessageStep, ConfirmationMessageTypeStep,
				DisabledStep, DropdownItemsStep, ErrorMessageStep,
				FDSActionDropdownItemsStep, HighlightedStep, HrefStep, IconStep,
				IdStep, LabelStep, MethodStep, ModalSizeStep, QuickActionStep,
				SeparatorStep, SetDataStep, TargetStep, TypeStep {
	}

	public interface AfterConfirmationMessageStep
		extends BuildStep, ConfirmationMessageTypeStep, DisabledStep,
				DropdownItemsStep, ErrorMessageStep, FDSActionDropdownItemsStep,
				HighlightedStep, HrefStep, IconStep, IdStep, LabelStep,
				MethodStep, ModalSizeStep, QuickActionStep, SeparatorStep,
				SetDataStep, TargetStep, TypeStep {
	}

	public interface AfterConfirmationMessageTypeStep
		extends BuildStep, DisabledStep, DropdownItemsStep, ErrorMessageStep,
				FDSActionDropdownItemsStep, HighlightedStep, HrefStep, IconStep,
				IdStep, LabelStep, MethodStep, ModalSizeStep, QuickActionStep,
				SeparatorStep, SetDataStep, TargetStep, TypeStep {
	}

	public interface AfterDisabledStep
		extends BuildStep, DropdownItemsStep, ErrorMessageStep,
				FDSActionDropdownItemsStep, HighlightedStep, HrefStep, IconStep,
				IdStep, LabelStep, MethodStep, ModalSizeStep, QuickActionStep,
				SeparatorStep, TargetStep, TypeStep {
	}

	public interface AfterDropdownItemsStep
		extends BuildStep, ErrorMessageStep, FDSActionDropdownItemsStep,
				HighlightedStep, IconStep, IdStep, KeyStep, LabelStep,
				MethodStep, ModalSizeStep, QuickActionStep, SeparatorStep,
				TargetStep, TypeStep {
	}

	public interface AfterErrorMessageStep
		extends BuildStep, FDSActionDropdownItemsStep, HighlightedStep,
				HrefStep, IconStep, IdStep, LabelStep, MethodStep,
				ModalSizeStep, QuickActionStep, SeparatorStep, TargetStep,
				TypeStep {
	}

	public interface AfterFDSActionDropdownItemsStep
		extends BuildStep, HighlightedStep, HrefStep, IconStep, IdStep,
				LabelStep, MethodStep, ModalSizeStep, QuickActionStep,
				SeparatorStep, TargetStep, TypeStep {
	}

	public interface AfterHighlightedStep
		extends BuildStep, IconStep, IdStep, LabelStep, MethodStep,
				ModalSizeStep, QuickActionStep, SeparatorStep, TargetStep,
				TypeStep {
	}

	public interface AfterHrefStep
		extends BuildStep, DropdownItemsStep, HighlightedStep, IconStep, IdStep,
				KeyStep, LabelStep, MethodStep, ModalSizeStep, QuickActionStep,
				SeparatorStep, TargetStep, TypeStep {
	}

	public interface AfterIconStep
		extends BuildStep, DropdownItemsStep, IdStep, KeyStep, LabelStep,
				MethodStep, ModalSizeStep, QuickActionStep, SeparatorStep,
				TargetStep, TypeStep {
	}

	public interface AfterIdStep
		extends BuildStep, DropdownItemsStep, KeyStep, LabelStep, MethodStep,
				ModalSizeStep, QuickActionStep, SeparatorStep, TargetStep,
				TypeStep {
	}

	public interface AfterKeyStep
		extends BuildStep, LabelStep, MethodStep, ModalSizeStep,
				QuickActionStep, SeparatorStep, TargetStep, TypeStep {
	}

	public interface AfterLabelStep
		extends BuildStep, MethodStep, ModalSizeStep, QuickActionStep,
				SeparatorStep, TargetStep, TypeStep {
	}

	public interface AfterMethodStep
		extends BuildStep, ModalSizeStep, QuickActionStep, SeparatorStep,
				TargetStep, TypeStep {
	}

	public interface AfterModalSizeStep
		extends BuildStep, QuickActionStep, SeparatorStep, TargetStep,
				TypeStep {
	}

	public interface AfterPutDataStep
		extends ActiveStep, BuildStep, DisabledStep, DropdownItemsStep,
				HrefStep, IconStep, KeyStep, LabelStep, PutDataStep,
				QuickActionStep, SeparatorStep, SetDataStep, TargetStep,
				TypeStep {
	}

	public interface AfterQuickActionStep
		extends BuildStep, SeparatorStep, TargetStep, TypeStep {
	}

	public interface AfterSeparatorStep
		extends BuildStep, TargetStep, TypeStep {
	}

	public interface AfterSetDataStep
		extends BuildStep, DisabledStep, DropdownItemsStep, HrefStep, IconStep,
				LabelStep, QuickActionStep, SeparatorStep, TargetStep,
				TypeStep {
	}

	public interface AfterTargetStep extends BuildStep, TypeStep {
	}

	public interface AfterTypeStep extends BuildStep {
	}

	public interface BuildStep {

		public FDSActionDropdownItem build();

	}

	public interface ConfirmationMessageStep {

		public AfterConfirmationMessageStep setConfirmationMessage(
			String confirmationMessage);

		public AfterConfirmationMessageStep setConfirmationMessage(
			UnsafeSupplier<String, Exception>
				confirmationMessageUnsafeSupplier);

	}

	public interface ConfirmationMessageTypeStep {

		public AfterConfirmationMessageTypeStep setConfirmationMessageType(
			String confirmationMessageType);

		public AfterConfirmationMessageTypeStep setConfirmationMessageType(
			UnsafeSupplier<String, Exception>
				confirmationMessageTypeUnsafeSupplier);

	}

	public interface DisabledStep {

		public AfterDisabledStep setDisabled(boolean disabled);

		public AfterDisabledStep setDisabled(
			UnsafeSupplier<Boolean, Exception> disabledUnsafeSupplier);

	}

	public interface DropdownItemsStep {

		public AfterDropdownItemsStep setDropdownItems(
			List<DropdownItem> dropdownItems);

	}

	public interface ErrorMessageStep {

		public AfterErrorMessageStep setErrorMessage(String errorMessage);

		public AfterErrorMessageStep setErrorMessage(
			UnsafeSupplier<String, Exception> errorMessageUnsafeSupplier);

	}

	public interface FDSActionDropdownItemsStep {

		public AfterFDSActionDropdownItemsStep setFDSActionDropdownItems(
			List<FDSActionDropdownItem> fdsActionDropdownItems);

	}

	public interface HighlightedStep {

		public AfterHighlightedStep setHighlighted(boolean highlighted);

		public AfterHighlightedStep setHighlighted(
			UnsafeSupplier<Boolean, Exception> highlightedUnsafeSupplier);

	}

	public interface HrefStep {

		public AfterHrefStep setHref(Object href);

		public AfterHrefStep setHref(
			PortletURL portletURL, Object... parameters);

		public AfterHrefStep setHref(
			UnsafeSupplier<Object, Exception> hrefUnsafeSupplier);

	}

	public interface IconStep {

		public AfterIconStep setIcon(String icon);

		public AfterIconStep setIcon(
			UnsafeSupplier<String, Exception> iconUnsafeSupplier);

	}

	public interface IdStep {

		public AfterIdStep setId(String id);

		public AfterIdStep setId(
			UnsafeSupplier<String, Exception> idUnsafeSupplier);

	}

	public interface KeyStep {

		public AfterKeyStep setKey(String key);

		public AfterKeyStep setKey(
			UnsafeSupplier<String, Exception> keyUnsafeSupplier);

	}

	public interface LabelStep {

		public AfterLabelStep setLabel(String label);

		public AfterLabelStep setLabel(
			UnsafeSupplier<String, Exception> labelUnsafeSupplier);

	}

	public interface MethodStep {

		public AfterMethodStep setMethod(String method);

		public AfterMethodStep setMethod(
			UnsafeSupplier<String, Exception> methodUnsafeSupplier);

	}

	public interface ModalSizeStep {

		public AfterModalSizeStep setModalSize(String modalSize);

		public AfterModalSizeStep setModalSize(
			UnsafeSupplier<String, Exception> modalSizeUnsafeSupplier);

	}

	public interface PutDataStep {

		public AfterPutDataStep putData(String key, String value);

		public AfterPutDataStep putData(
			String key, UnsafeSupplier<String, Exception> valueUnsafeSupplier);

	}

	public interface QuickActionStep {

		public AfterQuickActionStep setQuickAction(boolean quickAction);

		public AfterQuickActionStep setQuickAction(
			UnsafeSupplier<Boolean, Exception> quickActionUnsafeSupplier);

	}

	public interface SeparatorStep {

		public AfterSeparatorStep setSeparator(boolean separator);

		public AfterSeparatorStep setSeparator(
			UnsafeSupplier<Boolean, Exception> separatorUnsafeSupplier);

	}

	public interface SetDataStep {

		public AfterSetDataStep setData(Map<String, Object> data);

	}

	public interface TargetStep {

		public AfterTargetStep setTarget(String target);

		public AfterTargetStep setTarget(
			UnsafeSupplier<String, Exception> targetUnsafeSupplier);

	}

	public interface TypeStep {

		public AfterTypeStep setType(String type);

		public AfterTypeStep setType(
			UnsafeSupplier<String, Exception> typeUnsafeSupplier);

	}

}