import React, { useEffect } from "react";
import jwtDecode from "jwt-decode";
import { Navigate, useLocation } from "react-router-dom";
import { useIsLoggedIn, useCheckHasUnreadNotifications } from "#hooks";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  let decoded = null;
  try {
    decoded = token ? jwtDecode(token) : null;
  } catch (error) {
    console.log(error);
  }
  const isProvider = decoded?.userType === "provider";
  const isLoggedIn = useIsLoggedIn();

  const unreadNotificationsQuery = useCheckHasUnreadNotifications(!!token);

  const location = useLocation();

  useEffect(() => {
    unreadNotificationsQuery.refetch();
  }, [location]);

  if (!isLoggedIn || !isProvider)
    return (
      <Navigate to={`/provider/${localStorage.getItem("language")}`} replace />
    );

  return children;
};
