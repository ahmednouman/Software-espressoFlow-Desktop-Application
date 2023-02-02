import React from 'react';
import useStore from '../../store';
import { TextTruncate } from '../../utils/utility';

const Tooltip = () => {
  const toolTip = useStore(state => state.toolTip);

  if (toolTip.visible) {
    return (
      <div
        style={{
          //display: toolTip.visible ? 'block' : 'none',
          position: 'fixed',
          left: toolTip.size.left - 30 + 'px',
          bottom: '24.5%',
          width: '100px',
          minHeight: '25px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 12,
          fontSize: '10px',
          // backgroundColor: '#f0f0f0',
          backgroundColor: 'rgba(90, 90, 90, 1)',
          borderRadius: '6px',
          boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
          color: 'white',
        }}
        className="app-icon-detail"
      >
        {TextTruncate(toolTip.name, 12)}
      </div>
    );
  }

  return <></>;
};

export default Tooltip;
