import React from 'react';

import { Dashboard } from './Dashboard';

export default {
  title: 'Provider UI/blocks/Dashboard',
  component: Dashboard,
  argTypes: {},
};

const Template = (props) => <Dashboard {...props} />;

export const Default = Template.bind({});
Default.args = {};
