import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Block,
  Grid,
  GridItem,
  Tabs,
  Loading,
  Answer,
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
export const CustomersQA = ({ handleOpenResposeBackdrop }) => {
  const { t } = useTranslation("customers-qa");

  const [tabs, setTabs] = useState([
    { value: "unanswered", isSelected: false },
    { value: "answered", isSelected: true },
    { value: "self_answered", isSelected: false },
  ]);

  const questionsQuery = useGetQuestions(
    tabs.find((tab) => tab.isSelected).value
  );

  const renderQuestions = () => {
    return questionsQuery.data.map((question, index) => {
      return (
        <GridItem md={8} lg={12} key={index}>
          <Answer
            question={question}
            classes="customers-qa__answer"
            // handleLike={handleLike}
            // handleReadMore={() => handleReadMore(question)}
            // handleScheduleConsultationClick={handleScheduleConsultationClick}
            handleRespond={handleOpenResposeBackdrop}
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
        <GridItem md={8} lg={12}></GridItem>
        <GridItem md={8} lg={12}>
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
