import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import PinInput from "react-pin-input";
import {
  Backdrop,
  ButtonWithIcon,
  Button,
} from "@USupport-components-library/src";

import "./code-verification.scss";
import { useCountdownTimer } from "@USupport-components-library/hooks";

/**
 * CodeVerification
 *
 * The CodeVerification backdrop
 *
 * @return {jsx}
 */
export const CodeVerification = ({ isOpen, onClose }) => {
  const { t } = useTranslation("code-verification");

  const [isCodeHidden, setIsCodeHidden] = useState(true);
  const [canRequestNewEmail, setCanRequestNewEmail] = useState(false);

  const timeToRequestNewEmail = useCountdownTimer(3);

  useEffect(() => {
    if (timeToRequestNewEmail[2] === 0 && timeToRequestNewEmail[3] === 0) {
      setCanRequestNewEmail(true);
    }
  }, [timeToRequestNewEmail]);

  const time = useCountdownTimer();
  const [code, setCode] = useState("");

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleSend = () => {
    console.log("send", code);
    onClose();
  };

  const handleResendEmail = () => {
    console.log("must be implemented");
  };

  return (
    <Backdrop
      classes="code-verification"
      title="CodeVerification"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
    >
      <div className="code-verification__content">
        <PinInput
          length={4}
          secret={isCodeHidden}
          onChange={(value) => handleCodeChange(value)}
        />
        <p className="small-text code-verification__expire-time-text">
          {t("expiration_text")} {time[2]}:
          {time[3] > 9 ? time[3] : "0" + time[3]}
        </p>
        <ButtonWithIcon
          classes="code-verification__view-code-button"
          type="ghost"
          color="purple"
          iconName={isCodeHidden ? "view" : "hide"}
          iconColor="#9749FA"
          label={
            isCodeHidden
              ? t("button_with_icon_label_view")
              : t("button_with_icon_label_hide")
          }
          onClick={() => setIsCodeHidden(!isCodeHidden)}
        />
        <Button
          label={t("send_button_label")}
          size="lg"
          classes="code-verification__send-button"
          disabled={code.length === 4 ? false : true}
          onClick={handleSend}
        />
        <div className="code-verification__resend-code-container">
          <p className="small-text">{t("didnt_get_code")}</p>
          <Button
            disabled={!canRequestNewEmail}
            label={t("resend_code_button_label")}
            type="link"
            classes="code-verification__resend-code-container__button"
            onClick={handleResendEmail}
          />
        </div>
      </div>
    </Backdrop>
  );
};
