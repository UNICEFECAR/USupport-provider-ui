import React, { useState, useCallback } from "react";
import OutsideClickHandler from "react-outside-click-handler";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Block,
  Box,
  Button,
  ButtonWithIcon,
  Grid,
  GridItem,
  Icon,
  Loading,
} from "@USupport-components-library/src";
import { useGetProviderData } from "@USupport-components-library/hooks";

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
  const { t } = useTranslation("provider-overview");
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [providerDataQuery] = useGetProviderData();
  const provider = providerDataQuery.data;
  const image = AMAZON_S3_BUCKET + "/" + (provider?.image || "default");

  const allOptionsToString = (option) => {
    return provider[option].join(", ");
  };

  const renderSpecializations = useCallback(() => {
    if (provider) {
      return provider.specializations.map((x) => t(x)).join(", ");
    }
  });

  const renderWorkWith = useCallback(() => {
    if (provider) {
      return provider.workWith
        .map((x) => t(x.topic.replaceAll("-", "_")))
        .join(", ");
    }
  }, [provider]);

  const renderLanguages = useCallback(() => {
    if (provider) {
      return provider.languages.map((x) => x.name).join(" ");
    }
  }, [provider]);

  const handleEditRedirect = () => {
    navigate("edit");
  };

  return (
    <Block classes="provider-profile">
      {providerDataQuery.isLoading || !provider ? (
        <Loading size="lg" />
      ) : (
        <Grid md={8} lg={12} classes="provider-profile__grid">
          <GridItem md={8} lg={12}>
            <div className="provider-profile__header">
              <div className="provider-profile__header__provider-container">
                <Avatar
                  image={image}
                  classes="provider-profile__header__provider-container__avatar"
                />
                <div className="provider-profile__header__provider-container__text-container">
                  <h4>
                    {provider.name} {provider.patronym ? provider.patronym : ""}{" "}
                    {provider.surname}
                  </h4>
                  <p className="small-text">{renderSpecializations()}</p>
                </div>
              </div>
            </div>
          </GridItem>
          <GridItem md={8} lg={12} classes="provider-profile__grid__item">
            <div className="provider-profile__information-container-with-icon">
              <Icon
                name="call"
                size="md"
                color="#66768D"
                classes="provider-profile__information-container-with-icon__icon"
              />
              <p className="small-text">{`${provider.phonePrefix} ${provider.phone}`}</p>
            </div>
            <div className="provider-profile__information-container-with-icon">
              <Icon
                name="mail-admin"
                size="md"
                color="#66768D"
                classes="provider-profile__information-container-with-icon__icon"
              />
              <p className="small-text">{provider.email}</p>
            </div>
            <div className="provider-profile__information-container-with-icon">
              <Icon
                name="dollar"
                size="md"
                color="#66768D"
                classes="provider-profile__information-container-with-icon__icon"
              />
              <p className="small-text">
                {provider.price}$ for 1 hour consultation
              </p>
            </div>
            <div className="provider-profile__information-container">
              <p className="small-text provider-profile__information-container__heading">
                {t("earliest_spot_label")}
              </p>
              <p className="small-text provider-profile__information-container__text">
                {provider.earliestAvailable}
              </p>
            </div>
            <div className="provider-profile__information-container">
              <p className="small-text provider-profile__information-container__heading">
                {t("languages_label")}
              </p>
              <p className="small-text provider-profile__information-container__text">
                {renderLanguages()}
              </p>
            </div>
            <div className="provider-profile__information-container">
              <p className="small-text provider-profile__information-container__heading">
                {t("education_label")}
              </p>
              <p className="small-text provider-profile__information-container__text">
                {allOptionsToString("education")}
              </p>
            </div>
            <div className="provider-profile__information-container">
              <p className="small-text provider-profile__information-container__heading">
                {t("work_with_label")}
              </p>
              <p className="small-text provider-profile__information-container__text">
                {renderWorkWith()}
              </p>
            </div>
            <div className="provider-profile__information-container">
              <p className="small-text provider-profile__information-container__heading">
                {t("done_consultations_label")}
              </p>
              <p className="small-text provider-profile__information-container__text">
                {provider.consultations} consultations
              </p>
            </div>
            <div className="provider-profile__information-container">
              <p className="small-text provider-profile__information-container__heading">
                {t("description_label")}
              </p>
              <p className="small-text provider-profile__information-container__text">
                {provider.description}
              </p>
            </div>
          </GridItem>

          <GridItem md={8} lg={12}>
            <div className="provider-profile__grid__controls">
              <Button
                label={t("edit_details")}
                type="primary"
                size="lg"
                classes="provider-profile__grid__edit-button"
                onClick={handleEditRedirect}
              />
              <Button
                size="lg"
                type="ghost"
                label={t("change_password")}
                classes="provider-profile__grid__change-password-button"
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
                classes="provider-profile__grid__delete-account-button"
                onClick={openDeleteAccountBackdrop}
              />
            </div>
          </GridItem>
        </Grid>
      )}
    </Block>
  );
};
