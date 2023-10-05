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
} from "@USupport-components-library/src";
import { validate, validateProperty } from "@USupport-components-library/utils";
import { useGetQuestionsTags, useAddAnswerToQuestion } from "#hooks";

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
  const [data, setData] = useState({ title: "", answer: "", tags: [] });
  const [initialTagsOptions, setInitialTagsOptions] = useState([]);
  const [tags, setTags] = useState([...initialTagsOptions]);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setTags([...initialTagsOptions]);
  }, [initialTagsOptions]);

  const schema = Joi.object({
    title: Joi.string().label(t("title_error_label")),
    answer: Joi.string().label(t("answer_error_label")),
    tags: Joi.array().min(1).label(t("tags_error_label")),
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
          (initialTag) => initialTag.id === tag.id
        );
        return tagExists ? { tagId: tag.id } : { tag: tag.label, isNew: true };
      });
      const payload = {
        question_id: question.questionId,
        title: data.title,
        text: data.answer,
        tags: tagsToSend,
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
      errorMessage={errors.submit || errors.tags}
    >
      <Grid>
        <GridItem lg={6}>
          <p className="text create-response__question-text">
            {question.question}
          </p>
        </GridItem>
        <GridItem lg={6} classes="create-response__inputs-item">
          <Grid classes="create-response__inputs-item__grid">
            <GridItem md={8} lg={12}>
              <Input
                label={t("title_label") + " *"}
                placeholder={t("title_placeholder")}
                value={data.title}
                onChange={(e) => hanldeChange("title", e.currentTarget.value)}
                onBlur={() => handleBlur("title")}
                errorMessage={errors.title}
              />
            </GridItem>
            <GridItem md={8} lg={12}>
              <Textarea
                label={t("answer_label") + " *"}
                placeholder={t("answer_placeholder")}
                value={data.answer}
                onChange={(value) => hanldeChange("answer", value)}
                onBlur={() => handleBlur("answer")}
                errorMessage={errors.answer}
              />
            </GridItem>
            <GridItem md={8} lg={12}>
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
            </GridItem>
          </Grid>
        </GridItem>
      </Grid>
    </Backdrop>
  );
};
