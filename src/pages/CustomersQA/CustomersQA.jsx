import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { ButtonWithIcon } from "@USupport-components-library/src";

import { Page, CustomersQA as CustomersQABlock } from "#blocks";
import {
  CreateResponse,
  ArchiveQuestion,
  QuestionDetails,
  FilterQuestions,
} from "#backdrops";
import { useGetProviderData } from "#hooks";

import "./customers-qa.scss";
import { toast } from "react-toastify";

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
  const [isFilterShown, setIsFilterShown] = useState(false);
  const [filterTag, setFilterTag] = useState();

  const providerQuery = useGetProviderData()[0];
  const providerStatus = providerQuery?.data?.status;

  const openCreateRespondBackdrop = (question) => {
    if (providerStatus === "inactive") {
      toast.error(t("provider_inactive"));
      return;
    }
    setQuestion(question);
    setIsCreateResponseBackdropOpen(true);
  };

  const handleOpenArchive = (question) => {
    if (providerStatus === "inactive") {
      toast.error(t("provider_inactive"));
      return;
    }
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
    <Page
      classes="page__customers-qa"
      showGoBackArrow={false}
      heading={t("heading")}
      subheading={t("subheading")}
      headingButton={
        isFilterShown && (
          <ButtonWithIcon
            label={t("filter")}
            iconName="filter"
            iconColor="#ffffff"
            iconSize="sm"
            color="purple"
            size="sm"
            classes="page__customers-qa__filter-button"
            onClick={handleFilterTags}
          />
        )
      }
    >
      <CustomersQABlock
        handleOpenResposeBackdrop={openCreateRespondBackdrop}
        handleOpenArchive={handleOpenArchive}
        handleReadMore={handleReadMore}
        handleFilterTags={handleFilterTags}
        filterTag={filterTag}
        isFilterShown={isFilterShown}
        setIsFilterShown={setIsFilterShown}
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
          selectedTag={filterTag}
          setSelectedTag={setFilterTag}
        />
      )}
    </Page>
  );
};
