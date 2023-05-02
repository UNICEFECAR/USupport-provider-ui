import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";

export function useArchiveQuestion(onSuccess) {
  /**
   *
   * @returns
   */

  const archiveQuestion = async (data) => {
    const response = await providerSvc.archiveQuestion(data);
    return response.data;
  };

  const archiveQuestionMutation = useMutation(archiveQuestion, {
    onSuccess: onSuccess,
  });

  return archiveQuestionMutation;
}
