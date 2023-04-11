import React from "react";
import { useTranslation } from "react-i18next";

import { Backdrop } from "@USupport-components-library/src";

import "./create-response.scss";

/**
 * CreateResponse
 *
 * The CreateResponse backdrop
 *
 * @return {jsx}
 */
export const CreateResponse = ({ isOpen, onClose }) => {
  const { t } = useTranslation("create-response");

  return (
    <Backdrop
      classes="create-response"
      title="CreateResponse"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
    >
      <div className="create-response__date-container"></div>
    </Backdrop>
  );
};
