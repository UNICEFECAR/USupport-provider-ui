import React from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import {
  ActionRow,
  Block,
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
  const { t: translate } = useTranslation("blocks", {
    keyPrefix: "provider-overview",
  });
  const t = (key, options) => {
    const normalizedKey = String(key ?? "").trim();
    if (
      normalizedKey === "peer_support" ||
      normalizedKey.endsWith(".peer_support")
    ) {
      return "U-FRIEND";
    }
    return translate(key, options);
  };
  const navigate = useNavigate();

  const [providerDataQuery] = useGetProviderData();
  const provider = providerDataQuery.data;
  const image = AMAZON_S3_BUCKET + "/" + (provider?.image || "default");

  const handleEditRedirect = () => {
    navigate("/profile/details/edit");
  };

  return (
    <Block classes="provider-overview">
      {providerDataQuery.isLoading || !provider ? (
        <Loading size="lg" />
      ) : (
        <div className="provider-overview__content">
          <ProviderDetails
            provider={provider}
            t={t}
            image={image}
            hasCookies={false}
            buttonComponent={
              <div className="provider-overview__secondary-actions">
                <ActionRow
                  iconName="edit"
                  iconSize="sm"
                  label={t("edit_details")}
                  onClick={handleEditRedirect}
                />
                <ActionRow
                  iconName="fingerprint"
                  iconSize="sm"
                  label={t("change_password")}
                  onClick={openChangePasswordBackdrop}
                />
                <ActionRow
                  iconName="circle-actions-close"
                  iconSize="sm"
                  label={t("delete_account")}
                  onClick={openDeleteAccountBackdrop}
                  isDanger
                />
              </div>
            }
          />
        </div>
      )}
    </Block>
  );
};
