import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("provider-overview-page");
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

  const { width } = useWindowDimensions();

  return (
    <Page classes="page__provider-overview" heading={t("heading")}>
      <ProviderOverviewBlock
        {...{ openChangePasswordBackdrop, openDeleteAccountBackdrop }}
      />
      <div className="page__provider-overview__button-container">
        <Button
          label={t("button_label")}
          color="purple"
          size="md"
          onClick={() => handleSchedule()}
        />
      </div>
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
