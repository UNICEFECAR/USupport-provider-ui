import React from 'react';

import { Scheduler } from './Scheduler';

export default {
  title: 'Provider UI/blocks/Scheduler',
  component: Scheduler,
  argTypes: {},
};

const Template = (props) => <Scheduler {...props} />;

export const Default = Template.bind({});
Default.args = {};
