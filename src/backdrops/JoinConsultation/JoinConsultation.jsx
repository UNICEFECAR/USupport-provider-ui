import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import { Backdrop, ButtonSelector } from "@USupport-components-library/src";
import { messageSvc, userSvc } from "@USupport-components-library/services";

import "./join-consultation.scss";

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

  const handleClick = async (redirectTo) => {
    const sytemMessage = {
      type: "system",
      content: t("provider_joined"),
      time: JSON.stringify(new Date().getTime()),
    };

    const systemMessagePromise = messageSvc.sendMessage({
      message: sytemMessage,
      chatId: consultation.chatId,
    });

    const getConsultationTokenPromise = userSvc.getTwilioToken(
      consultation.consultationId
    );

    try {
      const result = await Promise.all([
        systemMessagePromise,
        getConsultationTokenPromise,
      ]);
      const token = result[1].data.token;

      navigate("/consultation", {
        state: {
          consultation,
          videoOn: redirectTo === "video",
          microphoneOn: redirectTo === "video",
          token,
        },
      });
    } catch {
      toast(t("error"), { type: "error" });
    }

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
