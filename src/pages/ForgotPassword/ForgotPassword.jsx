import React from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useWindowDimensions } from "@USupport-components-library/utils";
import { RadialCircle, Loading } from "@USupport-components-library/src";

import { Page, ForgotPassword as ForgotPasswordBlock } from "#blocks";
import { useIsLoggedIn, useCustomNavigate as useNavigate } from "#hooks";

import "./forgot-password.scss";

/**
 * ForgotPassword
 *
 * ForgotPassword page
 *
 * @returns {JSX.Element}
 */
export const ForgotPassword = () => {
  const { t } = useTranslation("forgot-password-page");
  const { width } = useWindowDimensions();
  const navigate = useNavigate();

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
      classes="page__forgot-password"
      additionalPadding={false}
      heading={t("heading")}
      handleGoBack={() => navigate(-1)}
    >
      <ForgotPasswordBlock />
      {width < 768 && <RadialCircle color="purple" />}
    </Page>
  );
};
