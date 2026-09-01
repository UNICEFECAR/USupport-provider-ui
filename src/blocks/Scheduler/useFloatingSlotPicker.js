import { useCallback, useEffect, useRef, useState } from "react";

import { computeFloatingPickerPosition } from "./scheduleDaySlotsShared.js";

/**
 * Fixed-position slot picker anchored to a clicked element; repositions on scroll/resize.
 * When closeOnScroll is true, scroll closes the picker instead of repositioning it.
 */
export function useFloatingSlotPicker({ closeOnScroll = false } = {}) {
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
    const handleScroll = closeOnScroll ? close : updatePosition;
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [activeKey, close, closeOnScroll, updatePosition]);

  return {
    activeKey,
    meta,
    position,
    isOpen: !!activeKey && !!position,
    open,
    close,
  };
}
