import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import { Root } from "./routes";
import "react-toastify/dist/ReactToastify.css";

import "./App.scss";

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
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

  return (
    <QueryClientProvider client={queryClient}>
      <Root />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
