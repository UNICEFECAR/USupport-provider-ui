import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { SchedulerTemplate } from './SchedulerTemplate';

export default {
    title: 'Provider UI/pages/SchedulerTemplate',
    component: SchedulerTemplate,
    argTypes: {},
};

const Template = (props) => <Router><SchedulerTemplate {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
