import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ActivityHistory } from './ActivityHistory';

export default {
    title: 'Provider UI/pages/ActivityHistory',
    component: ActivityHistory,
    argTypes: {},
};

const Template = (props) => <Router><ActivityHistory {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
