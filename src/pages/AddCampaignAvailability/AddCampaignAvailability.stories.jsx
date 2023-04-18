import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AddCampaignAvailability } from './AddCampaignAvailability';

export default {
    title: 'Provider UI/pages/AddCampaignAvailability',
    component: AddCampaignAvailability,
    argTypes: {},
};

const Template = (props) => <Router><AddCampaignAvailability {...props} /></Router>;

export const Default = Template.bind({});
Default.args = {}; 
