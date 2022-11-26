import { useMutation } from "@tanstack/react-query";
import { useError } from "#hooks";
import { providerSvc } from "@USupport-components-library/services";

export default function useSuggestConsultation(onSuccess, onError) {
  const suggestConsultation = async (consultationId) => {
    const res = await providerSvc.suggestConsultation(consultationId);
    return res.data;
  };
  const suggestConsultationMutation = useMutation(suggestConsultation, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return suggestConsultationMutation;
}

export { useSuggestConsultation };
