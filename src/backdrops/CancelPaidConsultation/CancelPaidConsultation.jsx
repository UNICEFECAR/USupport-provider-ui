import React from "react";
import { useTranslation } from "react-i18next";
import { Backdrop } from "@USupport-components-library/src";

import "./cancel-paid-consultation.scss";

/**
 * CancelPaidConsultation
 *
 * The CancelPaidConsultation backdrop
 *
 * @return {jsx}
 */
export const CancelPaidConsultation = ({ isOpen, onClose }) => {
  const { t } = useTranslation("cancel-paid-consultation");

  const handleCancelConsultation = () => {
    console.log("Cancel paid consultation");
    onClose();
  };

  return (
    <Backdrop
      classes="cancel-paid-consultation"
      title="CancelPaidConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("go_back_label")}
      ctaHandleClick={onClose}
      secondaryCtaLabel={t("cancel_consultation_label")}
      secondaryCtaType="secondary"
      secondaryCtaHandleClick={handleCancelConsultation}
    ></Backdrop>
  );
};
