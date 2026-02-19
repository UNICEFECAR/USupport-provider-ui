import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  Tabs,
  Loading,
  Answer,
  InputSearch,
  Dropdown,
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
  handleOpenResposeBackdrop,
  handleOpenArchive,
  handleReadMore,
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

  const renderQuestions = () => {
    if (questionsQuery.data.length === 0) {
      return (
        <GridItem md={8} lg={12}>
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
      const value = searchValue.toLowerCase();

      if (value) {
        if (
          !question.answerTitle?.toLowerCase().includes(value) &&
          !question.answerText?.toLowerCase().includes(value) &&
          !question.tags?.find((x) => x?.toLowerCase().includes(value))
        )
          return null;
      }
      return true;
    });

    if (!filteredQuestions.length) {
      return (
        <GridItem md={8} lg={12}>
          <p className="text customers-qa__no-data">
            {t("no_questions_found")}
          </p>
        </GridItem>
      );
    }

    return filteredQuestions.map((question, index) => {
      return (
        <GridItem md={8} lg={12} key={index}>
          <Answer
            question={question}
            classes="customers-qa__answer"
            handleReadMore={handleReadMore}
            // handleScheduleConsultationClick={handleScheduleConsultationClick}
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
    <Block classes="customers-qa">
      <Grid>
        <GridItem md={8} lg={12}>
          <Grid classes="customers-qa__tabs-grid">
            {isFilterShown && (
              <GridItem
                md={8}
                lg={12}
                classes="customers-qa__tabs-grid__search-container"
              >
                <InputSearch
                  placeholder={t("search_placeholder")}
                  value={searchValue}
                  onChange={(value) => setSearchValue(value.toLowerCase())}
                  classes="customers-qa__tabs-grid__search-container__input"
                />
                <Dropdown
                  options={languageOptions}
                  selected={selectedLanuage}
                  setSelected={(lang) => setSelectedLanguage(lang)}
                  placeholder={t("placeholder")}
                  classes="customers-qa__categories-item__language-dropdown"
                />
              </GridItem>
            )}
            <GridItem
              md={8}
              lg={12}
              classes="customers-qa__tabs-grid__filter-button-item"
            >
              <div className="customers-qa__tabs-container">
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
            </GridItem>
          </Grid>
        </GridItem>
        <GridItem md={8} lg={12}>
          {questionsQuery.isLoading ? (
            <Loading />
          ) : (
            <Grid>{renderQuestions()}</Grid>
          )}
        </GridItem>
      </Grid>
    </Block>
  );
};
