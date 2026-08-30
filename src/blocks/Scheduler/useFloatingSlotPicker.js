import { useCallback, useEffect, useRef, useState } from "react";

import { computeFloatingPickerPosition } from "./scheduleDaySlotsShared.js";

/**
 * Fixed-position slot picker anchored to a clicked element; repositions on scroll/resize.
 */
export function useFloatingSlotPicker() {
  const anchorRef = useRef(null);
  const [activeKey, setActiveKey] = useState(null);
  const [meta, setMeta] = useState(null);
  const [position, setPosition] = useState(null);

  const close = useCallback(() => {
    anchorRef.current = null;
    setActiveKey(null);
    setMeta(null);
    setPosition(null);
  }, []);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current?.isConnected) {
      close();
      return;
    }
    setPosition(
      computeFloatingPickerPosition(anchorRef.current.getBoundingClientRect()),
    );
  }, [close]);

  const open = useCallback(
    (key, element, nextMeta = null) => {
      if (!element) return;
      if (activeKey === key) {
        close();
        return;
      }
      anchorRef.current = element;
      setActiveKey(key);
      setMeta(nextMeta);
      setPosition(
        computeFloatingPickerPosition(element.getBoundingClientRect()),
      );
    },
    [activeKey, close],
  );

  useEffect(() => {
    if (!activeKey) return undefined;

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [activeKey, updatePosition]);

  return {
    activeKey,
    meta,
    position,
    isOpen: !!activeKey && !!position,
    open,
    close,
  };
}
