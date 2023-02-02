import React from 'react';

const SwitchItem = ({

  toggleFunction,
  initialState,
  labelColor,
  style = '',
  disabled = false,
  children
}) => {
  const updateChecked = value => {
    toggleFunction(value);
  };

  return (
    <div
      style={{
        ...style,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '16px',
      }}
      className=""
    >
      <span
        style={{
          color: labelColor,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {children}

      </span>
      <div className="eq_as_switch" style={{ opacity: disabled ? '50%' : '100% ' }}>
        <input type="checkbox" hidden="hidden" />
        <label className="switch"></label>
      </div>
      <label className="switch" style={{ opacity: disabled ? '50%' : '100% ' }}>
        <input
          type="checkbox"
          checked={initialState}
          onChange={e => updateChecked(e.target.checked)}
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default SwitchItem;
