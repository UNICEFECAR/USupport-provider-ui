import React, { useEffect, useState } from "react";
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

const IS_DEV = process.env.NODE_ENV === "development";

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

  const [isInWelcome, setIsInWelcome] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const token = localStorage.getItem("token");
      // If the page is being refreshed, do nothing
      if (!(performance.getEntriesByType("navigation")[0].type === "reload")) {
        if (!IS_DEV && token && !isInWelcome) {
          e.preventDefault();
          e.returnValue = "";
          userSvc.logout();
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isInWelcome]);

  useEffect(() => {
    // Changing the language only does a history.replaceState, so the react-query
    // cache survives it. Every request sends the language as a header, so the
    // cached entries hold data for the previous language and have to be refetched.
    const handleLanguageChanged = () => {
      queryClient.invalidateQueries({
        // The country and language lists are the same in every language and
        // refetching them here would race with the URL update in the navbar
        predicate: ({ queryKey }) =>
          queryKey[0] !== "countries" && queryKey[0] !== "languages",
      });
    };

    window.addEventListener("languageChanged", handleLanguageChanged);

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChanged);
    };
  }, []);
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isInWelcome, setIsInWelcome }}
    >
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
