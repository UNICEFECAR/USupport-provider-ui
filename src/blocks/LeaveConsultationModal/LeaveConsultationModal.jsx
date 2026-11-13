import React from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "@USupport-components-library/src";

import "./leave-consultation-modal.scss";

/**
 * LeaveConsultationModal
 *
 * Confirmation modal for leaving a consultation
 *
 * @param {boolean} isOpen
 * @param {function} onCancel - closes the modal and keeps the provider in the consultation
 * @param {function} onConfirm - leaves the consultation
 *
 * @return {jsx}
 */
export const LeaveConsultationModal = ({ isOpen, onCancel, onConfirm }) => {
  const { t } = useTranslation("blocks", {
    keyPrefix: "leave-consultation-modal",
  });

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onCancel}
      heading={t("heading")}
      ctaLabel={t("confirm")}
      ctaHandleClick={onConfirm}
      secondaryCtaLabel={t("cancel")}
      secondaryCtaHandleClick={onCancel}
      classes="leave-consultation-modal"
    />
  );
};
