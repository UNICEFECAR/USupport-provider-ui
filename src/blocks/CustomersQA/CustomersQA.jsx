import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  Tabs,
  Answer,
  AnswerSkeleton,
  InputSearch,
  Dropdown,
  NewButton,
} from "@USupport-components-library/src";

import { useGetQuestions, useGetLanguages } from "#hooks";

import "./customers-qa.scss";

/**
 * CustomersQA
 *
 * CustomersQA block
 *
 * @return {jsx}
 */
export const CustomersQA = ({
  subheading,
  filterButtonLabel,
  handleOpenResposeBackdrop,
  handleOpenArchive,
  handleReadMore,
  handleFilterTags,
  isFilterShown,
  setIsFilterShown,
  filterTag,
}) => {
  const { t } = useTranslation("blocks", { keyPrefix: "customers-qa" });

  const [tabs, setTabs] = useState([
    { value: "unanswered", isSelected: true },
    { value: "answered", isSelected: false },
    { value: "self_answered", isSelected: false },
  ]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedLanuage, setSelectedLanguage] = useState("all");

  const { data: languages } = useGetLanguages();
  const questionsQuery = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value,
    selectedLanuage,
  );

  const languageOptions = useMemo(() => {
    const showAllOption = {
      value: "all",
      label: t("all"),
    };

    if (!languages) return [showAllOption];

    return [
      showAllOption,
      ...languages.map((x) => ({
        value: x.language_id,
        label: x.local_name,
      })),
    ];
  }, [languages, t]);

  const searchNeedle = searchValue?.toLowerCase() ?? "";

  const renderQuestions = () => {
    if (!questionsQuery.data?.length) {
      return (
        <GridItem md={8} lg={12} classes="customers-qa__no-data-item">
          <p className="text customers-qa__no-data">
            {t("no_questions_found")}
          </p>
        </GridItem>
      );
    }
    const filteredQuestions = questionsQuery.data.filter((question) => {
      if (filterTag) {
        const tags = question.tags;
        if (!tags.find((tag) => tag === filterTag)) {
          return null;
        }
      }

      if (searchNeedle) {
        if (
          !question.answerTitle?.toLowerCase().includes(searchNeedle) &&
          !question.answerText?.toLowerCase().includes(searchNeedle) &&
          !question.tags?.find((x) => x?.toLowerCase().includes(searchNeedle))
        )
          return null;
      }
      return true;
    });

    if (!filteredQuestions.length) {
      return (
        <GridItem md={8} lg={12} classes="customers-qa__no-data-item">
          <p className="text customers-qa__no-data">
            {t("no_questions_found")}
          </p>
        </GridItem>
      );
    }

    return filteredQuestions.map((question, index) => {
      return (
        <GridItem md={8} lg={6} key={index}>
          <Answer
            question={question}
            classes="customers-qa__answer"
            handleReadMore={handleReadMore}
            handleRespond={handleOpenResposeBackdrop}
            handleArchive={handleOpenArchive}
            t={t}
            renderIn="provider"
          />
        </GridItem>
      );
    });
  };

  const handleSelectTab = (index) => {
    const tabsCopy = [...tabs];

    for (let i = 0; i < tabsCopy.length; i++) {
      if (i === index) {
        tabsCopy[i].isSelected = true;
      } else {
        tabsCopy[i].isSelected = false;
      }
    }
    setTabs(tabsCopy);

    setIsFilterShown(
      tabsCopy.find((tab) => tab.isSelected).value !== "unanswered",
    );
  };

  return (
    <Block classes="customers-qa customers-qa--v1">
      <div className="customers-qa__surface">
        {subheading ? (
          <header className="customers-qa__header">
            <p className="customers-qa__header-intro">{subheading}</p>
          </header>
        ) : null}
        <div className="customers-qa__tabs">
          <Tabs
            options={tabs.map((tab) => {
              return {
                label: t(tab.value),
                value: tab.value,
                isSelected: tab.isSelected,
              };
            })}
            handleSelect={handleSelectTab}
          />
        </div>
        {isFilterShown ? (
          <div className="customers-qa__filters">
            <InputSearch
              placeholder={t("search_placeholder")}
              value={searchValue}
              onChange={(value) => setSearchValue(value)}
              classes="customers-qa__filters__search"
            />
            <div className="customers-qa__filters__controls">
              <div className="customers-qa__filters__language-dropdown">
                <Dropdown
                  options={languageOptions}
                  selected={selectedLanuage}
                  setSelected={(lang) => setSelectedLanguage(lang)}
                  placeholder={t("language")}
                />
              </div>
              <NewButton
                type="gradient"
                size="md"
                iconName="filter"
                label={filterButtonLabel}
                onClick={handleFilterTags}
                classes="customers-qa__filters__filter-btn"
              />
            </div>
          </div>
        ) : null}
        <div className="customers-qa__questions">
          {questionsQuery.isLoading ? (
            <Grid classes="customers-qa__questions-grid">
              {[0, 1, 2, 3].map((index) => (
                <GridItem key={`customers-qa-skeleton-${index}`} md={8} lg={6}>
                  <AnswerSkeleton />
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Grid classes="customers-qa__questions-grid">
              {renderQuestions()}
            </Grid>
          )}
        </div>
      </div>
    </Block>
  );
};
