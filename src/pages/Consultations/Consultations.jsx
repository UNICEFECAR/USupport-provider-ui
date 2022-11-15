import React from "react";
import { Page, Consultations as ConsultationsBlock } from "#blocks";

import "./consultations.scss";

/**
 * Consultations
 *
 * consultations
 *
 * @returns {JSX.Element}
 */
export const Consultations = () => {
  return (
    <Page classes="page__consultations" showNavbar={true} showFooter={true}>
      <ConsultationsBlock />
    </Page>
  );
};
