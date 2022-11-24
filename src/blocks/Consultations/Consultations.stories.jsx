import React from 'react';

import { Consultations } from './Consultations';

export default {
  title: 'Provider UI/blocks/Consultations',
  component: Consultations,
  argTypes: {},
};

const Template = (props) => <Consultations {...props} />;

export const Default = Template.bind({});
Default.args = {};
