import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Clients } from './Clients';

export default {
    title: 'Provider UI/pages/Clients',
    component: Clients,
    argTypes: {},
};

const Template = (props) => <Router><Clients {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
