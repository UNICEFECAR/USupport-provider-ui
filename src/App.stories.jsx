import React from "react";

import App from "./App";

export default {
  title: "Provider UI/App",
  component: App,
  parameters: {
    layout: "fullscreen",
  },
};

const Template = (args) => <App {...args} />;

export const Default = Template.bind({});