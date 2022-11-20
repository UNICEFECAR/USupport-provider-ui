import React from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Page, ResetPassword as ResetPasswordBlock } from "#blocks";
import { Loading } from "@USupport-components-library/src";

import { useIsLoggedIn } from "@USupport-components-library/hooks";

import "./reset-password.scss";

/**
 * ResetPassword
 *
 * Reset password screen
 *
 * @returns {JSX.Element}
 */
export const ResetPassword = () => {
  const { t } = useTranslation("reset-password-page");
  const isLoggedIn = useIsLoggedIn();

  if (isLoggedIn === "loading") return <Loading />;
  if (isLoggedIn === true) return <Navigate to="/dashboard" />;
  return (
    <Page heading={t("heading")} classes="page__reset-password">
      <ResetPasswordBlock />
    </Page>
  );
};
