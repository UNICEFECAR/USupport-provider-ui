import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ProviderProfile } from "./ProviderProfile";

export default {
  title: "Client UI/pages/ProviderProfile",
  component: ProviderProfile,
  argTypes: {},
};

const Template = (props) => (
  <Router>
    <ProviderProfile {...props} />
  </Router>
);

export const Default = Template.bind({});
Default.args = {};
