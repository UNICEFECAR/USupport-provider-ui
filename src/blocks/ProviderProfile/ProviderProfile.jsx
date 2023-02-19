import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Block,
  Grid,
  GridItem,
  ButtonSelector,
} from "@USupport-components-library/src";
import { useGetProviderData } from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./provider-profile.scss";

/**
 * ProviderProfile
 *
 * ProviderProfile block
 *
 * @return {jsx}
 */
export const ProviderProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("provider-profile");

  const [displayName, setDisplayName] = useState("");

  const providerData = useGetProviderData()[1];

  useEffect(() => {
    if (providerData) {
      if (providerData.name && providerData.surname) {
        setDisplayName(`${providerData.name} ${providerData.surname}`);
      } else {
        setDisplayName(providerData.nickname);
      }
    }
  }, [providerData]);

  const handleRedirect = (redirectTo) => {
    navigate(`/${redirectTo}`);
  };

  return (
    <Block classes="provider-profile">
      <Grid md={8} lg={12} classes="provider-profile__grid">
        <GridItem md={8} lg={12} classes="provider-profile__grid__item">
          <p className="text provider-profile__grid__item__label">
            {t("your_profile")}
          </p>
          <ButtonSelector
            label={displayName || t("guest")}
            classes="provider-profile__grid__item__button "
            onClick={() => handleRedirect("/profile/details")}
            avatar={`${AMAZON_S3_BUCKET}/${providerData?.image || "default"}`}
          />
        </GridItem>
        <GridItem md={8} lg={12} classes="provider-profile__grid__item">
          <p className="text provider-profile__grid__item__label">
            {t("application_settings")}
          </p>
          <ButtonSelector
            label={t("notifications_settings_button_label")}
            iconName="notifications"
            classes="provider-profile__grid__item__button"
            onClick={() => handleRedirect("/notification-preferences")}
          />
        </GridItem>
        <GridItem md={8} lg={12} classes="provider-profile__grid__item">
          <p className="text provider-profile__grid__item__label">
            {t("other")}
          </p>
          <ButtonSelector
            label={t("reports_button_label")}
            iconName="activities"
            classes="provider-profile__grid__item__button"
            onClick={() => handleRedirect("reports")}
          />
          <ButtonSelector
            label={t("contact_us_button_label")}
            iconName="comment"
            classes="provider-profile__grid__item__button"
            onClick={() => handleRedirect("contact-us")}
          />
          <ButtonSelector
            label={t("privacy_policy_button_label")}
            iconName="document"
            classes="provider-profile__grid__item__button"
            onClick={() => handleRedirect("/privacy-policy")}
          />
          <ButtonSelector
            label={t("FAQ_button_label")}
            iconName="info"
            classes="provider-profile__grid__item__button"
            onClick={() => handleRedirect("/faq")}
          />
        </GridItem>
      </Grid>
    </Block>
  );
};
