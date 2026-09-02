import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { DeviceTest } from "./DeviceTest";

const DeviceTestContext = createContext({ openDeviceTest: () => {} });

/**
 * DeviceTestProvider
 *
 * Renders a single DeviceTest backdrop for the whole app and exposes an
 * `openDeviceTest` callback so any consultation card can offer the
 * "test audio & camera" option without owning its own modal state.
 *
 * @return {jsx}
 */
export const DeviceTestProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openDeviceTest = useCallback(() => setIsOpen(true), []);
  const closeDeviceTest = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ openDeviceTest }), [openDeviceTest]);

  return (
    <DeviceTestContext.Provider value={value}>
      {children}
      <DeviceTest isOpen={isOpen} onClose={closeDeviceTest} />
    </DeviceTestContext.Provider>
  );
};

export const useDeviceTest = () => useContext(DeviceTestContext);
