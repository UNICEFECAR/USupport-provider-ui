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

  useEffect(() => {
    if (!IS_DEV) {
      window.addEventListener("beforeunload", (e) => {
        if (
          !(performance.getEntriesByType("navigation")[0].type === "reload")
        ) {
          // If the page is being refreshed, do nothing
          e.preventDefault();
          userSvc.logout();
        }
      });
    }
  }, []);

  const [theme, setTheme] = useState("light");

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
