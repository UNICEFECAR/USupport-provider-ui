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
  Block,
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
import {
  useIsLoggedIn,
  useEventListener,
  useError,
  useCheckHasUnreadNotifications,
} from "#hooks";
import classNames from "classnames";

import { NotificationMenu } from "./NotificationMenu";

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
  darkBackground = false,
}) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigateTo = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation("blocks", { keyPrefix: "page" });
  const { t: tNav } = useTranslation("blocks", {
    keyPrefix: "provider-profile",
  });
  const IS_DEV = process.env.NODE_ENV === "development";
  const IS_KZ = localStorage.getItem("country") === "KZ";
  const isLoggedIn = useIsLoggedIn();
  const token = localStorage.getItem("token");
  const unreadNotificationsQuery = useCheckHasUnreadNotifications(!!token);
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
  }, []);

  useEffect(() => {
    const hasUnreadNotificationsData = unreadNotificationsQuery.data;
    setHasUnreadNotifications(hasUnreadNotificationsData);
  }, [unreadNotificationsQuery.data]);

  const newNotificationHandler = useCallback(() => {
    setHasUnreadNotifications(true);
  }, []);
  useEventListener("new-notification", newNotificationHandler);

  const allNotificationsReadHandler = useCallback(() => {
    setHasUnreadNotifications(false);
  });
  useEventListener("all-notifications-read", allNotificationsReadHandler);

  const renderNotificationsContent = (closePanel) => (
    <NotificationMenu closePanel={closePanel} />
  );

  const providerData = queryClient.getQueryData(["provider-data"]);
  const image = providerData?.image;
  const clientName = providerData
    ? providerData.name && providerData.surname
      ? `${providerData.name} ${providerData.surname}`
      : providerData.nickname || providerData.name || ""
    : "";

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

  const gitBookBase = import.meta.env.VITE_GIT_BOOK_URL;
  const providerUserGuideHref = gitBookBase
    ? `${gitBookBase}/ui-usage-manuals/provider`
    : null;

  const handleGoBackArrowClick = () => {
    if (handleGoBack) {
      handleGoBack();
    } else {
      navigateTo(-1);
    }
  };

  const otherMenuPages = [
    {
      name: tNav("reports_button_label"),
      url: "/reports",
      icon: "activities",
    },
    {
      name: tNav("contact_us_button_label"),
      url: "/contact-us",
      icon: "comment",
    },
    {
      name: tNav("privacy_policy_button_label"),
      url: "/privacy-policy",
      icon: "document",
    },
    {
      name: tNav("terms_of_use"),
      url: "/terms-of-use",
      icon: "document",
    },
    {
      name: tNav("cookie_policy"),
      url: "/cookie-policy",
      icon: "document",
    },
    ...(providerUserGuideHref
      ? [
          {
            name: tNav("user_guide"),
            url: "/user-guide-manual",
            icon: "document",
            externalHref: providerUserGuideHref,
          },
        ]
      : []),
    {
      name: tNav("FAQ_button_label"),
      url: "/faq",
      icon: "info",
    },
  ];

  const menuPages = [
    {
      name: null,
      pages: pages.map((p) => ({ ...p })),
    },
    {
      name: tNav("application_settings"),
      pages: [
        {
          name: tNav("your_profile"),
          url: "/profile/details",
          icon: "three-people",
        },
        {
          name: tNav("notifications_settings_button_label"),
          url: "/notification-preferences",
          icon: "notifications",
        },
      ],
      hasLanguageSelector: true,
      hasDarkModeSeletor: true,
      hasAccessibilityController: true,
    },
    {
      name: tNav("other"),
      pages: otherMenuPages,
    },
  ];

  const handleLogout = useCallback(() => {
    userSvc.logout();
    const lang = localStorage.getItem("language") || "en";
    window.location.href = `/provider/${lang}/login`;
  }, []);

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
  const IS_RO_SUBDOMAIN =
    window.location.hostname === "romania.usupport.online";
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(
    !hasPassedValidation && IS_RO_SUBDOMAIN
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
          menuPages={menuPages}
          languageLabel={t("language_label")}
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
          renderNotificationsContent={renderNotificationsContent}
          renderIn="provider"
          hasThemeButton
          t={t}
          clientName={clientName}
          handleLogout={handleLogout}
        />
      )}
      <div
        className={[
          "page",
          `${additionalPadding ? "" : "page--no-additional-top-padding"}`,
          `${darkBackground ? "page--dark-background" : ""}`,
          `${classNames(classes)}`,
        ].join(" ")}
      >
        {(heading || showGoBackArrow || headingButton || headingImage) && (
          <Block classes="page__header">
            <div className="page__header__text-container">
              {showGoBackArrow && (
                <div
                  className="page__header__text-container__go-back"
                  onClick={handleGoBackArrowClick}
                >
                  <Icon name="arrow-chevron-back" size="md" color="#20809E" />
                  <p>{t("go_back")}</p>
                </div>
              )}
              {(headingImage || heading) &&
                (headingImage ? (
                  <div className="page__header__title-row">
                    <img
                      className="page__header__image"
                      src={headingImage}
                      alt=""
                    />
                    {heading ? (
                      <h1 className="page__header-heading">{heading}</h1>
                    ) : null}
                  </div>
                ) : (
                  heading && (
                    <h1 className="page__header-heading">{heading}</h1>
                  )
                ))}
            </div>
            {headingButton && (
              <div className="page__header-button-container">{headingButton}</div>
            )}
          </Block>
        )}
        {subheading && (
          <Block classes="page__subheading">
            <p className="page__subheading-text text">{subheading}</p>
          </Block>
        )}
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
          t={t}
          renderIn="provider"
          lists={footerLists}
          navigate={navigateTo}
          Link={Link}
          showSocials={false}
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
   * Use darker hero artwork at large breakpoints (see client-ui Page)
   */
  darkBackground: PropTypes.bool,

  /**
   * Heading text
   */
  heading: PropTypes.string,

  /**
   * Optional image shown beside the heading (e.g. campaign sponsor)
   */
  headingImage: PropTypes.string,

  /**
   * Subheading text
   */
  subheading: PropTypes.string,

  /**
   * Heading button
   */
  headingButton: PropTypes.node,

  /**
   * Custom handler for the go-back control (defaults to history back)
   */
  handleGoBack: PropTypes.func,

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
  darkBackground: false,
};
