import React from "react";

import { ProviderProfile } from "./ProviderProfile";

export default {
  title: "Client UI/blocks/ProviderProfile",
  component: ProviderProfile,
  argTypes: {},
};

const Template = (props) => <ProviderProfile {...props} />;

export const Default = Template.bind({});
Default.args = {};
