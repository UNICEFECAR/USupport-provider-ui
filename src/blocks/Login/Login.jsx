import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";

import {
  Block,
  Error,
  Input,
  Grid,
  GridItem,
  InputPassword,
  Button,
} from "@USupport-components-library/src";
import { userSvc } from "@USupport-components-library/services";

import { useError } from "#hooks";
import { getCountryFromTimezone } from "@USupport-components-library/utils";

import "./login.scss";

/**
 * Login
 *
 * Login block
 *
 * @return {jsx}
 */
export const Login = ({ openCodeVerification, setLoginCredentials }) => {
  const { t } = useTranslation("login");
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showTimer, setShowTimer] = useState(false);
  const [seconds, setSeconds] = useState(60);

  const disableLoginButtonFor60Sec = () => {
    setShowTimer(true);
    const interval = setInterval(() => {
      setSeconds((sec) => {
        if (sec - 1 === 0) {
          clearInterval(interval);
          setIsSubmitting(false);
          setShowTimer(false);
          setSeconds(60);
        }
        return sec - 1;
      });
    }, 1000);
  };

  const requestOtp = async () => {
    const payload = {
      email: data.email.toLowerCase(),
      password: data.password.trim(),
    };
    return await userSvc.requestOTP(payload);
  };

  const requestOtpMutation = useMutation(requestOtp, {
    onSuccess: () => {
      const usersCountry = getCountryFromTimezone();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setLoginCredentials({
        email: data.email.toLocaleLowerCase(),
        password: data.password.trim(),
        location: timezone + ", " + usersCountry,
      });
      openCodeVerification();
      disableLoginButtonFor60Sec();
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
      setIsSubmitting(false);
    },
  });

  const handleChange = (field, value) => {
    const newData = { ...data };

    newData[field] = value;

    setData(newData);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    requestOtpMutation.mutate();
  };

  const handleForgotPassowrd = () => {
    navigate("/forgot-password");
  };

  return (
    <Block classes="login">
      <Grid md={8} lg={12} classes="login__grid">
        <GridItem md={8} lg={12} classes="login__grid__inputs-item">
          <form onSubmit={handleLogin}>
            <Input
              label={t("email_label")}
              onChange={(value) =>
                handleChange("email", value.currentTarget.value)
              }
              placeholder={t("email_placeholder")}
              value={data.email}
            />
            <InputPassword
              classes="login__grid__inputs-item__input--password"
              label={t("password_label")}
              onChange={(value) =>
                handleChange("password", value.currentTarget.value)
              }
              placeholder={t("password_placeholder")}
              value={data.password}
            />
            <Button
              type="ghost"
              color="purple"
              classes="login__grid__forgot-password"
              label={t("forgot_password_label")}
              onClick={() => handleForgotPassowrd()}
            />

            {errors.submit ? <Error message={errors.submit} /> : null}
            <Button
              label={t("login_label")}
              size="lg"
              classes="login-button"
              onClick={handleLogin}
              disabled={!data.email || !data.password || isSubmitting}
              isSubmit
            />
            {showTimer && (
              <p className="login__try-again">
                {t("try_again")} {seconds} {t("seconds")}
              </p>
            )}
          </form>
        </GridItem>
        {/* <GridItem md={8} lg={12} classes="login__grid__content-item">
          <div>
            <p className="text">{t("paragraph")}</p>
            <div className="login__grid__content-item__buttons-container">
              <ButtonOnlyIcon
                onClick={() => handleOAuthLogin("facebook")}
                iconName="facebook-login"
                iconSize="lg"
              />
              <ButtonOnlyIcon
                onClick={() => handleOAuthLogin("apple")}
                iconName="app-store"
                iconSize="lg"
              />
              <ButtonOnlyIcon
                onClick={() => handleOAuthLogin("google")}
                iconName="google-login"
                iconSize="lg"
              />
            </div>
          </div>
        </GridItem> */}
      </Grid>
    </Block>
  );
};
