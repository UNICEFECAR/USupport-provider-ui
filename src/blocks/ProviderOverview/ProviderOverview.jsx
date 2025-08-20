import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import {
  Block,
  Button,
  ButtonWithIcon,
  GridItem,
  Loading,
  ProviderDetails,
} from "@USupport-components-library/src";

import { useGetProviderData } from "#hooks";

const AMAZON_S3_BUCKET = `${import.meta.env.VITE_AMAZON_S3_BUCKET}`;

import "./provider-overview.scss";

/**
 * ProviderOverview
 *
 * ProviderOverview block
 *
 * @return {jsx}
 */
export const ProviderOverview = ({
  openChangePasswordBackdrop,
  openDeleteAccountBackdrop,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "provider-overview" });
  const navigate = useNavigate();

  const [providerDataQuery] = useGetProviderData();
  const provider = providerDataQuery.data;
  const image = AMAZON_S3_BUCKET + "/" + (provider?.image || "default");

  const handleEditRedirect = () => {
    navigate("/profile/details/edit");
  };

  return (
    <Block classes="provider-profile">
      {providerDataQuery.isLoading || !provider ? (
        <Loading size="lg" />
      ) : (
        <ProviderDetails
          provider={provider}
          t={t}
          image={image}
          buttonComponent={
            <GridItem md={8} lg={12} classes="provider-profile__buttons-item">
              <div className="provider-profile__controls">
                <Button
                  label={t("edit_details")}
                  type="primary"
                  size="lg"
                  classes="provider-profile__edit-button"
                  onClick={handleEditRedirect}
                />
                <Button
                  size="lg"
                  type="ghost"
                  label={t("change_password")}
                  classes="provider-profile__change-password-button"
                  onClick={openChangePasswordBackdrop}
                />
                <ButtonWithIcon
                  iconName={"circle-close"}
                  iconSize={"md"}
                  size="lg"
                  iconColor={"#eb5757"}
                  color={"red"}
                  label={t("delete_account")}
                  type={"ghost"}
                  classes="provider-profile__delete-account-button"
                  onClick={openDeleteAccountBackdrop}
                />
              </div>
            </GridItem>
          }
        />
      )}
    </Block>
  );
};
