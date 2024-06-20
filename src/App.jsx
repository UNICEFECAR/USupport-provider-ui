import React, { useEffect, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { Root } from "./routes";
import "react-toastify/dist/ReactToastify.css";
import { FIVE_MINUTES } from "@USupport-components-library/utils";
import { userSvc } from "@USupport-components-library/services";
import { ThemeContext } from "@USupport-components-library/utils";

import { Logger } from "twilio-video";
const logger = Logger.getLogger("twilio-video");
logger.setLevel("debug");

import "./App.scss";
import "./HackTimer.js";

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchInterval: FIVE_MINUTES, refetchOnWindowFocus: false },
  },
});

// AOS imports
import "aos/dist/aos.css";
import AOS from "aos";

function App() {
  AOS.init({
    offset: 10,
    duration: 1000,
    easing: "ease-in-sine",
    delay: 300,
    anchorPlacement: "top-bottom",
    once: false,
  });

  const getDefaultTheme = () => {
    const localStorageTheme = localStorage.getItem("default-theme");
    return localStorageTheme || "light";
  };

  const [theme, setTheme] = useState(getDefaultTheme());

  useEffect(() => {
    localStorage.setItem("default-theme", theme);
  }, [theme]);

  const logoutFunction = useCallback(() => {
    userSvc.logout();
  }, []);

  useEffect(() => {
    const existingSession = sessionStorage.getItem("userSession");

    if (!existingSession) {
      logoutFunction();
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div className={`theme-${theme}`}>
        <QueryClientProvider client={queryClient}>
          <Root />
          <ToastContainer />
        </QueryClientProvider>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
