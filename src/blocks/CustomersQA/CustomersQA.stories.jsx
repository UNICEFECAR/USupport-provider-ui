import React from 'react';

import { CustomersQA } from './CustomersQA';

export default {
  title: 'Provider UI/blocks/CustomersQA',
  component: CustomersQA,
  argTypes: {},
};

const Template = (props) => <CustomersQA {...props} />;

export const Default = Template.bind({});
Default.args = {};
