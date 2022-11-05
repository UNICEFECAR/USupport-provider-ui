import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FAQ } from "./FAQ";

export default {
  title: "Provider UI/pages/FAQ",
  component: FAQ,
  argTypes: {},
};

// Create a react-query client
const queryClient = new QueryClient();

const Template = (props) => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <FAQ {...props} />
    </Router>
  </QueryClientProvider>
);

export const Default = Template.bind({});
Default.args = {};
