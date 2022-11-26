import { useMutation } from "@tanstack/react-query";
import { providerSvc } from "@USupport-components-library/services";
import { useError } from "./useError";

/**
 *
 * @param {function} onSuccess
 * @param {function} onError
 */
export default function useBlockSlot(onSuccess, onError) {
  /**
   * @param {string} clientId either the clientId or the providerId
   * @param {number} slot the timestamp of the slot
   * @returns {Promise} resolving to the "consultation_id"
   */
  const blockSlot = async (data) => {
    let response;
    response = await providerSvc.blockSlot(data.clientId, null, data.slot);

    return response.data.consultation_id;
  };

  const blockSlotMutation = useMutation(blockSlot, {
    onSuccess,
    onError: (error) => {
      const { message: errorMessage } = useError(error);
      onError(errorMessage);
    },
  });

  return blockSlotMutation;
}

export { useBlockSlot };
