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

import { cmsSvc } from "@USupport-components-library/services";

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
    const { data } = await cmsSvc.getFAQs(i18n.language, true);

    return data;
  };

  const {
    data: FAQsData,
    isLoading: FAQsLoading,
    isFetched: isFAQsFetched,
  } = useQuery(["FAQs"], getFAQs);
  return (
    <Block classes="faq">
      <Grid>
        <GridItem md={8} lg={12}>
          {FAQsData && <CollapsibleFAQ data={FAQsData} />}
          {!FAQsData && FAQsLoading && <Loading />}
          {!FAQsData && !FAQsLoading && isFAQsFetched && (
            <h3 className="faq__no-results">{t("no_results")}</h3>
          )}
        </GridItem>
      </Grid>
    </Block>
  );
};
