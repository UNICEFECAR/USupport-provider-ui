import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Consultations } from './Consultations';

export default {
    title: 'Provider UI/pages/Consultations',
    component: Consultations,
    argTypes: {},
};

const Template = (props) => <Router><Consultations {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
