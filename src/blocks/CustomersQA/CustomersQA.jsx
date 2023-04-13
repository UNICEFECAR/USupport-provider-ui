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
    { value: "unanswered", isSelected: false },
    { value: "answered", isSelected: true },
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
          <p className="text">{t("no_results_found")}</p>
        </GridItem>
      );
    }

    return questionsQuery.data.map((question, index) => {
      if (filterTag) {
        const tags = question.tags;
        if (!tags.includes(filterTag)) {
          return null;
        }
      }

      if (searchValue) {
        if (
          !question.answerTitle.toLowerCase().includes(searchValue) &&
          !question.answerText.toLowerCase().includes(searchValue)
        )
          return null;
      }

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
