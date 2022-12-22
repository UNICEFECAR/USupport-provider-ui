import React, { useState } from 'react';
import { Button } from '@USupport-components-library/src';

import { CancelPaidConsultation } from './CancelPaidConsultation';

export default {
  title: 'Client UI/backdrops/CancelPaidConsultation',
  component: CancelPaidConsultation,
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
      <Button label='Toggle CancelPaidConsultation' onClick={handleOpen} />
      <CancelPaidConsultation {...props} isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
