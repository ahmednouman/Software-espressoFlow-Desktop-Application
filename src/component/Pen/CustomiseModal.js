import React, { useState } from 'react';
import useStore from '../../store';
import Radio from '../shared/Radio';

const CustomiseModal = ({ type }) => {
  const penActions = useStore(state => state.penActions)
  const [buttonAction, setButtonAction] = useState(penActions.barrel);
  const [endAction, setEndAction] = useState(penActions.eraser);
  const setPenAction = useStore(state => state.setPenAction)


  const handleChange = (e, type) => {
    e.stopPropagation();

    if (type === 'barrel') {
      setButtonAction(e.target.value);
    } else if (type === 'eraser') {
      setEndAction(e.target.value);
    }

    setPenAction({
      type,
      action: e.target.value
    })

  };
  return (
    <div className="pen-customise-modal">
      {type === 'barrel' && (
        <>
          <div className="header">
            <h5>Customize Button</h5>
          </div>

          <p>Single click</p>

          <div
            className="radio-wrapper"
            style={{
              backgroundColor:
                buttonAction === 'context' && '#C2F056',
            }}
          >
            <Radio
              label="espresso context menu"
              name="customise-button"
              value="context"
              handleChange={e => handleChange(e, 'barrel')}
              checked={buttonAction === 'context'}
            />
          </div>
          <div
            className="radio-wrapper"
            style={{
              backgroundColor:
                buttonAction === 'system' && '#C2F056',
            }}
          >
            <Radio
              label="System context menu"
              name="customise-button"
              value="system"
              handleChange={e => handleChange(e, 'barrel')}
              checked={buttonAction === 'system'}
            />
          </div>
          {/* <div
            className="radio-wrapper"
            style={{
              backgroundColor: buttonAction === 'switch-eraser' && '#C2F056',
            }}
          >
            <Radio
              label="Switch between and eraser"
              name="customise-button"
              value="switch-eraser"
              handleChange={e => handleChange(e, 'button')}
            />
          </div> */}
          <div
            className="radio-wrapper"
            style={{
              backgroundColor: buttonAction === 'none' && '#C2F056',
            }}
          >
            <Radio
              label="No action"
              name="customise-button"
              value="none"
              handleChange={e => handleChange(e, 'barrel')}
              checked={buttonAction === 'none'}
            />
          </div>
        </>
      )}

      {type === 'eraser' && (
        <>
          <div className="header">
            <h5>Customize End</h5>
          </div>

          {/* <div
            className="radio-wrapper"
            style={{
              backgroundColor: endAction === 'pan' && '#C2F056',
              marginTop: '10px',
            }}
          >
            <Radio
              label="Pan"
              name="customise-end"
              value="pan"
              handleChange={e => handleChange(e, 'eraser')}
            />
          </div> */}
          <div
            className="radio-wrapper"
            style={{
              backgroundColor: endAction === 'undo' && '#C2F056',
              marginTop: '6px'
            }}
          >
            <Radio
              label="Undo"
              name="customise-end"
              value="undo"
              handleChange={e => handleChange(e, 'eraser')}
              checked={endAction === 'undo'}
            />
          </div>
          {/* <div
            className="radio-wrapper"
            style={{
              backgroundColor: endAction === 'none' && '#C2F056',
            }}
          >
            <Radio
              label="No action"
              name="customise-end"
              value="none"
              handleChange={e => handleChange(e, 'eraser')}
            />
          </div> */}
        </>
      )}
    </div>
  );
};

export default CustomiseModal;
