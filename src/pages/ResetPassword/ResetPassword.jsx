import React from "react";
import { Navigate } from "react-router-dom";
import { Page, ResetPassword as ResetPasswordBlock } from "#blocks";
import { Loading, RadialCircle } from "@USupport-components-library/src";

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
      classes="page__reset-password"
      additionalPadding={false}
      showEmergencyButton={false}
    >
      <RadialCircle color="purple" />
      <RadialCircle color="blue" />
      <ResetPasswordBlock />
    </Page>
  );
};
