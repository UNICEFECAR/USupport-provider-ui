import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  Tabs,
  Loading,
  Answer,
  ButtonWithIcon,
  InputSearch,
} from "@USupport-components-library/src";

import { useGetQuestions } from "#hooks";

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
  handleFilterTags,
  filterTag,
}) => {
  const { t } = useTranslation("customers-qa");

  const [tabs, setTabs] = useState([
    { value: "unanswered", isSelected: true },
    { value: "answered", isSelected: false },
    { value: "self_answered", isSelected: false },
  ]);
  const [searchValue, setSearchValue] = useState("");

  const questionsQuery = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value
  );

  const renderQuestions = () => {
    if (questionsQuery.data.length === 0) {
      return (
        <GridItem md={8} lg={12}>
          <p className="text">{t("no_questions_found")}</p>
        </GridItem>
      );
    }
    const filteredQuestions = questionsQuery.data.filter((question) => {
      if (filterTag) {
        const tags = question.tags;
        if (!tags.includes(filterTag)) {
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
          <p>{t("no_questions_found")}</p>
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
  };

  return (
    <Block classes="customers-qa">
      <Grid>
        <GridItem md={8} lg={12}>
          <div className="customers-qa__search-input-container">
            <InputSearch
              placeholder={t("search_placeholder")}
              value={searchValue}
              onChange={(value) => setSearchValue(value.toLowerCase())}
            />
            <ButtonWithIcon
              label={t("filter")}
              iconName="filter"
              iconColor="#ffffff"
              iconSize="sm"
              color="purple"
              size="xs"
              classes="customers-qa__search-input-container__button"
              onClick={handleFilterTags}
            />
          </div>
        </GridItem>
        <GridItem md={8} lg={12}>
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
