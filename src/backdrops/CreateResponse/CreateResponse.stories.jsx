import React, { useState } from 'react';
import { Button } from '@USupport-components-library/src';

import { CreateResponse } from './CreateResponse';

export default {
  title: 'Client UI/backdrops/CreateResponse',
  component: CreateResponse,
  argTypes: {},
};

const Template = (props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button label='Toggle CreateResponse' onClick={handleOpen} />
      <CreateResponse {...props} isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
