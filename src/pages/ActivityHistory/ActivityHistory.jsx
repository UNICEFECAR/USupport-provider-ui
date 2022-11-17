import React from "react";
import { Page, ActivityHistory as ActivityHistoryBlock } from "#blocks";

import "./activity-history.scss";

/**
 * ActivityHistory
 *
 * ActivityHistory page
 *
 * @returns {JSX.Element}
 */
export const ActivityHistory = () => {
  return (
    <Page
      classes="page__activity-history"
      showNavbar
      showFooter
      showGoBackArrow={false}
    >
      <ActivityHistoryBlock />
    </Page>
  );
};
