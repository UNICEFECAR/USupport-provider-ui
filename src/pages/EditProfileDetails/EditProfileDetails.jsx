import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Page, EditProfileDetails as EditProfileDetailsBlock } from "#blocks";
import { UploadPicture, DeleteProfilePicture } from "#backdrops";

import "./edit-profile-details.scss";
import { useTranslation } from "react-i18next";

/**
 * EditProfileDetails
 *
 * Edit profile details page
 *
 * @returns {JSX.Element}
 */
export const EditProfileDetails = () => {
  const { t } = useTranslation("edit-profile-details-page");
  const navigate = useNavigate();

  const [isUploadPictureBackdropOpen, setIsUploadPictureBackdropOpen] =
    useState(false);
  const [isDeletePictureBackdropShown, setIsDeletePictureBackdropShown] =
    useState(false);

  const openUploadPictureBackdrop = () => setIsUploadPictureBackdropOpen(true);
  const openDeletePictureBackdrop = () => setIsDeletePictureBackdropShown(true);

  const closeUploadPictureBackdrop = () =>
    setIsUploadPictureBackdropOpen(false);
  const closeDeletePictureBackdrop = () =>
    setIsDeletePictureBackdropShown(false);

  const handleGoBack = () => navigate("/profile/details");

  return (
    <Page
      classes="page__edit-profile-details"
      heading={t("heading")}
      handleGoBack={handleGoBack}
    >
      <EditProfileDetailsBlock
        {...{ openUploadPictureBackdrop, openDeletePictureBackdrop }}
      />
      <UploadPicture
        isOpen={isUploadPictureBackdropOpen}
        onClose={closeUploadPictureBackdrop}
      />
      <DeleteProfilePicture
        isOpen={isDeletePictureBackdropShown}
        onClose={closeDeletePictureBackdrop}
      />
    </Page>
  );
};
