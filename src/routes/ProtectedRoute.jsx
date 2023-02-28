import React, { useEffect } from "react";
import jwtDecode from "jwt-decode";
import { Navigate, useLocation } from "react-router-dom";
import { useIsLoggedIn, useCheckHasUnreadNotifications } from "#hooks";
import { Loading } from "@USupport-components-library/src";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const isProvider = decoded?.userType === "provider";
  const isLoggedIn = useIsLoggedIn();

  const unreadNotificationsQuery = useCheckHasUnreadNotifications(!!token);

  const location = useLocation();

  useEffect(() => {
    unreadNotificationsQuery.refetch();
  }, [location]);

  //   if (isLoggedIn === "loading") return <Loading size="lg" />;
  if (!isLoggedIn || !isProvider) return <Navigate to="/" />;

  return children;
};
