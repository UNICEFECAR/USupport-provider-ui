import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Block } from "@USupport-components-library/src";

import { Page, CustomersQA as CustomersQABlock } from "#blocks";
import {
  CreateResponse,
  ArchiveQuestion,
  QuestionDetails,
  FilterQuestions,
} from "#backdrops";

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
  const [question, setQuestion] = useState(null);
  const [isArchiveQuestionBackdropOpen, setIsArchiveQuestionBackdropOpen] =
    useState(false);
  const [isQuestionDetailsBackdropOpen, setIsQuestionDetailsBackdropOpen] =
    useState(false);
  const [isFilterQuestionsBackdropOpen, setIsFilterQuestionsBackdropOpen] =
    useState(false);

  const [filterTag, setFilterTag] = useState();

  const openCreateRespondBackdrop = (question) => {
    setQuestion(question);
    setIsCreateResponseBackdropOpen(true);
  };

  const handleOpenArchive = (question) => {
    setQuestion(question);
    setIsArchiveQuestionBackdropOpen(true);
  };

  const handleReadMore = (question) => {
    setQuestion(question);
    setIsQuestionDetailsBackdropOpen(true);
  };

  const handleFilterTags = () => {
    setIsFilterQuestionsBackdropOpen(true);
  };

  return (
    <Page classes="page__customers-qa" showGoBackArrow={false}>
      <Block classes="page__customers-qa__heading">
        <h3>{t("heading")}</h3>
        <p className="text page__customers-qa__heading__subheading">
          {t("subheading")}
        </p>
      </Block>
      <CustomersQABlock
        handleOpenResposeBackdrop={openCreateRespondBackdrop}
        handleOpenArchive={handleOpenArchive}
        handleReadMore={handleReadMore}
        handleFilterTags={handleFilterTags}
        filterTag={filterTag}
      />
      {isCreateResponseBackdropOpen && (
        <CreateResponse
          isOpen={isCreateResponseBackdropOpen}
          onClose={() => setIsCreateResponseBackdropOpen(false)}
          question={question}
        />
      )}
      {isArchiveQuestionBackdropOpen && (
        <ArchiveQuestion
          isOpen={isArchiveQuestionBackdropOpen}
          onClose={() => setIsArchiveQuestionBackdropOpen(false)}
          question={question}
        />
      )}
      {isQuestionDetailsBackdropOpen && (
        <QuestionDetails
          isOpen={isQuestionDetailsBackdropOpen}
          onClose={() => setIsQuestionDetailsBackdropOpen(false)}
          question={question}
          handleRespond={openCreateRespondBackdrop}
        />
      )}
      {isFilterQuestionsBackdropOpen && (
        <FilterQuestions
          isOpen={isFilterQuestionsBackdropOpen}
          onClose={() => setIsFilterQuestionsBackdropOpen(false)}
          setTag={setFilterTag}
        />
      )}
    </Page>
  );
};
