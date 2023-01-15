import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Block,
  Button,
  DropdownGroup,
  DropdownWithLabel,
  Error,
  Grid,
  GridItem,
  Input,
  InputGroup,
  Loading,
  ProfilePicturePreview,
  Textarea,
} from "@USupport-components-library/src";

import { validate, validateProperty } from "@USupport-components-library/utils";
import {
  useGetProviderData,
  useGetCountryAndLanguages,
  useGetWorkWithCategories,
  useUpdateProviderData,
} from "#hooks";
import countryCodes from "country-codes-list";
import Joi from "joi";

import "./edit-profile-details.scss";

/**
 * EditProfileDetails
 *
 * Edit profile details block
 *
 * @return {jsx}
 */
export const EditProfileDetails = ({
  openUploadPictureBackdrop,
  openDeletePictureBackdrop,
}) => {
  const { t } = useTranslation("edit-profile-details");
  const [providersQuery, providerData, setProviderData] = useGetProviderData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [canSaveChanges, setCanSaveChanges] = useState(false);

  const localizationQuery = useGetCountryAndLanguages();
  const workWithQuery = useGetWorkWithCategories();

  const [errors, setErrors] = useState({});

  const specializationOptions = [
    { value: "psychologist", label: t("psychologist"), selected: false },
    { value: "psychiatrist", label: t("psychiatrist"), selected: false },
    { value: "psychotherapist", label: t("psychotherapist"), selected: false },
  ];

  useEffect(() => {
    if (providerData && providersQuery.data) {
      const providerDataStringified = JSON.stringify(providerData);
      const originalData = JSON.stringify(providersQuery.data);
      setCanSaveChanges(providerDataStringified !== originalData);
    }
  }, [providerData, providersQuery.data]);

  const schema = Joi.object({
    providerDetailId: Joi.string(),
    name: Joi.string().label(t("name_error")),
    patronym: Joi.string().allow("", null).label(t("patronym_error")),
    surname: Joi.string().label(t("surname_error")),
    nickname: Joi.string().allow("", null).label(t("nickname_error")),
    sex: Joi.string().label(t("sex_error")),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .label(t("email_error")),
    phonePrefix: Joi.string().label(t("phone_prefix_error")),
    phone: Joi.string().label(t("phone_error")),
    image: Joi.string(),
    street: Joi.string().label(t("street_error")),
    city: Joi.string().label(t("city_error")),
    postcode: Joi.string().label(t("postcode_error")),

    specializations: Joi.array().min(1).label(t("specializations_error")),
    consultationPrice: Joi.number().min(0).label(t("consultation_price_error")),
    languages: Joi.array().min(1).label(t("languages_error")),
    education: Joi.array().min(1).label(t("education_error")),
    workWith: Joi.array().min(1).label(t("work_with_error")),
    description: Joi.string().label(t("description_error")),
    totalConsultations: Joi.any(),
    earliestAvailableSlot: Joi.any(),
    videoLink: Joi.string().uri().allow("", null),
  });

  const sexOptions = [
    { label: t("sex_male"), value: "male" },
    { label: t("sex_female"), value: "female" },
    { label: t("sex_unspecified"), value: "unspecified" },
    { label: t("sex_none"), value: "notMentioned" },
  ];

  const getSpecializationsOptions = useCallback(() => {
    if (providerData && providerData.specializations) {
      return specializationOptions.map((option, index) => {
        if (providerData.specializations.includes(option.value)) {
          return {
            ...option,
            selected: true,
            selectedIndex: providerData.specializations.indexOf(option.value),
          };
        }
        return option;
      });
    }
    return specializationOptions;
  }, [providerData]);

  const getLanguageOptions = useCallback(() => {
    const languageOptions = [];
    if (localizationQuery.data && providerData) {
      // Get all language ID's from the provider data
      const providerLanguages = providerData.languages.map(
        (x) => x.language_id || x
      );
      for (let i = 0; i < localizationQuery.data.languages.length; i++) {
        const newLanguageOption = {};
        const language = localizationQuery.data.languages[i];
        // Construct the new object
        newLanguageOption.value = language.language_id;
        newLanguageOption.label = language.name;
        newLanguageOption.selected = providerLanguages.includes(
          language.language_id
        );
        newLanguageOption.selectedIndex = providerLanguages.indexOf(
          language.language_id
        );
        languageOptions.push(newLanguageOption);
      }
    }
    return languageOptions;
  }, [localizationQuery.data, providerData]);

  const getWorkWithOptions = useCallback(() => {
    const workWithOptions = [];
    if (workWithQuery.data && providerData) {
      const providerWorkWith = providerData.workWith.map(
        (x) => x.work_with_id || x
      ); // Get all work with ids from provider data
      for (let i = 0; i < workWithQuery.data.length; i++) {
        const newWorkWith = {};
        const category = workWithQuery.data[i];
        // Construct the new object
        newWorkWith.value = category.work_with_id;
        newWorkWith.label = t(category.topic.replaceAll("-", "_"));
        newWorkWith.selected = providerWorkWith.includes(category.work_with_id);
        newWorkWith.selectedIndex = providerWorkWith.indexOf(
          category.work_with_id
        );
        workWithOptions.push(newWorkWith);
      }
    }
    return workWithOptions;
  }, [workWithQuery.data, providerData]);

  const handleChange = (field, value) => {
    const data = { ...providerData };
    data[field] = value;
    setProviderData(data);
  };

  const handleWorkWithAndLanguageSelect = (field, options) => {
    setErrors({ [field]: null });
    const selected = options
      .filter((option) => option.selected)
      .map((x) => x.value);
    handleChange(field, selected);
  };

  const handleEducationChange = (options) => {
    setErrors({ education: null });
    const data = { ...providerData };
    data.education = options.map((x) => x.value);
    setProviderData(data);
  };

  const handleBlur = (field) => {
    validateProperty(field, providerData[field], schema, setErrors);
  };

  const onUpdateSuccess = () => {
    setIsProcessing(false);
    toast(t("edit_succes"));
  };

  const onUpdateError = (err) => {
    setErrors({ submit: err });
    setIsProcessing(false);
  };
  const updateProviderMutation = useUpdateProviderData(
    onUpdateSuccess,
    onUpdateError
  );

  const handleSave = async () => {
    setIsProcessing(true);
    if ((await validate(providerData, schema, setErrors)) === null) {
      updateProviderMutation.mutate(providerData);
    } else {
      setIsProcessing(false);
    }
  };

  const isLoading =
    providersQuery.isLoading ||
    localizationQuery.isLoading ||
    !localizationQuery.data ||
    !providerData;

  const handleDiscard = () => {
    setProviderData(providersQuery.data);
  };

  const phonePrefixes = generateCountryCodes();
  const usersCountry = localStorage.getItem("country");

  return (
    <Block classes="edit-profile-details">
      {isLoading ? (
        <Loading size="lg" />
      ) : (
        <Grid classes="edit-profile-details__grid">
          <GridItem md={8} lg={4}>
            <ProfilePicturePreview
              image={providerData.image}
              handleDeleteClick={openDeletePictureBackdrop}
              handleChangeClick={openUploadPictureBackdrop}
              changePhotoText={t("change_photo")}
            />
            <Input
              value={providerData.name}
              onChange={(e) => handleChange("name", e.currentTarget.value)}
              errorMessage={errors.name}
              label={t("name_label")}
              placeholder={t("name_placeholder")}
            />
            <Input
              value={providerData.patronym}
              onChange={(e) => handleChange("patronym", e.currentTarget.value)}
              errorMessage={errors.patronym}
              label={t("patronym_label")}
              placeholder={t("patronym_placeholder")}
            />
            <Input
              value={providerData.surname}
              onChange={(e) => handleChange("surname", e.currentTarget.value)}
              errorMessage={errors.surname}
              label={t("surname_label")}
              placeholder={t("surname_placeholder")}
            />
            <Textarea
              value={providerData.description}
              onChange={(value) => handleChange("description", value)}
              errorMessage={errors.description}
              label={t("description_label")}
              placeholder={t("description_placeholder")}
              onBlur={() => handleBlur("description")}
            />
            <Input
              value={providerData.videoLink}
              onChange={(e) => handleChange("videoLink", e.currentTarget.value)}
              label={t("video_link_label")}
              placeholder={t("video_link_placeholder")}
            />
          </GridItem>

          <GridItem md={8} lg={4}>
            <div className="edit-profile-details__grid__phone-container">
              <DropdownWithLabel
                options={phonePrefixes}
                label={t("phone_label")}
                selected={
                  providerData.phonePrefix ||
                  phonePrefixes.find((x) => x.country === usersCountry)?.value
                }
                setSelected={(value) => handleChange("phonePrefix", value)}
                placeholder={t("phone_prefix_placeholder")}
              />
              <Input
                value={providerData.phone}
                onChange={(e) => handleChange("phone", e.currentTarget.value)}
                placeholder={t("phone_placeholder")}
                onBlur={() => handleBlur("phone")}
                classes="edit-profile-details__grid__phone-container__phone-input"
              />
            </div>
            {errors.phone || errors.phonePrefix ? (
              <Error
                classes="edit-profile-details__grid__phone-error"
                message={errors.phone || errors.phonePrefix}
              />
            ) : null}
            <Input
              value={providerData.email}
              onChange={(e) => handleChange("email", e.currentTarget.value)}
              errorMessage={errors.email}
              label={t("email_label")}
              placeholder={t("email_placeholder")}
              onBlur={() => handleBlur("email")}
            />
            <DropdownWithLabel
              label={t("sex_label")}
              placeholder={t("sex_placeholder")}
              options={sexOptions}
              selected={providerData.sex}
              setSelected={(value) => handleChange("sex", value)}
              classes="edit-profile-details__grid__sex-dropdown"
              errorMessage={errors.sex}
            />
            <Input
              value={providerData.consultationPrice}
              onChange={(e) =>
                handleChange("consultationPrice", e.currentTarget.value)
              }
              errorMessage={errors.consultationPrice}
              label={t("consultation_price_label")}
              placeholder={t("consultation_price_placeholder")}
              onBlur={() => handleBlur("consultationPrice")}
            />
            <Input
              value={providerData.city}
              onChange={(e) => handleChange("city", e.currentTarget.value)}
              errorMessage={errors.city}
              label={t("city_label")}
              placeholder={t("city_placeholder")}
              onBlur={() => handleBlur("city")}
            />
            <Input
              value={providerData.postcode}
              onChange={(e) => handleChange("postcode", e.currentTarget.value)}
              errorMessage={errors.postcode}
              label={t("postcode_label")}
              placeholder={t("postcode_placeholder")}
              onBlur={() => handleBlur("postcode")}
            />
            <Input
              value={providerData.street}
              onChange={(e) => handleChange("street", e.currentTarget.value)}
              errorMessage={errors.street}
              label={t("street_label")}
              placeholder={t("street_placeholder")}
              onBlur={() => handleBlur("street")}
            />
          </GridItem>

          <GridItem md={8} lg={4}>
            <DropdownGroup
              options={getLanguageOptions()}
              handleChange={(languages) =>
                handleWorkWithAndLanguageSelect("languages", languages)
              }
              label={t("language_label")}
              maxShown={5}
              addMoreText={t("add_more_languages")}
              errorMessage={errors.languages}
            />
            <DropdownGroup
              label={t("specialization_label")}
              options={getSpecializationsOptions()}
              handleChange={(options) =>
                handleWorkWithAndLanguageSelect("specializations", options)
              }
              maxShown={specializationOptions.length}
              addMoreText={t("add_more_specializations")}
              errorMessage={errors.specializations}
            />
            <InputGroup
              maxShown={5}
              options={providerData.education}
              label={t("education_label")}
              handleParentChange={(data) => handleEducationChange(data)}
              addMoreText={t("add_more_education")}
              errorMessage={errors.education}
            />
            <DropdownGroup
              options={getWorkWithOptions()}
              handleChange={(workWith) =>
                handleWorkWithAndLanguageSelect("workWith", workWith)
              }
              label={t("work_with_label")}
              maxShown={5}
              addMoreText={t("add_more_work_with")}
              errorMessage={errors.workWith}
            />
          </GridItem>
          {errors.submit ? <Error message={errors.submit} /> : null}
          <GridItem
            md={8}
            lg={12}
            classes="edit-profile-details__grid__buttons-item"
          >
            <Button
              classes="edit-profile-details__grid__save-button"
              type="primary"
              label={t("button_text")}
              size="lg"
              onClick={handleSave}
              disabled={!canSaveChanges || isProcessing}
            />
            <Button
              type="secondary"
              classes="edit-profile-details__grid__discard-button"
              label={t("button_secondary_text")}
              size="lg"
              disabled={!canSaveChanges}
              onClick={handleDiscard}
            />
          </GridItem>
        </Grid>
      )}

      {/* <Modal
        isOpen={isDeleteLanguageModalOpen}
        onClose={closeDeleteLanguageModal}
        heading={t("delete_language_modal_title")}
        text={t("delete_language_modal_text")}
        ctaLabel={t("delete_language_modal_button_text")}
        ctaHandleClick={handleDeleteLanguage}
      /> */}
    </Block>
  );
};

function generateCountryCodes() {
  const countryCodesList = countryCodes.customList(
    "countryCode",
    "+{countryCallingCode}"
  );
  const codes = [];
  Object.keys(countryCodesList).forEach((key) => {
    codes.push({
      value: countryCodesList[key],
      label: `${key}: ${countryCodesList[key]}`,
      country: key,
    });
  });

  return codes;
}
