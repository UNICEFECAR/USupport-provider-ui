import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";

import { Page, Consultations as ConsultationsBlock } from "#blocks";
import { CancelConsultation, JoinConsultation } from "#backdrops";
import { InputSearch } from "@USupport-components-library/src";

import "./consultations.scss";

/**
 * Consultations
 *
 * consultations
 *
 * @returns {JSX.Element}
 */
export const Consultations = () => {
  const { t } = useTranslation("pages", { keyPrefix: "consultations-page" });
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState("");

  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const openCancelConsultation = (consultation) => {
    setIsCancelConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);

  const [isJoinConsultationOpen, setIsJoinConsultationOpen] = useState(false);
  const openJoinConsultation = (consultation) => {
    setIsJoinConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeJoinConsultation = () => setIsJoinConsultationOpen(false);

  const [selectedConsultation, setSelectedConsultation] = useState();

  return (
    <Page
      classes="page__consultations"
      showNavbar={true}
      showFooter={true}
      showGoBackArrow={false}
      handleGoBack={() => navigate(-1)}
      heading={t("heading")}
      headingButton={
        <InputSearch
          value={searchValue}
          onChange={(value) => setSearchValue(value.toLowerCase())}
          placeholder={t("input_search_label")}
          classes="consultations__heading-container__search"
        />
      }
    >
      <ConsultationsBlock
        openJoinConsultation={openJoinConsultation}
        openCancelConsultation={openCancelConsultation}
        searchValue={searchValue}
      />
      {selectedConsultation && (
        <CancelConsultation
          isOpen={isCancelConsultationOpen}
          onClose={closeCancelConsultation}
          consultation={selectedConsultation}
        />
      )}
      <JoinConsultation
        isOpen={isJoinConsultationOpen}
        onClose={closeJoinConsultation}
        consultation={selectedConsultation}
      />
    </Page>
  );
};
