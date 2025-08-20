import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Block,
  Grid,
  GridItem,
  CollapsibleFAQ,
  Loading,
  InputSearch,
} from "@USupport-components-library/src";
import { useTranslation } from "react-i18next";
import { useEventListener } from "#hooks";
import { cmsSvc, adminSvc } from "@USupport-components-library/services";

import "./faq.scss";

/**
 * FAQ
 *
 * FAQ block
 *
 * @return {jsx}
 */
export const FAQ = () => {
  const { i18n, t } = useTranslation("blocks", { keyPrefix: "faq" });
  const [searchQuery, setSearchQuery] = useState("");

  //--------------------- Country Change Event Listener ----------------------//
  const [currentCountry, setCurrentCountry] = useState(
    localStorage.getItem("country")
  );

  const handler = useCallback(() => {
    setCurrentCountry(localStorage.getItem("country"));
  }, []);

  // Add event listener
  useEventListener("countryChanged", handler);

  //--------------------- FAQs ----------------------//

  const getFAQIds = async () => {
    // Request faq ids from the master DB for provider platform
    const faqIds = await adminSvc.getFAQs("provider");

    return faqIds;
  };

  const faqIdsQuerry = useQuery(["faqIds", currentCountry], getFAQIds);

  const getFAQs = async () => {
    const faqs = [];

    let { data } = await cmsSvc.getFAQs({
      locale: i18n.language,
      ids: faqIdsQuerry.data,
    });

    data.data.forEach((faq) => {
      faqs.push({
        question: faq.attributes.question,
        answer: faq.attributes.answer,
      });
    });

    return faqs;
  };

  const {
    data: FAQsData,
    isLoading: FAQsLoading,
    isFetched: isFAQsFetched,
  } = useQuery(["FAQs", faqIdsQuerry.data, i18n.language], getFAQs, {
    // Run the query when the getCategories and getAgeGroups queries have finished running
    enabled: !faqIdsQuerry.isLoading && faqIdsQuerry.data?.length > 0,
  });

  const filteredFAQs = FAQsData?.filter((faq) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      faq.question.toLowerCase().includes(searchLower) ||
      faq.answer.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Block classes="faq">
      <Grid>
        <GridItem md={8} lg={12}>
          <InputSearch
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            placeholder={t("search")}
            classes="faq__search"
          />
        </GridItem>
        <GridItem md={8} lg={12}>
          {filteredFAQs && <CollapsibleFAQ data={filteredFAQs} />}
          {faqIdsQuerry.data?.length > 0 && !FAQsData && FAQsLoading && (
            <Loading />
          )}
          {(!filteredFAQs?.length && !FAQsLoading && isFAQsFetched) ||
          faqIdsQuerry.data?.length === 0 ? (
            <h3 className="page__faq__no-results">{t("no_results")}</h3>
          ) : null}
        </GridItem>
      </Grid>
    </Block>
  );
};
