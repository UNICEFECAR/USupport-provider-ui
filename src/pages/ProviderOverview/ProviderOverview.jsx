import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Page, ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { useWindowDimensions } from "@USupport-components-library/src/utils";
import { RadialCircle, Button } from "@USupport-components-library/src";

import "./provider-overview.scss";
import { ChangePassword, DeleteAccount } from "../../backdrops";

/**
 * ProviderOverview
 *
 * ProviderOverview page
 *
 * @returns {JSX.Element}
 */
export const ProviderOverview = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("provider-overview-page");
  const { width } = useWindowDimensions();

  const [isChangePasswordBackdropOpen, setIsChangePasswordBackdropOpen] =
    useState(false);
  const [isDeleteAccountBackdropOpen, setIsDeleteAccountBackdropOpen] =
    useState(false);

  const openChangePasswordBackdrop = () =>
    setIsChangePasswordBackdropOpen(true);
  const openDeleteAccountBackdrop = () => setIsDeleteAccountBackdropOpen(true);

  const closeChangePasswordBackdrop = () =>
    setIsChangePasswordBackdropOpen(false);
  const closeDeleteAccountBackdrop = () =>
    setIsDeleteAccountBackdropOpen(false);

  const handleGoBack = () => navigate(-1);

  return (
    <Page
      classes="page__provider-overview"
      heading={t("heading")}
      handleGoBack={handleGoBack}
    >
      <ProviderOverviewBlock
        {...{ openChangePasswordBackdrop, openDeleteAccountBackdrop }}
      />
      {width < 768 && <RadialCircle />}
      <ChangePassword
        isOpen={isChangePasswordBackdropOpen}
        onClose={closeChangePasswordBackdrop}
      />
      <DeleteAccount
        isOpen={isDeleteAccountBackdropOpen}
        onClose={closeDeleteAccountBackdrop}
      />
    </Page>
  );
};
