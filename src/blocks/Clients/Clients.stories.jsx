import React from 'react';

import { Clients } from './Clients';

export default {
  title: 'Provider UI/blocks/Clients',
  component: Clients,
  argTypes: {},
};

const Template = (props) => <Clients {...props} />;

export const Default = Template.bind({});
Default.args = {};
