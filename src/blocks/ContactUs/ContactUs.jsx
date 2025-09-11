import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCustomNavigate as useNavigate } from "#hooks";
import {
  Block,
  DropdownWithLabel,
  Textarea,
  Grid,
  GridItem,
  Button,
  Modal,
} from "@USupport-components-library/src";
import { validate } from "@USupport-components-library/utils";
import { useSendIssueEmail, useGetProviderData } from "#hooks";
import Joi from "joi";

import "./contact-us.scss";

const initialData = {
  issue: null,
  message: "",
};

/**
 * ContactUs
 *
 * Contact us form block
 *
 * @return {jsx}
 */
export const ContactUs = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("blocks", { keyPrefix: "contact-us-block" });

  const IS_PL = localStorage.getItem("country") === "PL";

  const initialIssues = IS_PL
    ? [
        { value: "pl-1", label: "contact_reason_1_pl" },
        { value: "pl-2", label: "contact_reason_2_pl" },
        { value: "pl-3", label: "contact_reason_3_pl" },
        { value: "pl-4", label: "contact_reason_4_pl" },
        { value: "pl-5", label: "contact_reason_5_pl" },
        { value: "pl-6", label: "contact_reason_6_pl" },
        { value: "pl-7", label: "contact_reason_7_pl" },
      ]
    : [
        { value: "information", label: "contact_reason_1" },
        { value: "technical-problem", label: "contact_reason_2" },
        // { value: "join-as-provider", label: "contact_reason_3" },
        { value: "partnerships", label: "contact_reason_4" },
        { value: "other", label: "contact_reason_5" },
      ];

  const [data, setData] = useState({ ...initialData });
  const [issues, setIssues] = useState([...initialIssues]);
  const [errors, setErrors] = useState({});
  const [canSubmit, setCanSubmit] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [providerDataQuery] = useGetProviderData();

  const schema = Joi.object({
    issue: Joi.string().label(t("issue_error")),
    message: Joi.string().min(5).label(t("message_error")),
  });

  useEffect(() => {
    if (data.message !== "" && data.issue) {
      setCanSubmit(true);
    } else {
      setCanSubmit(false);
    }
  }, [data]);

  const handleModalSuccessCtaClick = () => {
    navigate("/dashboard");
  };

  const closeSuccessModal = () => setIsSuccessModalOpen(false);

  const handleChange = (field, value) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const handleIssueChange = (issue) => {
    const issuesCopy = [...issues];
    for (let i = 0; i < issuesCopy.length; i++) {
      if (issuesCopy[i].value === issue) {
        issuesCopy[i].selected = true;
      } else {
        issuesCopy[i].selected = false;
      }
    }
    setIssues(issuesCopy);
    setData({
      ...data,
      issue,
    });
  };

  const onSendEmailSuccess = () => {
    setIsSuccessModalOpen(true);
    setData({ ...initialData });
  };
  const onSendEmailError = (error) => {
    setErrors({ submit: error });
  };
  const sendIssueEmailMutation = useSendIssueEmail(
    onSendEmailSuccess,
    onSendEmailError
  );

  const handleSubmit = async () => {
    const dataToValidate = {
      issue: data.issue,
      message: data.message,
    };
    if ((await validate(dataToValidate, schema, setErrors)) === null) {
      const payload = {
        subjectValue: data.issue,
        subjectLabel: t("contact_form"),
        title: t(issues.find((x) => x.value === data.issue)?.label),
        text: data.message,
        email: providerDataQuery.data.email,
      };
      sendIssueEmailMutation.mutate(payload);
    }
  };

  return (
    <Block classes="contact-us">
      <Grid classes="contact-us__grid" xs={4} md={8} lg={12}>
        <GridItem xs={4} md={8} lg={12}>
          <DropdownWithLabel
            label={t("issue")}
            errorMessage={errors.issue}
            classes="contact-us__issue-input"
            options={issues.map((x) => ({
              ...x,
              label: t(x.label),
            }))}
            selected={data.issue}
            setSelected={handleIssueChange}
          />
        </GridItem>
        <GridItem
          classes="contact-us__grid__textarea-item"
          xs={4}
          md={8}
          lg={12}
        >
          <Textarea
            label={t("message")}
            placeholder={t("message_placeholder")}
            onChange={(value) => handleChange("message", value)}
            errorMessage={errors.message}
            classes="contact-us__message-input"
            value={data.message}
          />
        </GridItem>

        <GridItem xs={4} md={8} lg={12}>
          <Button
            classes="contact-us__grid__button"
            size="lg"
            label={t("button")}
            type="primary"
            color="green"
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={sendIssueEmailMutation.isLoading}
          />
        </GridItem>
      </Grid>
      <Modal
        isOpen={isSuccessModalOpen}
        closeModal={closeSuccessModal}
        heading={t("modal_title")}
        text={t("modal_text")}
        ctaLabel={t("modal_cta_label")}
        ctaHandleClick={handleModalSuccessCtaClick}
      />
    </Block>
  );
};
