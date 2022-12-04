import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, NavLink, Link } from "react-router-dom";
import {
  Navbar,
  CircleIconButton,
  Footer,
  Icon,
} from "@USupport-components-library/src";
import { countrySvc, languageSvc } from "@USupport-components-library/services";
import { getCountryFromTimezone } from "@USupport-components-library/utils";
import { useIsLoggedIn } from "#hooks";
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
  classes,
  children,
}) => {
  const navigateTo = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation("page");
  const isLoggedIn = useIsLoggedIn();
  const isNavbarShown = showNavbar !== null ? showNavbar : isLoggedIn;
  const isFooterShown = showFooter !== null ? showFooter : isLoggedIn;

  const localStorageCountry = localStorage.getItem("country");
  const localStorageLanguage = localStorage.getItem("language");
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorageLanguage ? { value: localStorageLanguage.toUpperCase() } : null
  );
  const [selectedCountry, setSelectedCountry] = useState();

  const fetchCountries = async () => {
    const res = await countrySvc.getActiveCountries();
    const usersCountry = getCountryFromTimezone();
    const validCountry = res.data.find((x) => x.alpha2 === usersCountry);
    let hasSetDefaultCountry = false;
    const countries = res.data.map((x) => {
      const countryObject = {
        value: x.alpha2,
        label: x.name,
        countryID: x["country_id"],
        iconName: x.alpha2,
      };

      if (localStorageCountry === x.alpha2) {
        setSelectedCountry(countryObject);
      } else if (!localStorageCountry) {
        if (validCountry?.alpha2 === x.alpha2) {
          hasSetDefaultCountry = true;
          localStorage.setItem("country", x.alpha2);
          setSelectedCountry(countryObject);
        }
      }

      return countryObject;
    });

    if (!hasSetDefaultCountry && !localStorageCountry) {
      localStorage.setItem("country", kazakhstanCountry.value);
      localStorage.setItem(
        "country_id",
        countries.find((x) => x.value === kazakhstanCountry.value).countryID
      );
    }

    return countries;
  };

  const fetchLanguages = async () => {
    const res = await languageSvc.getActiveLanguages();
    const languages = res.data.map((x) => {
      const languageObject = {
        value: x.alpha2,
        label: x.name,
        id: x["language_id"],
      };
      if (localStorageLanguage === x.alpha2) {
        setSelectedLanguage(languageObject);
        i18n.changeLanguage(localStorageLanguage);
      } else if (!localStorageLanguage) {
        localStorage.setItem("language", "en");
        i18n.changeLanguage("en");
      }
      return languageObject;
    });
    return languages;
  };

  const { data: countries } = useQuery(["countries"], fetchCountries);
  const { data: languages } = useQuery(["languages"], fetchLanguages);

  const image = useQuery(
    ["provider-image"],
    async () => {
      const data = queryClient.getQueryData(["provider-data"]);
      if (!data) {
        queryClient.invalidateQueries({ queryKey: ["provider-data"] });
      }
      await new Promise((resolve) => resolve());
      return data?.image || "default";
    },
    {
      initialData: "default",
    }
  );

  const pages = [
    { name: t("page_1"), url: "/dashboard", exact: true },
    { name: t("page_2"), url: "/calendar" },
    { name: t("page_3"), url: "/activity-history" },
    // TODO: bring it back once the informaiton portal is ready
    // { name: "Information portal", url: "/information-portal" },
    { name: t("page_4"), url: "/consultations" },
    { name: t("page_5"), url: "/clients" },
  ];

  const footerLists = {
    list1: [
      { name: t("footer_1"), url: "/dashboard" },
      { name: t("footer_2"), url: "/calendar" },
      { name: t("footer_3"), url: "/activity-history" },
      { name: t("footer_4"), url: "/consultations" },
    ],
    list2: [
      { name: t("footer_5"), url: "/clients", exact: true },
      { name: t("footer_6"), url: "/terms-of-use" },
      { name: t("footer_7"), url: "/privacy-policy" },
      { name: t("footer_8"), url: "/cookie-policy" },
    ],
    list3: [
      { value: "+359 888 888 888", iconName: "call-filled", onClick: "phone" },
      {
        value: `ul. "Oborishte" 5, ет. 3, 1504 Sofia `,
        iconName: "pin",
      },
      {
        value: "usupport@7digit.io",
        iconName: "mail-filled",
        onClick: "mail",
      },
    ],
  };

  return (
    <>
      {isNavbarShown === true && (
        <Navbar
          pages={pages}
          showProfile
          yourProfileText={t("your_profile_text")}
          i18n={i18n}
          image={image?.data || "default"}
          navigate={navigateTo}
          NavLink={NavLink}
          countries={countries}
          languages={languages}
          initialCountry={selectedCountry}
          initialLanguage={selectedLanguage}
        />
      )}
      <div
        className={[
          "page",
          `${additionalPadding ? "" : "page--no-additional-top-padding"}`,
          `${classNames(classes)}`,
        ].join(" ")}
      >
        {(heading || showGoBackArrow || headingButton) && (
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
            {heading && <h3 className="page__header-heading">{heading}</h3>}
            {headingButton && headingButton}
          </div>
        )}
        <p className="page__subheading-text text">{subheading}</p>
        {children}
      </div>
      {showEmergencyButton && (
        <CircleIconButton
          iconName="phone-emergency"
          classes="page__emergency-button"
          onClick={() => navigateTo("/sos-center")}
          label={t("emergency_button")}
        />
      )}
      {isFooterShown && (
        <Footer
          lists={footerLists}
          contactUsText={t("contact_us")}
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
