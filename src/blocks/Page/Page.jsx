import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useNavigate, NavLink, Link } from "react-router-dom";
import {
  Navbar,
  CircleIconButton,
  Footer,
  Icon,
  PasswordModal,
} from "@USupport-components-library/src";
import {
  countrySvc,
  languageSvc,
  userSvc,
} from "@USupport-components-library/services";
import {
  getCountryFromTimezone,
  replaceLanguageInUrl,
  getLanguageFromUrl,
  redirectToLocalStorageCountry,
} from "@USupport-components-library/utils";
import { useIsLoggedIn, useEventListener, useError } from "#hooks";
import classNames from "classnames";

import "./page.scss";

const kazakhstanCountry = {
  value: "KZ",
  label: "Kazakhstan",
  iconName: "KZ",
};

/**
 * Page
 *
 * Page wrapper
 *
 * @return {jsx}
 */
export const Page = ({
  additionalPadding,
  showGoBackArrow,
  showEmergencyButton,
  showNavbar = null,
  showFooter = null,
  handleGoBack,
  heading,
  subheading,
  headingButton,
  headingImage,
  classes,
  children,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigateTo = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "page" });
  const IS_DEV = process.env.NODE_ENV === "development";
  const IS_KZ = localStorage.getItem("country") === "KZ";
  const isLoggedIn = useIsLoggedIn();
  const isNavbarShown = showNavbar !== null ? showNavbar : isLoggedIn;
  const isFooterShown = showFooter !== null ? showFooter : isLoggedIn;

  let localStorageCountry = localStorage.getItem("country");
  const localStorageLanguage = localStorage.getItem("language");
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorageLanguage
      ? { value: localStorageLanguage.toUpperCase() }
      : { value: "EN" }
  );
  const [selectedCountry, setSelectedCountry] = useState();

  useEventListener("countryChanged", () => {
    const country = localStorage.getItem("country");
    if (country) {
      setSelectedCountry(country);
    }
  });

  const handleCountrySelection = (countries) => {
    let hasSetDefaultCountry = false;

    const usersCountry = getCountryFromTimezone();
    const validCountry = countries.find((x) => x.value === usersCountry);

    for (let i = 0; i < countries.length; i++) {
      const country = countries[i];

      if (localStorageCountry === country.value) {
        localStorage.setItem("country_id", country.countryID);
        localStorage.setItem("currency_symbol", country.currencySymbol);
        localStorage.setItem("has_normal_slots", country.hasNormalSlots);

        setSelectedCountry(country);
      } else if (!localStorageCountry || localStorageCountry === "undefined") {
        if (validCountry?.value === country.value) {
          hasSetDefaultCountry = true;

          localStorage.setItem("country", country.value);
          localStorage.setItem("country_id", country.countryID);
          localStorage.setItem("currency_symbol", country.currencySymbol);

          setSelectedCountry(country);
        }
      }
    }
  };

  const fetchCountries = async () => {
    const res = await countrySvc.getActiveCountries();
    const subdomain = window.location.hostname.split(".")[0];

    if (subdomain && subdomain !== "www" && subdomain !== "usupport") {
      localStorageCountry =
        res.data.find((x) => x.name.toLocaleLowerCase() === subdomain)
          ?.alpha2 || localStorageCountry;
      if (localStorageCountry) {
        localStorage.setItem("country", localStorageCountry);
      }
    }

    if (subdomain === "staging" || subdomain === "usupport") {
      localStorage.setItem("country", "global");
      window.dispatchEvent(new Event("countryChanged"));
    }

    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        countryID: x["country_id"],
        iconName: x.alpha2,
        minAge: x["min_client_age"],
        maxAge: x["max_client_age"],
        currencySymbol: x["symbol"],
        localName: x.local_name,
        hasNormalSlots: x.has_normal_slots,
      };

      return countryObject;
    });

    handleCountrySelection(countries);

    return countries;
  };

  const fetchLanguages = async () => {
    const res = await languageSvc.getActiveLanguages();

    const languageFromUrl = getLanguageFromUrl();

    const languages = res.data.map((x) => {
      const languageObject = {
        value: x.alpha2,
        label: x.name,
        localName: x.local_name,
        id: x.language_id,
      };
      if (!localStorageLanguage || !languageFromUrl) {
        localStorage.setItem("language", "en");
        i18n.changeLanguage("en");
        replaceLanguageInUrl("en");
      }
      return languageObject;
    });

    const foundLanguageFromUrl = languages.find(
      (x) => x.value === languageFromUrl
    );
    if (foundLanguageFromUrl) {
      localStorage.setItem("language", languageFromUrl);
      setSelectedLanguage(foundLanguageFromUrl);
      i18n.changeLanguage(languageFromUrl);
      replaceLanguageInUrl(languageFromUrl);
    }

    return languages;
  };

  const { data: countries } = useQuery(["countries"], fetchCountries, {
    staleTime: Infinity,
  });
  const { data: languages } = useQuery(
    ["languages", selectedCountry],
    fetchLanguages,
    {
      staleTime: Infinity,
      cacheTime: 1000 * 60 * 60 * 24, // Keep cached for 24 hours
      enabled: !!selectedCountry,
    }
  );

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  useEffect(() => {
    const countries = queryClient.getQueryData(["countries"]);
    if (countries) {
      handleCountrySelection(countries);
    }

    const hasUnreadNotificationsData = queryClient.getQueryData([
      "has-unread-notifications",
    ]);
    setHasUnreadNotifications(hasUnreadNotificationsData);
  }, []);

  const newNotificationHandler = useCallback(() => {
    setHasUnreadNotifications(true);
  }, []);
  useEventListener("new-notification", newNotificationHandler);

  const allNotificationsReadHandler = useCallback(() => {
    setHasUnreadNotifications(false);
  });
  useEventListener("all-notifications-read", allNotificationsReadHandler);

  const image = queryClient.getQueryData(["provider-data"])?.image;

  const pages = [
    { name: t("page_1"), url: "/dashboard", exact: true, icon: "home" },
    { name: t("page_2"), url: "/calendar", icon: "calendar" },
    { name: t("page_3"), url: "/activity-history", icon: "document" },
    { name: t("page_4"), url: "/consultations", icon: "two-people" },
    { name: t("page_5"), url: "/clients", icon: "three-people" },
    // !IS_KZ ? { name: t("page_6"), url: "/campaigns", icon: "campaign" },
    // { name: t("page_7"), url: "/my-qa" },
  ];
  if (!IS_KZ) {
    pages.push({
      name: t("page_6"),
      url: "/campaigns",
      icon: "payment-history",
    });
  }
  pages.push({ name: t("page_7"), url: "/my-qa", icon: "info" });

  const footerLists = {
    list1: [
      { name: t("footer_1"), url: "/dashboard" },
      { name: t("page_7"), url: "/my-qa" },
      { name: t("page_6"), url: "/campaigns" },
      { name: t("footer_9"), url: "/faq" },
    ],
    list2: [
      { name: t("footer_2"), url: "/calendar" },
      { name: t("footer_3"), url: "/activity-history" },
      { name: t("footer_4"), url: "/consultations" },
      { name: t("footer_5"), url: "/clients", exact: true },
    ],
    list3: [
      { name: t("contact_us"), url: "/contact-us" },
      { name: t("footer_6"), url: "/terms-of-use" },
      { name: t("footer_7"), url: "/privacy-policy" },
      { name: t("footer_8"), url: "/cookie-policy" },
    ],
  };
  const hasPassedValidation = queryClient.getQueryData(["hasPassedValidation"]);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(
    IS_DEV ? false : !hasPassedValidation
  );
  const [passwordError, setPasswordError] = useState("");

  const validatePlatformPasswordMutation = useMutation(
    async (value) => {
      return await userSvc.validatePlatformPassword(value);
    },
    {
      onError: (error) => {
        const { message: errorMessage } = useError(error);
        setPasswordError(errorMessage);
      },
      onSuccess: () => {
        queryClient.setQueryData(["hasPassedValidation"], true);
        setIsPasswordModalOpen(false);
      },
    }
  );

  const handlePasswordCheck = (value) => {
    validatePlatformPasswordMutation.mutate(value);
  };

  return (
    <>
      <PasswordModal
        label={t("password")}
        btnLabel={t("submit")}
        isOpen={isPasswordModalOpen}
        isLoading={validatePlatformPasswordMutation.isLoading}
        error={passwordError}
        handleSubmit={handlePasswordCheck}
        placeholder={t("password_placeholder")}
      />
      {isNavbarShown === true && (
        <Navbar
          pages={pages}
          showProfile
          yourProfileText={t("your_profile_text")}
          i18n={i18n}
          image={image || "default"}
          navigate={navigateTo}
          NavLink={NavLink}
          countries={countries}
          languages={languages}
          initialCountry={selectedCountry}
          initialLanguage={selectedLanguage}
          hasUnreadNotifications={hasUnreadNotifications}
          renderIn="provider"
        />
      )}
      <div
        className={[
          "page",
          `${additionalPadding ? "" : "page--no-additional-top-padding"}`,
          `${classNames(classes)}`,
        ].join(" ")}
      >
        {(heading || showGoBackArrow || headingButton || headingImage) && (
          <div className="page__header">
            {showGoBackArrow && (
              <Icon
                classes="page__header-icon"
                name="arrow-chevron-back"
                size="md"
                color="#20809E"
                onClick={handleGoBack}
              />
            )}
            {headingImage && (
              <img className="page__header__image" src={headingImage} />
            )}
            {heading && (
              <h3
                className={`page__header-heading ${
                  !showGoBackArrow && "page__header-heading__no-go-back-arrow"
                }`}
              >
                {heading}
              </h3>
            )}
            {headingButton && headingButton}
          </div>
        )}
        <p
          className={`page__subheading-text text ${
            !showGoBackArrow && "page__subheading-text__no-go-back-arrow"
          }`}
        >
          {subheading}
        </p>
        {children}
      </div>
      {showEmergencyButton && (
        <CircleIconButton
          iconName="phone-emergency"
          classes="page__emergency-button"
          onClick={() =>
            navigateTo(`
              /provider${localStorageLanguage}/sos-center
            `)
          }
          label={t("emergency_button")}
        />
      )}
      {isFooterShown && (
        <Footer
          renderIn="provider"
          lists={footerLists}
          navigate={navigateTo}
          Link={Link}
        />
      )}
    </>
  );
};

Page.propTypes = {
  /**
   * Additional padding on top of the page
   */
  additionalPadding: PropTypes.bool,

  /**
   * Show the navbar
   */
  showNavbar: PropTypes.bool,

  /**
   * Show the footer
   */
  showFooter: PropTypes.bool,

  /**
   * Show the go back arrow
   */
  showGoBackArrow: PropTypes.bool,

  /**
   * Show the emergency button
   */
  showEmergencyButton: PropTypes.bool,

  /**
   * Heading text
   */
  heading: PropTypes.string,

  /**
   * Subheading text
   */
  subheading: PropTypes.string,

  /**
   * Heading button
   */
  headingButton: PropTypes.node,

  /**
   * Additional classes
   */
  classes: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
};

Page.defaultProps = {
  additionalPadding: true,
  showGoBackArrow: true,
  showEmergencyButton: false,
};
