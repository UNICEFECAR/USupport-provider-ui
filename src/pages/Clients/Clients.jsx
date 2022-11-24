import React from "react";
import { Page, Clients as ClientsBlock } from "#blocks";

import "./clients.scss";

/**
 * Clients
 *
 * Clients page
 *
 * @returns {JSX.Element}
 */
export const Clients = () => {
  return (
    <Page classes="page__clients" showNavbar showFooter showGoBackArrow={false}>
      <ClientsBlock />
    </Page>
  );
};
