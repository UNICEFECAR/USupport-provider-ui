/* eslint-disable */
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Page, Login as LoginBlock } from "#blocks";
import { useIsLoggedIn, useError } from "#hooks";
import { useWindowDimensions } from "@USupport-components-library/utils";
import { RadialCircle, Loading } from "@USupport-components-library/src";
import { userSvc } from "@USupport-components-library/services";

import { CodeVerification } from "#backdrops";

import "./login.scss";

/**
 * Login
 *
 * Login page
 *
 * @returns {JSX.Element}
 */
export const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("login-page");
  const { width } = useWindowDimensions();
  const queryClient = useQueryClient();

  const [isCodeVerificationOpen, setIsCodeVerificationOpen] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState();

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [showTimer, setShowTimer] = useState(false);

  const [hasReceivedOtp, setHasReceivedOtp] = useState(false);
  const [lastUsedCredentials, setLastUsedCredentials] = useState({
    email: "",
    password: "",
  });

  const isLoggedIn = useIsLoggedIn();

  const [canRequestNewEmail, setCanRequestNewEmail] = useState(false);

  const [seconds, setSeconds] = useState(60);

  const disableLoginButtonFor60Sec = () => {
    setShowTimer(true);
    const interval = setInterval(() => {
      setSeconds((sec) => {
        if (sec - 1 === 0) {
          clearInterval(interval);
          setShowTimer(false);
          setSeconds(60);
          setCanRequestNewEmail(true);
        }
        return sec - 1;
      });
    }, 1000);
  };

  const requestOTP = async () => {
    setSeconds(60);
    return await userSvc.requestOTP({
      email: data.email.toLowerCase(),
      password: data.password.trim(),
    });
  };
  const requestOtpMutation = useMutation(requestOTP, {
    onSuccess: () => {
      setErrors({});

      setLoginCredentials({
        email: data.email.toLocaleLowerCase(),
        password: data.password.trim(),
      });
      setLastUsedCredentials({
        email: data.email.toLocaleLowerCase(),
        password: data.password.trim(),
      });

      setHasReceivedOtp(true);
      setIsCodeVerificationOpen(true);
      disableLoginButtonFor60Sec();
      setCanRequestNewEmail(false);
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
  });

  const login = async () => {
    const payload = {
      userType: "provider",
      otp: "1111",
      ...data,
    };
    return await userSvc.login(payload);
  };
  const loginMutation = useMutation(login, {
    onSuccess: (response) => {
      const { token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.invalidateQueries({ queryKey: ["provider-data"] });

      window.dispatchEvent(new Event("login"));
      setErrors({});
      navigate("/dashboard");
      const language = localStorage.getItem("language");
      userSvc.changeLanguage(language).catch((err) => {
        console.log(err, "Error when changing language");
      });
    },
    onError: (err) => {
      const { message: errorMessage } = useError(err);
      setErrors({ submit: errorMessage });
    },
  });

  if (isLoggedIn === "loading") return <Loading />;
  if (isLoggedIn === true) return <Navigate to="/dashboard" />;

  const openCodeVerification = () => setIsCodeVerificationOpen(true);

  const handleGoBack = () => navigate("/");

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation.mutate();
    return;
    if (hasReceivedOtp) {
      if (
        lastUsedCredentials.email === data.email.toLocaleLowerCase() &&
        lastUsedCredentials.password === data.password.trim()
      ) {
        openCodeVerification();
      }
    } else {
      setHasReceivedOtp(false);
      requestOtpMutation.mutate();
    }
  };

  return (
    <Page
      classes="page__login"
      additionalPadding={false}
      heading={width >= 768 ? t("heading_1") : t("heading_2")}
      handleGoBack={handleGoBack}
    >
      <LoginBlock
        setLoginCredentials={(data) => setLoginCredentials(data)}
        data={data}
        setData={setData}
        handleLogin={handleLogin}
        errors={errors}
        showTimer={showTimer}
        isLoading={requestOtpMutation.isLoading}
      />
      {width < 768 && <RadialCircle color="purple" />}
      {isCodeVerificationOpen && (
        <CodeVerification
          isOpen={isCodeVerificationOpen}
          onClose={() => setIsCodeVerificationOpen(false)}
          data={loginCredentials}
          requestOTP={requestOtpMutation.mutate}
          canRequestNewEmail={canRequestNewEmail}
          resendTimer={seconds}
          showTimer={showTimer}
          isMutating={requestOtpMutation.isLoading}
        />
      )}
    </Page>
  );
};
