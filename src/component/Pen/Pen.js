import React, { useEffect, useState } from 'react';
import useStore from '../../store';
import { baseImagePath } from '../../utils/utility';
import Button from '../shared/Button';
import CustomiseModal from './CustomiseModal';

const Pen = () => {
  const getPenActions = useStore(state => state.getPenActions)
  const [buttonType, setButtonType] = useState('');
  const handleToolTip = useStore(state => state.setToolTip);
  handleToolTip({ visible: false })

  useEffect(() => {
    getPenActions()
  }, [])

  const toggleButton = type => {
    if (buttonType === type) {
      setButtonType('');
    } else {
      setButtonType(type);
    }
  };

  return (
    <div className="pen-customise-container">
      <img
        className="pen-graphic"
        src={baseImagePath('thumbnails/pen_graphic.png')}
        alt="pen graphic"
      />
      <div className="pen-button-circle">
        <Button
          label="Button"
          color="neutral"
          handleClick={() => toggleButton('barrel')}
          style={{
            marginTop: '20px',
            marginLeft: '25px',
            backgroundColor: buttonType === 'barrel' && '#C2F056',
          }}
        />
      </div>
      <div className="pen-end-circle">
        <Button
          label="End"
          color="neutral"
          handleClick={() => toggleButton('eraser')}
          style={{
            marginLeft: '25px',
            backgroundColor: buttonType === 'eraser' && '#C2F056',
          }}
        />
      </div>
      {buttonType !== '' && <CustomiseModal type={buttonType} />}
    </div>
  );
};

export default Pen;
