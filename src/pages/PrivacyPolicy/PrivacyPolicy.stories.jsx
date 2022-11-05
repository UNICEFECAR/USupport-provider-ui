import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivacyPolicy } from "./PrivacyPolicy";

export default {
  title: "Provider UI/pages/PrivacyPolicy",
  component: PrivacyPolicy,
  argTypes: {},
};

// Create a react-query client
const queryClient = new QueryClient();

const Template = (props) => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <PrivacyPolicy {...props} />
    </Router>
  </QueryClientProvider>
);

export const Default = Template.bind({});
Default.args = {};
