import React, { useState } from 'react';
import { Button } from '@USupport-components-library/src';

import { ArchiveQuestion } from './ArchiveQuestion';

export default {
  title: 'Client UI/backdrops/ArchiveQuestion',
  component: ArchiveQuestion,
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
      <Button label='Toggle ArchiveQuestion' onClick={handleOpen} />
      <ArchiveQuestion {...props} isOpen={isOpen} onClose={handleClose} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};
