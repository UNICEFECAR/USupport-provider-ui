import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { CustomersQA } from './CustomersQA';

export default {
    title: 'Provider UI/pages/CustomersQA',
    component: CustomersQA,
    argTypes: {},
};

const Template = (props) => <Router><CustomersQA {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
