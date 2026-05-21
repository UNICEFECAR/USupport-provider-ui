import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import { Page, ProviderOverview as ProviderOverviewBlock } from "#blocks";
import { useWindowDimensions } from "@USupport-components-library/src/utils";

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
  const { t } = useTranslation("pages", {
    keyPrefix: "provider-overview-page",
  });

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
      subheading={t("subheading")}
      handleGoBack={handleGoBack}
    >
      <ProviderOverviewBlock
        {...{ openChangePasswordBackdrop, openDeleteAccountBackdrop }}
      />
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
