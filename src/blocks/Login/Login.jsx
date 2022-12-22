import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Block,
  Error,
  Input,
  Grid,
  GridItem,
  InputPassword,
  Button,
  // ButtonOnlyIcon,
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
export const Login = () => {
  const { t } = useTranslation("login");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const login = async () => {
    const usersCountry = getCountryFromTimezone();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const field = data.email.includes("@") ? "email" : "userAccessToken";
    const payload = {
      [field]: data.email.toLowerCase(),
      password: data.password,
      userType: "provider",
      location: timezone + ", " + usersCountry,
    };
    return await userSvc.login(payload);
  };

  const loginMutation = useMutation(login, {
    onSuccess: (response) => {
      const { user: userData, token: tokenData } = response.data;
      const { token, expiresIn, refreshToken } = tokenData;

      localStorage.setItem("token", token);
      localStorage.setItem("token-expires-in", expiresIn);
      localStorage.setItem("refresh-token", refreshToken);

      queryClient.invalidateQueries({ queryKey: ["provider-data"] });

      setErrors({});
      navigate("/dashboard");
    },
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      setErrors({ submit: errorMessage });
    },
    onSettled: () => {
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
    loginMutation.mutate();
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
