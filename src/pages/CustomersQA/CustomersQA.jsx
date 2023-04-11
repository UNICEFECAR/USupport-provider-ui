import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Block } from "@USupport-components-library/src";

import { Page, CustomersQA as CustomersQABlock } from "#blocks";
import { CreateResponse } from "#backdrops";

import "./customers-qa.scss";

/**
 * CustomersQA
 *
 * CustomersQA page
 *
 * @returns {JSX.Element}
 */
export const CustomersQA = () => {
  const { t } = useTranslation("customers-qa-page");

  const [isCreateResponseBackdropOpen, setIsCreateResponseBackdropOpen] =
    useState(false);
  const [respondQuestionId, setRespondQuestionId] = useState(null);

  const openCreateRespondBackdrop = (questionId) => {
    console.log("yes");
    setRespondQuestionId(questionId);
    setIsCreateResponseBackdropOpen(true);
  };

  console.log(isCreateResponseBackdropOpen);

  return (
    <Page classes="page__customers-qa" showGoBackArrow={false}>
      <Block classes="page__customers-qa__heading">
        <h3>{t("heading")}</h3>
        <p className="text page__customers-qa__heading__subheading">
          {t("subheading")}
        </p>
      </Block>
      <CustomersQABlock handleOpenResposeBackdrop={openCreateRespondBackdrop} />
      {isCreateResponseBackdropOpen && (
        <CreateResponse
          isOpen={isCreateResponseBackdropOpen}
          onClose={() => setIsCreateResponseBackdropOpen(false)}
          questionId={respondQuestionId}
        />
      )}
    </Page>
  );
};
