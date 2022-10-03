import { apiGet } from "./apiHandlers";

// Example file with requests to the Provider API
// Make one file for each service that this app is accessing

const PROVIDER_API_ROUTE = "/provider";

export const getProvider = async () => {
  const provider = await apiGet({ path: `${PROVIDER_API_ROUTE}/` });

  return provider;
};
