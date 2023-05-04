import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  Backdrop,
  DropdownWithLabel,
  Loading,
} from "@USupport-components-library/src";
import { useGetQuestionsTags } from "#hooks";

import "./filter-questions.scss";

/**
 * FilterQuestions
 *
 * The FilterQuestions backdrop
 *
 * @return {jsx}
 */
export const FilterQuestions = ({
  isOpen,
  onClose,
  selectedTag,
  setSelectedTag,
}) => {
  const { t } = useTranslation("filter-questions");

  const [tags, setTags] = useState([]);
  const [tag, setTag] = useState(null);

  useEffect(() => {
    if (selectedTag) {
      setTag(selectedTag);
    }
  }, []);

  const onSuccess = (data) => {
    setTags(data);
  };
  const tagsQuery = useGetQuestionsTags(onSuccess);

  const resetFilters = () => {
    setSelectedTag(null);
    onClose();
  };

  const handleSaveFilter = () => {
    setSelectedTag(tag);
    onClose();
  };

  return (
    <Backdrop
      classes="filter-questions"
      title="FilterQuestions"
      isOpen={isOpen}
      onClose={onClose}
      heading={t("heading")}
      ctaLabel={t("cta_label")}
      ctaHandleClick={handleSaveFilter}
      secondaryCtaLabel={t("secondary_cta_label")}
      secondaryCtaType="secondary"
      secondaryCtaHandleClick={resetFilters}
    >
      {tagsQuery.isLoading ? (
        <Loading />
      ) : (
        <div className="filter-questions__dropdown-wrapper">
          <DropdownWithLabel
            label={t("dropdown_label")}
            options={tags.map((x) => {
              return { value: x.id, ...x };
            })}
            selected={tags.find((x) => x.label === tag)?.id}
            classes="filter-questions__dropdown"
            setSelected={(value) => {
              setTag(tags?.find((x) => x.id === value).label);
            }}
          />
        </div>
      )}
    </Backdrop>
  );
};
