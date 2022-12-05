import React from "react";
import { Backdrop, ButtonSelector } from "@USupport-components-library/src";

import "./join-consultation.scss";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import { useTranslation } from "react-i18next";

/**
 * JoinConsultation
 *
 * The JoinConsultation backdrop
 *
 * @return {jsx}
 */
export const JoinConsultation = ({ isOpen, onClose, consultation }) => {
  const { t } = useTranslation("join-consultation");
  const navigate = useNavigate();

  const handleClick = (redirectTo) => {
    navigate("/consultation", {
      state: { consultation, videoOn: redirectTo === "video" },
    });

    onClose();
  };

  return (
    <Backdrop
      classes="join-consultation"
      title="JoinConsultation"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("modal_paragraph")}
    >
      <ButtonSelector
        label={t("button_label_1")}
        iconName="video"
        classes="join-consultation__button-selector"
        onClick={() => handleClick("video")}
      />
      <ButtonSelector
        label={t("button_label_2")}
        iconName="comment"
        classes="join-consultation__button-selector"
        onClick={() => handleClick("chat")}
      />
    </Backdrop>
  );
};
