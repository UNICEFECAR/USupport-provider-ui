import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import {
  Block,
  InputPassword,
  Grid,
  GridItem,
  NewButton,
  Error,
} from "@USupport-components-library/src";
import { logoVerticalSvg } from "@USupport-components-library/assets";
import { userSvc } from "@USupport-components-library/services";
import { validate } from "@USupport-components-library/utils";
import { useError } from "#hooks";
import Joi from "joi";

const WEBSITE_URL = `${import.meta.env.VITE_WEBSITE_URL}`;

import "./reset-password.scss";

/**
 * ResetPassword
 *
 * Reset password block
 *
 * @return {jsx}
 */
export const ResetPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("blocks", { keyPrefix: "reset-password" });
  const { t: tLogin } = useTranslation("blocks", { keyPrefix: "login" });

  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showLink, setShowLink] = useState(false);

  const schema = Joi.object({
    password: Joi.string()
      .pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}"))
      .label(t("password_error")),
  });

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setIsLoading(true);
    const token = new URLSearchParams(window.location.search).get("rp");
    if ((await validate({ password }, schema, setErrors)) === null) {
      try {
        const res = await userSvc.resetPassword(password, token);
        if (res.status === 200) {
          navigate("/login");
        }
      } catch (error) {
        const { message: errorMessage } = useError(error);
        if (error.response.status === 409) {
          setShowLink(`${WEBSITE_URL}/provider/forgot-password`);
        }
        setErrors({ submit: errorMessage });
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Block classes="reset-password">
      <Grid md={8} lg={12} classes="reset-password__grid">
        <GridItem md={8} lg={12} classes="reset-password__grid__logo-item">
          <h2 className="reset-password__grid__logo-item__heading">
            {tLogin("heading")}
          </h2>
          <img
            src={logoVerticalSvg}
            alt="Logo"
            className="reset-password__grid__logo-item__logo"
          />
          <h2 className="reset-password__grid__logo-item__heading">
            {tLogin("provider")}
          </h2>
        </GridItem>
        <GridItem md={8} lg={12} classes="reset-password__grid__content-item">
          <form onSubmit={handleSubmit}>
            <InputPassword
              value={password}
              onChange={(e) => setPassword(e.currentTarget.value)}
              placeholder={t("placeholder")}
              label={t("label")}
              errorMessage={errors.password}
            />
            {errors.submit ? <Error message={errors.submit} /> : null}
            {showLink && (
              <a className="reset-password__link" href={showLink}>
                {showLink}
              </a>
            )}
            <NewButton
              label={t("submit")}
              size="lg"
              isFullWidth
              disabled={!password}
              loading={isLoading}
            />
          </form>
        </GridItem>
      </Grid>
    </Block>
  );
};
