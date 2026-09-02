import React from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Loading } from "@USupport-components-library/src";

import { useIsLoggedIn } from "#hooks";

/**
 * ForgotPassword
 *
 * Redirects to login and opens the forgot password modal.
 *
 * @returns {JSX.Element}
 */
export const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const isLoggedIn = useIsLoggedIn();
  const language = localStorage.getItem("language") || "en";

  if (isLoggedIn === "loading") return <Loading />;
  if (isLoggedIn === true)
    return (
      <Navigate
        to={`/provider/${language}/dashboard`}
      />
    );

  const params = new URLSearchParams(searchParams);
  params.set("auth", "forgot-password");

  return (
    <Navigate
      to={`/provider/${language}/login?${params.toString()}`}
      replace
    />
  );
};
