import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Scheduler } from './Scheduler';

export default {
    title: 'Provider UI/pages/Scheduler',
    component: Scheduler,
    argTypes: {},
};

const Template = (props) => <Router><Scheduler {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
