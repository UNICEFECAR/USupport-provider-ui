import React from 'react';

import { SchedulerTemplate } from './SchedulerTemplate';

export default {
  title: 'Provider UI/blocks/SchedulerTemplate',
  component: SchedulerTemplate,
  argTypes: {},
};

const Template = (props) => <SchedulerTemplate {...props} />;

export const Default = Template.bind({});
Default.args = {};
