import React from "react";
import jwtDecode from "jwt-decode";
import { Navigate } from "react-router-dom";
import { useIsLoggedIn } from "@USupport-components-library/hooks";
import { Loading } from "@USupport-components-library/src";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const isProvider = decoded?.userType === "provider";
  const isLoggedIn = useIsLoggedIn();

  //   if (isLoggedIn === "loading") return <Loading size="lg" />;
  if (!isLoggedIn && !isProvider) return <Navigate to="/" />;

  return children;
};
