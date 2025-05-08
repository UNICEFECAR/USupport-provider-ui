import React from "react";
import { Page } from "#blocks";
import { NotFound as NotFoundBlock } from "@USupport-components-library/src";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/**
 * NotFound
 *
 * NotFound page.
 *
 * @returns {JSX.Element}
 */
export const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("not-found-page");
  return (
    <Page showGoBackArrow={false}>
      <NotFoundBlock
        headingText={t("heading")}
        subheadingText={t("subheading")}
        buttonText={t("button")}
        handleClick={() => navigate(`/provider`)}
      />
    </Page>
  );
};
