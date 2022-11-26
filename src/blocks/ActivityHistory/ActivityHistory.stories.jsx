import React from 'react';

import { ActivityHistory } from './ActivityHistory';

export default {
  title: 'Provider UI/blocks/ActivityHistory',
  component: ActivityHistory,
  argTypes: {},
};

const Template = (props) => <ActivityHistory {...props} />;

export const Default = Template.bind({});
Default.args = {};
