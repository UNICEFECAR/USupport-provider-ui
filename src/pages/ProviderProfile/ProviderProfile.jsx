import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Page, ProviderProfile as ProviderProfileBlock } from "#blocks";
import { ButtonWithIcon, RadialCircle } from "@USupport-components-library/src";
import { useWindowDimensions } from "@USupport-components-library/utils";
import { userSvc } from "@USupport-components-library/services";
import "./provider-profile.scss";

/**
 * ProviderProfile
 *
 * ProviderProfile page
 *
 * @returns {JSX.Element}
 */
export const ProviderProfile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("provider-profile-page");
  const { width } = useWindowDimensions();

  const handleLogout = () => {
    userSvc.logout();

    navigate("/");
  };

  const handleGoBack = () => navigate(-1);

  return (
    <Page
      classes="page__provider-profile"
      heading={t("heading")}
      subheading={t("subheading")}
      handleGoBack={handleGoBack}
      headingButton={
        <ButtonWithIcon
          label={t("button_label")}
          iconName="exit"
          iconColor="#ffffff"
          size="sm"
          circleSize="sm"
          onClick={handleLogout}
          style={{ marginLeft: "auto" }}
        />
      }
    >
      <ProviderProfileBlock />
      {width < 768 && (
        <RadialCircle
          color="purple"
          classes="page__provider-profile__radial-circle"
        />
      )}
    </Page>
  );
};
