import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import Joi from "joi";

import {
  Backdrop,
  Grid,
  GridItem,
  Input,
  Textarea,
  InputWithDropdown,
  DropdownWithLabel,
  Error,
} from "@USupport-components-library/src";
import { validate, validateProperty } from "@USupport-components-library/utils";
import {
  useGetQuestionsTags,
  useAddAnswerToQuestion,
  useGetLanguages,
} from "#hooks";

import "./create-response.scss";

/**
 * CreateResponse
 *
 * The CreateResponse backdrop
 *
 * @return {jsx}
 */
export const CreateResponse = ({ isOpen, onClose, question }) => {
  const { t } = useTranslation("create-response");
  const queryClient = useQueryClient();

  const onSuccess = (data) => {
    setInitialTagsOptions(data);
  };
  useGetQuestionsTags(onSuccess);

  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    title: "",
    answer: "",
    tags: [],
    languageId: "",
  });
  const [initialTagsOptions, setInitialTagsOptions] = useState([]);
  const [tags, setTags] = useState([...initialTagsOptions]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setTags([...initialTagsOptions]);
  }, [initialTagsOptions]);

  const { data: languages, isLoading: languagesLoading } = useGetLanguages();

  const schema = Joi.object({
    title: Joi.string().label(t("title_error_label")),
    answer: Joi.string().label(t("answer_error_label")),
    tags: Joi.array().min(1).label(t("tags_error_label")),
    languageId: Joi.string().label(t("language_error_label")),
  });

  const hanldeChange = (field, value) => {
    let dataCopy = { ...data };
    dataCopy[field] = value;
    setData(dataCopy);
  };

  const handleBlur = (field) => {
    validateProperty(field, data[field], schema, setErrors);
  };

  const onSuccessMutation = () => {
    onClose();
    toast(t("response_success"));
    queryClient.invalidateQueries({ queryKey: ["getQuestions"] });
  };

  const onError = (error) => {
    const errorsCopy = { ...errors };
    errorsCopy.submit = error;
    setErrors(errorsCopy);
  };

  const addAnswerMutation = useAddAnswerToQuestion(onSuccessMutation, onError);

  const handleSendAnswer = async () => {
    const dataCopy = { ...data };
    dataCopy.tags = [...selectedTags];
    setData(dataCopy);

    if ((await validate(dataCopy, schema, setErrors)) === null) {
      const tagsToSend = dataCopy.tags.map((tag) => {
        const tagExists = initialTagsOptions.find(
          (initialTag) =>
            initialTag.id === tag.id || initialTag.label === tag.label.trim()
        );
        return tagExists
          ? { tagId: tagExists.id }
          : { tag: tag.label, isNew: true };
      });

      const payload = {
        question_id: question.questionId,
        title: data.title,
        text: data.answer,
        tags: tagsToSend,
        languageId: data.languageId,
      };
      addAnswerMutation.mutate(payload);
    }
  };

  return (
    <Backdrop
      classes="create-response"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("cta_label")}
      ctaHandleClick={handleSendAnswer}
      isCtaLoading={addAnswerMutation.isLoading}
      errorMessage={errors.submit}
    >
      <Grid>
        <GridItem md={8} lg={12}>
          <p className="text create-response__question-text">
            {question.question}
          </p>
        </GridItem>
        <GridItem md={8} lg={12} classes="create-response__inputs-item">
          <Grid classes="create-response__inputs-item__grid">
            <GridItem md={4} lg={6}>
              <Input
                label={t("title_label") + " *"}
                placeholder={t("title_placeholder")}
                value={data.title}
                onChange={(e) => hanldeChange("title", e.currentTarget.value)}
                onBlur={() => handleBlur("title")}
                errorMessage={errors.title}
              />
              <Textarea
                classes="create-response__textarea"
                label={t("answer_label") + " *"}
                placeholder={t("answer_placeholder")}
                value={data.answer}
                onChange={(value) => hanldeChange("answer", value)}
                onBlur={() => handleBlur("answer")}
                errorMessage={errors.answer}
              />
            </GridItem>
            <GridItem md={4} lg={6}>
              <InputWithDropdown
                label={t("tags_label") + " *"}
                options={tags}
                setOptions={setTags}
                selectedOptions={selectedTags}
                setSelectedOptions={setSelectedTags}
                initialOptions={initialTagsOptions}
                classes="create-response__tags"
                t={t}
              />
              <Error message={errors.tags} />

              <DropdownWithLabel
                options={
                  languages?.map((x) => ({
                    value: x.language_id,
                    label: x.local_name,
                  })) || []
                }
                selected={data.languageId}
                setSelected={(lang) => {
                  hanldeChange("languageId", lang);
                }}
                label={t("language")}
              />
              <Error message={errors.languageId} />
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </Backdrop>
  );
};
