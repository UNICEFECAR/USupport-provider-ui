import React from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Page, ResetPassword as ResetPasswordBlock } from "#blocks";
import { Loading } from "@USupport-components-library/src";

import { useIsLoggedIn, useCustomNavigate as useNavigate } from "#hooks";

import "./reset-password.scss";

/**
 * ResetPassword
 *
 * Reset password screen
 *
 * @returns {JSX.Element}
 */
export const ResetPassword = () => {
  const { t } = useTranslation("pages", { keyPrefix: "reset-password-page" });
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/forgot-password");
  };

  const isLoggedIn = useIsLoggedIn();

  if (isLoggedIn === "loading") return <Loading />;
  if (isLoggedIn === true)
    return (
      <Navigate
        to={`/provider/${localStorage.getItem("language")}/dashboard`}
      />
    );

  return (
    <Page
      handleGoBack={handleGoBack}
      heading={t("heading")}
      classes="page__reset-password"
    >
      <ResetPasswordBlock />
    </Page>
  );
};
