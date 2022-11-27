import React, { useState } from "react";
import { Page, Clients as ClientsBlock } from "#blocks";
import { CancelConsultation } from "#backdrops";

import "./clients.scss";

/**
 * Clients
 *
 * Clients page
 *
 * @returns {JSX.Element}
 */
export const Clients = () => {
  const [isCancelConsultationOpen, setIsCancelConsultationOpen] =
    useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState();

  const openCancelConsultation = (consultation) => {
    setIsCancelConsultationOpen(true);
    setSelectedConsultation(consultation);
  };
  const closeCancelConsultation = () => setIsCancelConsultationOpen(false);
  return (
    <Page classes="page__clients" showNavbar showFooter showGoBackArrow={false}>
      <ClientsBlock openCancelConsultation={openCancelConsultation} />
      {selectedConsultation && (
        <CancelConsultation
          isOpen={isCancelConsultationOpen}
          onClose={closeCancelConsultation}
          consultation={selectedConsultation}
        />
      )}
    </Page>
  );
};
