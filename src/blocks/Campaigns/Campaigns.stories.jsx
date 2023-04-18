import React from 'react';

import { Campaigns } from './Campaigns';

export default {
  title: 'Provider UI/blocks/Campaigns',
  component: Campaigns,
  argTypes: {},
};

const Template = (props) => <Campaigns {...props} />;

export const Default = Template.bind({});
Default.args = {};
