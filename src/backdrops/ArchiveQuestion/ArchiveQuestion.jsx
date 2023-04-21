import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Backdrop,
  RadioButtonGroup,
  Input,
} from "@USupport-components-library/src";
import { useArchiveQuestion } from "#hooks";

import "./archive-question.scss";

/**
 * ArchiveQuestion
 *
 * The ArchiveQuestion backdrop
 *
 * @return {jsx}
 */
export const ArchiveQuestion = ({ isOpen, onClose, question }) => {
  const { t } = useTranslation("archive-question");

  const [selectedReasonValue, setSelectedReasonValue] = useState("");
  const [inputData, setInputData] = useState("");

  const options = [
    { label: t("spam_label"), value: "spam" },
    { label: t("duplicate_label"), value: "duplicate" },
    { label: t("other_label"), value: "other" },
  ];

  const onSuccess = () => {
    onClose();
  };
  const archiveQuestionMutation = useArchiveQuestion(onSuccess);

  const handleArchive = () => {
    const payload = {
      questionId: question.questionId,
      reason: selectedReasonValue,
      additionalText: selectedReasonValue === "other" ? inputData : null,
    };
    archiveQuestionMutation.mutate(payload);
  };

  const isButtonDisabled =
    !selectedReasonValue || (selectedReasonValue === "other" && !inputData);

  return (
    <Backdrop
      classes="archive-question"
      title="ArchiveQuestion"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      text={t("subheading")}
      ctaLabel={t("cta_label")}
      ctaHandleClick={handleArchive}
      isCtaDisabled={isButtonDisabled}
    >
      <RadioButtonGroup
        options={options}
        selected={selectedReasonValue}
        setSelected={setSelectedReasonValue}
        classes="archive-question__radio-button-group"
      />
      {selectedReasonValue === "other" && (
        <Input
          placeholder={t("input_placeholder")}
          classes="archive-question__input"
          onChange={(e) => setInputData(e.currentTarget.value)}
        />
      )}
    </Backdrop>
  );
};
