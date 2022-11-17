import React from "react";
import { Page, Scheduler as SchedulerBlock } from "#blocks";

import "./scheduler.scss";

/**
 * Scheduler
 *
 * Scheduler page
 *
 * @returns {JSX.Element}
 */
export const Scheduler = () => {
  return (
    <Page showGoBackArrow={false} classes="page__scheduler">
      <SchedulerBlock />
    </Page>
  );
};
