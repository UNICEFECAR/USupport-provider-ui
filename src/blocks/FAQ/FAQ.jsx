import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Block,
  Grid,
  GridItem,
  CollapsibleFAQ,
  Loading,
} from "@USupport-components-library/src";
import { useTranslation } from "react-i18next";
import { getFilteredData } from "@USupport-components-library/utils";

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
  const { i18n, t } = useTranslation("faq");

  const getFAQs = async () => {
    // Request faq ids from the master DB based for provider platform
    const faqIds = await adminSvc.getFAQs("provider");

    console.log("FAQ ids", faqIds);

    let { data } = await cmsSvc.getFAQs("all", true, faqIds);

    data = getFilteredData(data, i18n.language);

    const faqs = [];
    data.forEach((faq) => {
      faqs.push({
        question: faq.attributes.question,
        answer: faq.attributes.answer,
      });
    });

    console.log(faqs);
    return faqs;
  };

  const {
    data: FAQsData,
    isLoading: FAQsLoading,
    isFetched: isFAQsFetched,
  } = useQuery(["FAQs", i18n.language], getFAQs);

  return (
    <Block classes="faq">
      <Grid>
        <GridItem md={8} lg={12}>
          {FAQsData && <CollapsibleFAQ data={FAQsData} />}
          {!FAQsData && FAQsLoading && <Loading />}
          {!FAQsData?.length && !FAQsLoading && isFAQsFetched && (
            <h3 className="faq__no-results">{t("no_results")}</h3>
          )}
        </GridItem>
      </Grid>
    </Block>
  );
};
